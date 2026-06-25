import type { Env } from './types';
import { verifyAccessEmail } from './auth';
import { collectTopics } from './collect';
import { generateArticle, buildMarkdown } from './generate';
import { scanForViolations } from './guardrails';
import { makeOctokit, getFileContent, commitArticle } from './github';
import { assertSlug, normalizeCategory, sanitizeText } from './validate';

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

// クライアント由来の文字列配列を上限つきでサニタイズ（プロンプト注入対策）。
function sanitizeTitles(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 50).map((t) => sanitizeText(t, 200)).filter(Boolean);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === '/health') return json({ ok: true });

    // 認証: Cloudflare Access の JWT を暗号検証（ヘッダ盲信はしない）
    const email = await verifyAccessEmail(req, env);
    if (!email) {
      return json({ error: '認証が必要です（Cloudflare Access / cor-jp.com のみ許可）' }, 401);
    }

    try {
      // ① 情報収集
      if (req.method === 'POST' && url.pathname === '/api/collect') {
        const body = (await req.json().catch(() => ({}))) as { recentTitles?: unknown };
        const candidates = await collectTopics(env, sanitizeTitles(body.recentTitles));
        return json({ candidates });
      }

      // ④ 記事生成（＋ガードレール検査結果を同梱して⑤レビューへ）
      if (req.method === 'POST' && url.pathname === '/api/generate') {
        const body = (await req.json().catch(() => ({}))) as {
          theme?: { title?: unknown; summary?: unknown; sources?: unknown; freshnessHours?: unknown };
          recentTitles?: unknown;
        };
        const title = sanitizeText(body.theme?.title, 200);
        if (!title) return json({ error: 'theme.title は必須です' }, 400);
        const octokit = makeOctokit(env);
        const styleGuide = await getFileContent(env, octokit, env.STYLE_GUIDE_PATH);
        const { article, markdown, violations } = await generateArticle(
          env,
          {
            title,
            summary: sanitizeText(body.theme?.summary, 500),
            sources: Array.isArray(body.theme?.sources)
              ? body.theme.sources.slice(0, 5).map((s) => sanitizeText(s, 300)).filter(Boolean)
              : [],
            freshnessHours: Number(body.theme?.freshnessHours) || 0,
          },
          sanitizeTitles(body.recentTitles),
          styleGuide,
        );
        return json({ article, markdown, violations });
      }

      // ⑥ 公開（記事botが main へコミット → 既存の静的デプロイで公開）
      if (req.method === 'POST' && url.pathname === '/api/publish') {
        const body = (await req.json().catch(() => ({}))) as {
          article?: {
            slug?: string;
            title?: string;
            description?: string;
            category?: string;
            tags?: unknown;
            body?: string;
          };
        };
        const a = body.article;
        if (!a?.slug || !a?.body || !a?.title || !a?.description) {
          return json({ error: 'article.slug / title / description / body は必須です' }, 400);
        }
        // パストラバーサル防止: slug を厳格に再検証（generate と同一ルール）
        try {
          assertSlug(a.slug);
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : 'slug が不正です' }, 400);
        }
        const normalized = {
          slug: a.slug,
          title: sanitizeText(a.title, 200),
          description: sanitizeText(a.description, 500),
          category: normalizeCategory(a.category),
          tags: Array.isArray(a.tags)
            ? a.tags.slice(0, 10).map((t) => sanitizeText(t, 50)).filter(Boolean)
            : [],
          body: String(a.body).slice(0, 100_000), // markdown構造を保つため制御文字は除去せず長さのみ制限
        };
        if (!normalized.title || !normalized.description) {
          return json({ error: 'title / description が空です' }, 400);
        }
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
