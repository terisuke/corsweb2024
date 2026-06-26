import type { Env } from './types';
import {
  verifySession,
  checkPassword,
  createSessionCookie,
  clearSessionCookie,
} from './session';
import { collectTopics } from './collect';
import { generateArticle, buildMarkdown } from './generate';
import { scanForViolations } from './guardrails';
import { makeOctokit, getFileContent, commitArticle, commitImage, listArticleSlugs } from './github';
import { sanitizeText, normalizeArticle, type ArticleInput } from './validate';
import { HUB_HTML } from './ui-hub';
import { AI_HTML } from './ui-ai';
import { MANUAL_HTML } from './ui-manual';
import { LOGIN_HTML } from './ui-login';

// コミット attribution（Access廃止で個人メールが無いため固定名）。
const EDITOR = 'yomimono';
const MIN_PASSWORD_LEN = 16;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ログイン失敗の簡易レート制限（IP単位・isolate内メモリ。ベストエフォート）。
// 確実な対策は「高エントロピー合言葉」＋ Cloudflare WAF のレート制限ルール（README参照）。
const LOGIN_WINDOW_MS = 5 * 60 * 1000;
const LOGIN_MAX_FAILS = 8;
const loginFails = new Map<string, { n: number; until: number }>();
function isRateLimited(ip: string): boolean {
  const e = loginFails.get(ip);
  return !!e && e.until > Date.now() && e.n >= LOGIN_MAX_FAILS;
}
function recordLoginFailure(ip: string): void {
  if (loginFails.size > 5000) loginFails.clear(); // 暴走防止（best-effort）
  const now = Date.now();
  const e = loginFails.get(ip);
  if (!e || e.until < now) loginFails.set(ip, { n: 1, until: now + LOGIN_WINDOW_MS });
  else {
    e.n += 1;
    e.until = now + LOGIN_WINDOW_MS;
  }
}

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

    try {
      // --- 認証不要: ログイン画面 + ログイン/ログアウトAPI ---
      if (req.method === 'GET' && path === '/login') {
        return html(LOGIN_HTML, env);
      }
      if (req.method === 'POST' && path === '/api/login') {
        const body = await readJsonBody(req);
        if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);
        if (!env.ACCESS_PASSWORD || !env.SESSION_SECRET) {
          return json({ error: 'ログインが未設定です（管理者にお問い合わせください）' }, 503);
        }
        // 弱い合言葉を拒否（総当たり耐性。openssl rand -base64 24 等の高エントロピー必須）
        if (env.ACCESS_PASSWORD.length < MIN_PASSWORD_LEN) {
          return json({ error: 'ログイン設定が不十分です（合言葉が短すぎます。管理者にお問い合わせください）' }, 503);
        }
        // 簡易レート制限（IP単位・isolate内ベストエフォート）。本命は高エントロピー合言葉＋WAFルール。
        const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
        if (isRateLimited(ip)) {
          return json({ error: '試行回数が多すぎます。しばらく待ってから再試行してください' }, 429);
        }
        if (!(await checkPassword(env, body.password))) {
          recordLoginFailure(ip);
          await sleep(700); // 失敗時に遅延を入れ、総当たりの速度を落とす
          return json({ error: '合言葉が違います' }, 401);
        }
        const cookie = await createSessionCookie(env);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json; charset=utf-8', 'set-cookie': cookie },
        });
      }
      if (req.method === 'POST' && path === '/api/logout') {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'set-cookie': clearSessionCookie(env),
          },
        });
      }

      // --- ここから先はログインセッション必須 ---
      const authed = await verifySession(req, env);
      if (!authed) {
        // ページは /login へリダイレクト、APIは401
        if (req.method === 'GET') {
          return new Response(null, { status: 302, headers: { location: base + '/login' } });
        }
        return json({ error: 'ログインが必要です' }, 401);
      }

      // 管理画面（凪沙さん用UI）。ログイン済みのブラウザにHTMLを返す。
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
        const result = await commitImage(env, octokit, filename, dataBase64, EDITOR);
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
        const result = await commitArticle(env, octokit, normalized.slug, markdown, EDITOR);
        return json(result);
      }

      return json({ error: 'Not Found' }, 404);
    } catch (e: unknown) {
      // 詳細はサーバー側ログのみ。クライアントには汎用メッセージ（内部情報の漏洩防止）。
      // 生のエラーオブジェクトはログに出さない（ライブラリが鍵/JWTを埋め込む可能性を排除）。
      console.error('yomimono error:', e instanceof Error ? e.message : String(e));
      return json({ error: '処理中にエラーが発生しました' }, 500);
    }
  },
};
