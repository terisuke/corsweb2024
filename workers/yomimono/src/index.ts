import type { Env } from './types';
import { verifyAccessEmail } from './auth';
import { collectTopics } from './collect';
import { generateArticle, buildMarkdown } from './generate';
import { scanForViolations } from './guardrails';
import { makeOctokit, getFileContent, commitArticle, commitImage, listArticleSlugs } from './github';
import { sanitizeText, normalizeArticle, type ArticleInput } from './validate';
import { HUB_HTML } from './ui-hub';
import { AI_HTML } from './ui-ai';
import { MANUAL_HTML } from './ui-manual';

// 管理画面は自己完結（外部リソース無し・同一オリジンfetchのみ）。
// インライン style/script のみ許可し、外部読込・iframe埋め込み・データ送信先を遮断する。
const CSP =
  "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; " +
  "img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";
// __BASE__ プレースホルダを実際のマウントパス(env.BASE_PATH)へ置換して配信。
// BASE_PATH は JS文字列(var BASE="__BASE__") と HTML属性(href="__BASE__/ai") の両方に入るため、
// パスに使う文字種のみへ正規化してから埋め込む（万一の注入を構造的に防ぐ）。
const html = (body: string, env: Env, status = 200): Response => {
  const base = (env.BASE_PATH || '').replace(/[^a-zA-Z0-9/_-]/g, '');
  return new Response(body.split('__BASE__').join(base), {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy': CSP,
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    },
  });
};

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

// JSON ボディを解析。不正JSONは null（呼び出し側で400を返し、サイレント処理を避ける）。
async function readJsonBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const data = await req.json();
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// クライアント由来の文字列配列を上限つきでサニタイズ（プロンプト注入対策）。
function sanitizeTitles(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 50).map((t) => sanitizeText(t, 200)).filter(Boolean);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    // マウントプレフィックス(/brog)を剥がして論理パスに正規化。
    // cor-jp.com/brog* ルートでは /brog/api/x → /api/x、/brog → / に変換する。
    // BASE_PATH 未設定（ルート直下=workers.dev）でもそのまま動く。
    const base = env.BASE_PATH || '';
    let path = url.pathname;
    if (base && path === base) path = '/';
    else if (base && path.startsWith(base + '/')) path = path.slice(base.length);

    if (path === '/health') return json({ ok: true });

    // 認証: Cloudflare Access の JWT を暗号検証（ヘッダ盲信はしない）
    const email = await verifyAccessEmail(req, env);
    if (!email) {
      return json({ error: '認証が必要です（Cloudflare Access / cor-jp.com のみ許可）' }, 401);
    }

    try {
      // 管理画面（凪沙さん用UI）。Access 認証済みのブラウザにHTMLを返す。
      if (req.method === 'GET' && (path === '/' || path === '/index.html')) {
        return html(HUB_HTML, env); // ハブ（AI生成 / 手動作成）
      }
      if (req.method === 'GET' && path === '/ai') {
        return html(AI_HTML, env);
      }
      if (req.method === 'GET' && path === '/manual') {
        return html(MANUAL_HTML, env);
      }

      // 既存記事スラッグ一覧（重複テーマ回避用）
      if (req.method === 'GET' && path === '/api/recent') {
        const octokit = makeOctokit(env);
        const slugs = await listArticleSlugs(env, octokit);
        return json({ slugs });
      }

      // 画像アップロード（手動エディタ用）。public/images/blog/uploads/ にコミットしURLを返す。
      if (req.method === 'POST' && path === '/api/upload-image') {
        const body = await readJsonBody(req);
        if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);
        const filename = typeof body.filename === 'string' ? body.filename : '';
        const dataBase64 = typeof body.dataBase64 === 'string' ? body.dataBase64 : '';
        if (!filename || !dataBase64) {
          return json({ error: 'filename と dataBase64 は必須です' }, 400);
        }
        if (dataBase64.length > 7_000_000) {
          return json({ error: '画像が大きすぎます（約5MBまで）' }, 413);
        }
        const octokit = makeOctokit(env);
        const result = await commitImage(env, octokit, filename, dataBase64, email);
        return json(result);
      }

      // ① 情報収集
      if (req.method === 'POST' && path === '/api/collect') {
        const body = await readJsonBody(req);
        if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);
        const candidates = await collectTopics(env, sanitizeTitles(body.recentTitles));
        return json({ candidates });
      }

      // ④ 記事生成（＋ガードレール検査結果を同梱して⑤レビューへ）
      if (req.method === 'POST' && path === '/api/generate') {
        const body = await readJsonBody(req);
        if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);
        const theme = (body.theme ?? {}) as {
          title?: unknown;
          summary?: unknown;
          sources?: unknown;
          freshnessHours?: unknown;
        };
        const title = sanitizeText(theme.title, 200);
        if (!title) return json({ error: 'theme.title は必須です' }, 400);
        const octokit = makeOctokit(env);
        const styleGuide = await getFileContent(env, octokit, env.STYLE_GUIDE_PATH);
        const { article, markdown, violations } = await generateArticle(
          env,
          {
            title,
            summary: sanitizeText(theme.summary, 500),
            sources: Array.isArray(theme.sources)
              ? theme.sources
                  .slice(0, 5)
                  .map((s) => sanitizeText(s, 300))
                  .filter((s) => /^https?:\/\//i.test(s)) // http(s) のみ（javascript: 等を排除）
              : [],
            freshnessHours: Number(theme.freshnessHours) || 0,
          },
          sanitizeTitles(body.recentTitles),
          styleGuide,
        );
        return json({ article, markdown, violations });
      }

      // ⑤ レビュー: コミットせずガードレール検査のみ（編集後の再チェック用）
      if (req.method === 'POST' && path === '/api/validate') {
        const body = await readJsonBody(req);
        if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);
        const norm = normalizeArticle(body.article as ArticleInput | undefined);
        if (!norm.ok) return json({ error: norm.error }, norm.status);
        const violations = scanForViolations(buildMarkdown(norm.article));
        return json({ violations });
      }

      // ⑥ 公開（記事botが main へコミット → 既存の静的デプロイで公開）
      if (req.method === 'POST' && path === '/api/publish') {
        const body = await readJsonBody(req);
        if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);
        const norm = normalizeArticle(body.article as ArticleInput | undefined);
        if (!norm.ok) return json({ error: norm.error }, norm.status);
        const normalized = norm.article;
        // 公開直前にもう一度ガードレールを通す（最終防衛線）
        const markdown = buildMarkdown(normalized);
        const violations = scanForViolations(markdown);
        if (violations.length > 0) {
          return json({ error: 'ガードレール違反のため公開を中止しました', violations }, 422);
        }
        const octokit = makeOctokit(env);
        const result = await commitArticle(env, octokit, normalized.slug, markdown, email);
        return json(result);
      }

      return json({ error: 'Not Found' }, 404);
    } catch (e: unknown) {
      // 詳細はサーバー側ログのみ。クライアントには汎用メッセージ（内部情報の漏洩防止）。
      console.error('yomimono error:', e);
      return json({ error: '処理中にエラーが発生しました' }, 500);
    }
  },
};
