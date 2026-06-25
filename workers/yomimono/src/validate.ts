import type { Article } from './types';

export const SLUG_RE = /^[a-z0-9-]{3,80}$/;
export const VALID_CATEGORIES = ['ai', 'engineering', 'founder', 'lab'] as const;

// slug は公開パス `src/content/blog/ja/<slug>.md` に直結する。
// `/`・`.`・`..` を弾き、記事ディレクトリ外への書き込み（パストラバーサル）を防ぐ。
export function assertSlug(slug: string): void {
  if (typeof slug !== 'string' || !SLUG_RE.test(slug)) {
    throw new Error(`slug が不正です: "${slug}"（英小文字/数字/ハイフンのみ、3〜80字）`);
  }
}

export function normalizeCategory(c: string | undefined): Article['category'] {
  return (VALID_CATEGORIES as readonly string[]).includes(c ?? '')
    ? (c as Article['category'])
    : 'ai';
}

// プロンプト注入対策: コードフェンス・制御文字を除去し、長さを制限する。
// （theme.* / recentTitles はそのまま system プロンプトに展開されるため）
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;
export function sanitizeText(s: unknown, maxLen: number): string {
  return String(s ?? '')
    .replace(/```/g, '')
    .replace(CONTROL_CHARS, ' ')
    .trim()
    .slice(0, maxLen);
}

export interface ArticleInput {
  slug?: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: unknown;
  body?: string;
}
export type NormalizedArticle = {
  slug: string;
  title: string;
  description: string;
  category: Article['category'];
  tags: string[];
  body: string;
};

// publish / validate 共通: 受け取った article を検証・正規化（パストラバーサル防止含む）。
export function normalizeArticle(
  a: ArticleInput | undefined,
): { ok: true; article: NormalizedArticle } | { ok: false; error: string; status: number } {
  if (!a?.slug || !a?.body || !a?.title || !a?.description) {
    return { ok: false, error: 'article.slug / title / description / body は必須です', status: 400 };
  }
  try {
    assertSlug(a.slug);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'slug が不正です', status: 400 };
  }
  const article: NormalizedArticle = {
    slug: a.slug,
    title: sanitizeText(a.title, 200),
    description: sanitizeText(a.description, 500),
    category: normalizeCategory(a.category),
    tags: Array.isArray(a.tags)
      ? a.tags.slice(0, 10).map((t) => sanitizeText(t, 50)).filter(Boolean)
      : [],
    body: String(a.body).slice(0, 100_000), // markdown構造を保つため制御文字は除去せず長さのみ制限
  };
  if (!article.title || !article.description) {
    return { ok: false, error: 'title / description が空です', status: 400 };
  }
  return { ok: true, article };
}
