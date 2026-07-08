import type { Article, Collection } from './types';

export const SLUG_RE = /^[a-z0-9-]{3,80}$/;
export const VALID_CATEGORIES = ['ai', 'engineering', 'founder', 'lab'] as const;
export const NEWS_CATEGORIES = ['info', 'media', 'update', 'event', 'award'] as const;
export const CASES_CATEGORIES = ['grift', 'confidential-ai', 'local-llm', 'ai-contract', 'tech-culture'] as const;

// slug は公開パス `src/content/blog/ja/<slug>.md` に直結する。
// `/`・`.`・`..` を弾き、記事ディレクトリ外への書き込み（パストラバーサル）を防ぐ。
export function assertSlug(slug: string): void {
  if (typeof slug !== 'string' || !SLUG_RE.test(slug)) {
    throw new Error(`slug が不正です: "${slug}"（英小文字/数字/ハイフンのみ、3〜80字）`);
  }
}

export function normalizeCategory(c: string | undefined, collection: Collection = 'blog'): string {
  const validCategories =
    collection === 'news'
      ? NEWS_CATEGORIES
      : collection === 'cases'
        ? CASES_CATEGORIES
        : VALID_CATEGORIES;
  return (validCategories as readonly string[]).includes(c ?? '')
    ? (c ?? 'ai')
    : collection === 'news'
      ? 'info'
      : collection === 'cases'
        ? 'grift'
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

export const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'] as const;

// アップロード画像のファイル名を安全な basename に正規化（パストラバーサル/拡張子偽装を防ぐ）。
// 戻り値は `<stem>.<ext>` のみ（スラッシュ・連続ドット無し）。svg等は拒否。
export function safeImageName(filename: unknown): string {
  const raw = String(filename ?? '')
    .toLowerCase()
    .replace(/[\x00-\x1f\x7f]/g, '');
  const ext = (raw.split('.').pop() || '').replace(/[^a-z0-9]/g, '');
  if (!(IMAGE_EXT as readonly string[]).includes(ext)) {
    throw new Error('対応していない画像形式です（png/jpg/jpeg/gif/webp/avif）');
  }
  const stem =
    raw
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'image';
  return stem + '.' + ext;
}

export interface ArticleInput {
  slug?: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: unknown;
  body?: string;
  collection?: Collection;
  externalUrl?: string;
  summary?: string;
  publishedAt?: string;
  featured?: boolean;
}
export type NormalizedArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  body: string;
  collection: Collection;
  externalUrl?: string;
  summary?: string;
  publishedAt?: string;
  featured?: boolean;
};

// publish / validate 共通: 受け取った article を検証・正規化（パストラバーサル防止含む）。
export function normalizeArticle(
  a: ArticleInput | undefined,
  collection: Collection = 'blog',
): { ok: true; article: NormalizedArticle } | { ok: false; error: string; status: number } {
  const coll = collection || 'blog';

  // news で externalUrl がある場合は body 不要
  const requiresBody = coll !== 'news' || !a?.externalUrl;
  if (!a?.slug || !a?.title || !a?.description || (requiresBody && !a?.body)) {
    const required = ['slug', 'title', 'description'];
    if (requiresBody) required.push('body');
    if (coll === 'cases') required.push('summary');
    return { ok: false, error: `article.${required.join(' / ')} は必須です`, status: 400 };
  }

  // cases は summary 必須
  if (coll === 'cases' && !a?.summary) {
    return { ok: false, error: 'article.summary は cases で必須です', status: 400 };
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
    category: normalizeCategory(a.category, coll),
    tags: Array.isArray(a.tags)
      ? a.tags.slice(0, 10).map((t) => sanitizeText(t, 50)).filter(Boolean)
      : [],
    body: String(a.body ?? '').slice(0, 100_000),
    collection: coll,
    externalUrl: a.externalUrl ? sanitizeText(a.externalUrl, 2000) : undefined,
    summary: a.summary ? sanitizeText(a.summary, 1000) : undefined,
    publishedAt: a.publishedAt ? sanitizeText(a.publishedAt, 10) : undefined,
    featured: a.featured === true,
  };
  if (!article.title || !article.description) {
    return { ok: false, error: 'title / description が空です', status: 400 };
  }
  return { ok: true, article };
}
