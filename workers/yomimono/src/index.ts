import type { Collection, Env } from './types';
import {
  verifySession,
  checkPassword,
  createSessionCookie,
  clearSessionCookie,
} from './session';
import { collectTopics } from './collect';
// buildNewsMarkdown は M3 で news を有効化する際に再import（基盤関数は generate.ts に維持）
import { generateArticle, buildMarkdown, buildCasesMarkdown } from './generate';
import { scanForViolations } from './guardrails';
import {
  makeOctokit,
  getFileContent,
  commitArticle,
  commitImage,
  listArticleSlugs,
  listBlogArticles,
  readBlogArticle,
  updateBlogArticle,
} from './github';
import { rebuildBlogMarkdown } from './article-markdown';
import { assertSlug, sanitizeText, normalizeArticle, normalizeCollection, type ArticleInput } from './validate';
import { HUB_HTML } from './ui-hub';
import { AI_HTML } from './ui-ai';
import { MANUAL_HTML } from './ui-manual';
import { MANUAL_CASES_HTML } from './ui-manual-cases';
import { EDIT_HTML } from './ui-edit';
import { LOGIN_HTML } from './ui-login';
import { STYLE_GUIDE_FALLBACK } from './style-guide';

// コミット attribution（Access廃止で個人メールが無いため固定名）。
const EDITOR = 'yomimono';
const MIN_PASSWORD_LEN = 16;
// news コレクションは M3 まで公開準備中: エンドポイント層で一時拒否するメッセージ。
// 基盤関数（normalizeArticle('news') / buildNewsMarkdown / contentDir / commitArticle）は維持・M3 で有効化。
const NEWS_NOT_READY_MSG = 'news collection は現在準備中です（blog/cases のみ利用可能）';

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
const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'cache-control': 'no-store',
} as const;
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
      ...SECURITY_HEADERS,
    },
  });
};

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...SECURITY_HEADERS },
  });

// 長時間処理（AI＋web検索）向け。即座にヘッダを返し、処理中は空白を送り続けて
// Cloudflare の 524（無応答100秒）を回避する。完了時に最終行として JSON を送る。
// クライアントは本文の最終行を JSON.parse する（apiLong）。エラーも 200 のボディ内で返す。
function friendlyError(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/credit balance/i.test(m)) {
    return 'Anthropic API のクレジット残高が不足しています（コンソールでチャージしてください）';
  }
  if (/\b524\b|timeout|timed out|ETIMEDOUT/i.test(m)) {
    return 'AIの応答がタイムアウトしました。テーマを絞ってもう一度お試しください';
  }
  // callClaude / generate が投げる自前の日本語メッセージは安全なのでそのまま返す
  if (/web_search|継続上限|JSON|拒否|refusal|必須|不正|空です/.test(m)) return m;
  return '処理中にエラーが発生しました';
}

function streamJson(work: Promise<unknown>): Response {
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let done = false;
      const hb = setInterval(() => {
        if (!done) {
          try {
            controller.enqueue(enc.encode(' '));
          } catch {
            /* closed */
          }
        }
      }, 5000);
      const finish = (payload: unknown) => {
        done = true;
        clearInterval(hb);
        try {
          controller.enqueue(enc.encode('\n' + JSON.stringify(payload)));
          controller.close();
        } catch {
          /* closed */
        }
      };
      work.then(
        (result) => finish(result),
        (e) => {
          console.error('yomimono error:', e instanceof Error ? e.message : String(e));
          finish({ error: friendlyError(e) });
        },
      );
    },
  });
  return new Response(stream, {
    headers: { 'content-type': 'application/json; charset=utf-8', ...SECURITY_HEADERS },
  });
}

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
    // マウントプレフィックス(/blog-admin)を剥がして論理パスに正規化。
    // cor-jp.com/blog-admin* ルートでは /blog-admin/api/x → /api/x、/blog-admin → / に変換する。
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
          headers: { 'content-type': 'application/json; charset=utf-8', 'set-cookie': cookie, ...SECURITY_HEADERS },
        });
      }
      if (req.method === 'POST' && path === '/api/logout') {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'set-cookie': clearSessionCookie(env),
            ...SECURITY_HEADERS,
          },
        });
      }

      // --- ここから先はログインセッション必須 ---
      const authed = await verifySession(req, env);
      if (!authed) {
        // ページは /login へリダイレクト、APIは401
        if (req.method === 'GET') {
          return new Response(null, { status: 302, headers: { location: base + '/login', ...SECURITY_HEADERS } });
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
      if (req.method === 'GET' && path === '/manual/cases') {
        return html(MANUAL_CASES_HTML, env);
      }
      if (req.method === 'GET' && path === '/edit') {
        return html(EDIT_HTML, env);
      }

      // 既存記事スラッグ一覧（重複テーマ回避用）
      if (req.method === 'GET' && path === '/api/recent') {
        const collection = normalizeCollection(url.searchParams.get('collection'));
        // news は M3 まで公開準備中: エンドポイント層で空配列を返す（基盤関数は維持・M3 で有効化）
        if (collection === 'news') {
          return json({ slugs: [] });
        }
        const octokit = makeOctokit(env);
        const slugs = await listArticleSlugs(env, octokit, collection);
        return json({ slugs });
      }

      // 既存ブログ記事の一覧・読み込み・更新（M1-I3）。
      // M2/M3 の cases/news CMS とは分け、ここでは blog のみ編集対象にする。
      if (req.method === 'GET' && path === '/api/articles') {
        const collection = normalizeCollection(url.searchParams.get('collection'));
        if (collection !== 'blog') {
          return json({ error: '既存記事編集は現在 blog のみ対応しています' }, 400);
        }
        const octokit = makeOctokit(env);
        const articles = await listBlogArticles(env, octokit);
        return json({ articles });
      }

      if (req.method === 'GET' && path === '/api/article') {
        const collection = normalizeCollection(url.searchParams.get('collection'));
        if (collection !== 'blog') {
          return json({ error: '既存記事編集は現在 blog のみ対応しています' }, 400);
        }
        const slug = url.searchParams.get('slug') || '';
        if (!slug) return json({ error: 'slug は必須です' }, 400);
        try {
          assertSlug(slug);
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : 'slug が不正です' }, 400);
        }
        const octokit = makeOctokit(env);
        const file = await readBlogArticle(env, octokit, slug);
        return json({ article: file.article, sha: file.sha, path: file.path });
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

      // ① 情報収集（長時間化しうるため streamJson でハートビート送信＝524回避）
      if (req.method === 'POST' && path === '/api/collect') {
        const body = await readJsonBody(req);
        if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);
        return streamJson(
          collectTopics(env, sanitizeTitles(body.recentTitles)).then((candidates) => ({ candidates })),
        );
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
        const recentTitles = sanitizeTitles(body.recentTitles);
        const sources = Array.isArray(theme.sources)
          ? theme.sources
              .slice(0, 5)
              .map((s) => sanitizeText(s, 300))
              .filter((s) => /^https?:\/\//i.test(s)) // http(s) のみ（javascript: 等を排除）
          : [];
        // 生成は最も長くかかるため streamJson でハートビート送信（524回避）
        return streamJson(
          (async () => {
            const octokit = makeOctokit(env);
            // 文体ガイドは PUBLISH_BRANCH から取得。無い/失敗時は同梱フォールバックを使う
            // （main に docs/blog-style-guide.md が未マージでも生成できるように）。
            let styleGuide: string;
            try {
              styleGuide = await getFileContent(env, octokit, env.STYLE_GUIDE_PATH);
            } catch {
              styleGuide = STYLE_GUIDE_FALLBACK;
            }
            const { article, markdown, violations } = await generateArticle(
              env,
              { title, summary: sanitizeText(theme.summary, 500), sources, freshnessHours: Number(theme.freshnessHours) || 0 },
              recentTitles,
              styleGuide,
            );
            return { article, markdown, violations };
          })(),
        );
      }

      // ⑤ レビュー: コミットせずガードレール検査のみ（編集後の再チェック用）
      if (req.method === 'POST' && path === '/api/validate') {
        const body = await readJsonBody(req);
        if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);
        const collection = normalizeCollection(body.collection);
        // news は M3 まで一時拒否（基盤関数は維持・M3 で有効化）
        if (collection === 'news') {
          return json({ error: NEWS_NOT_READY_MSG }, 400);
        }
        const norm = normalizeArticle(body.article as ArticleInput | undefined, collection);
        if (!norm.ok) return json({ error: norm.error }, norm.status);
        const normalized = norm.article;
        // news は上で拒否済みなので blog/cases のみ（buildNewsMarkdown は M3 で有効化）
        let markdown: string;
        if (collection === 'cases') {
          markdown = buildCasesMarkdown(normalized, normalized.isDraft);
        } else {
          markdown = buildMarkdown(normalized, normalized.isDraft);
        }
        const violations = scanForViolations(markdown);
        return json({ violations });
      }

      // ⑥ 公開（記事botが main へコミット → 既存の静的デプロイで公開）
      if (req.method === 'POST' && path === '/api/publish') {
        const body = await readJsonBody(req);
        if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);
        const collection = normalizeCollection(body.collection);
        // news は M3 まで一時拒否（基盤関数は維持・M3 で有効化）
        if (collection === 'news') {
          return json({ error: NEWS_NOT_READY_MSG }, 400);
        }
        const norm = normalizeArticle(body.article as ArticleInput | undefined, collection);
        if (!norm.ok) return json({ error: norm.error }, norm.status);
        const normalized = norm.article;
        // 公開直前にもう一度ガードレールを通す（最終防衛線）
        // news は上で拒否済みなので blog/cases のみ（buildNewsMarkdown は M3 で有効化）
        let markdown: string;
        if (collection === 'cases') {
          markdown = buildCasesMarkdown(normalized, normalized.isDraft);
        } else {
          markdown = buildMarkdown(normalized, normalized.isDraft);
        }
        const violations = scanForViolations(markdown);
        if (violations.length > 0) {
          return json({ error: 'ガードレール違反のため公開を中止しました', violations }, 422);
        }
        const octokit = makeOctokit(env);
        const result = await commitArticle(env, octokit, normalized.slug, markdown, EDITOR, collection);
        return json(result);
      }

      // 既存ブログ記事の更新。同じ slug/path を sha 付きで上書きし、同時編集を検出する。
      if (req.method === 'POST' && path === '/api/update') {
        const body = await readJsonBody(req);
        if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);
        const collection = normalizeCollection(body.collection);
        if (collection !== 'blog') {
          return json({ error: '既存記事編集は現在 blog のみ対応しています' }, 400);
        }
        const sha = typeof body.sha === 'string' ? body.sha : '';
        if (!sha) return json({ error: '更新元の記事情報がありません。記事を開き直してください' }, 400);
        const norm = normalizeArticle(body.article as ArticleInput | undefined, 'blog');
        if (!norm.ok) return json({ error: norm.error }, norm.status);
        const normalized = norm.article;
        const octokit = makeOctokit(env);
        const existing = await readBlogArticle(env, octokit, normalized.slug);
        const markdown = rebuildBlogMarkdown(existing.markdown, normalized);
        const violations = scanForViolations(markdown);
        if (violations.length > 0) {
          return json({ error: 'ガードレール違反のため更新を中止しました', violations }, 422);
        }
        try {
          const result = await updateBlogArticle(env, octokit, normalized.slug, markdown, sha, EDITOR);
          return json(result);
        } catch (e: unknown) {
          if (e instanceof Error && /^記事が|^更新元/.test(e.message)) {
            return json({ error: e.message }, 409);
          }
          throw e;
        }
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
