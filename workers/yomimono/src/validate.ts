import type { Article, Collection } from './types';

export const SLUG_RE = /^[a-z0-9-]{3,80}$/;
export const VALID_CATEGORIES = ['ai', 'engineering', 'founder', 'lab'] as const;
export const NEWS_CATEGORIES = ['info', 'media', 'update', 'event', 'award'] as const;
export const CASES_CATEGORIES = ['grift', 'confidential-ai', 'local-llm', 'ai-contract', 'tech-culture'] as const;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// コレクション値を安全に正規化（unknown または無効な値は 'blog' フォールバック）
export function normalizeCollection(raw: unknown): Collection {
  if (raw === 'news' || raw === 'cases') return raw;
  return 'blog';
}

// コレクション別の厳密な category 型。normalizeCategory の戻り型と NormalizedArticle で使用。
export type BlogCategory = (typeof VALID_CATEGORIES)[number];
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];
export type CaseCategory = (typeof CASES_CATEGORIES)[number];

// slug は公開パス `src/content/blog/ja/<slug>.md` に直結する。
// `/`・`.`・`..` を弾き、記事ディレクトリ外への書き込み（パストラバーサル）を防ぐ。
export function assertSlug(slug: string): void {
  if (typeof slug !== 'string' || !SLUG_RE.test(slug)) {
    throw new Error(`slug が不正です: "${slug}"（英小文字/数字/ハイフンのみ、3〜80字）`);
  }
}

// collection 引数で戻り型を厳密化（blog 規定で BlogCategory、news で NewsCategory、cases で CaseCategory）。
// 呼び出し側はリテラルで collection を渡す必要がある（Collection 全体だとオーバーロード未解決で型エラー）。
export function normalizeCategory(c: string | undefined, collection?: 'blog'): BlogCategory;
export function normalizeCategory(c: string | undefined, collection: 'news'): NewsCategory;
export function normalizeCategory(c: string | undefined, collection: 'cases'): CaseCategory;
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

// http(s) URL のみ受理（javascript: / data: 等の危険なスキームを排除）。
const HTTP_URL_RE = /^https?:\/\//i;
export function isHttpUrl(s: string): boolean {
  return HTTP_URL_RE.test(s);
}

// YYYY-MM-DD 形式かつ実在する暦日付か検証（2026-99-99・2026-02-30 等のロールオーバーを拒否）。
export function isValidCalendarDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return false;
  // Date はロールオーバーする（2026-02-30 → 2026-03-02）ので、
  // 入力の Y/M/D がそのまま Date に反映されたか検証する。
  const [yyyy, mm, dd] = s.split('-').map(Number);
  return d.getFullYear() === yyyy && d.getMonth() + 1 === mm && d.getDate() === dd;
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
  externalUrl?: string;
  summary?: string;
  publishedAt?: string;
  featured?: boolean;
  isDraft?: boolean;
}
// collection 判別可能なユニオン型。blog/news/cases 各々で category を厳密に型付けする（4b3c257 以前の blog 厳密性を回復）。
type NormalizedArticleCommon = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  body: string;
  externalUrl?: string;
  summary?: string;
  publishedAt?: string;
  featured?: boolean;
  // isDraft: 「下書きとして保存」用。true なら frontmatter に isDraft: true を書き、
  // サイト一覧（!data.isDraft フィルタ）で非表示。既定 false で従来の公開挙動は不変。
  isDraft: boolean;
};
export type NormalizedArticle =
  | (NormalizedArticleCommon & { collection: 'blog'; category: BlogCategory })
  | (NormalizedArticleCommon & { collection: 'news'; category: NewsCategory })
  | (NormalizedArticleCommon & { collection: 'cases'; category: CaseCategory });

// publish / validate 共通: 受け取った article を検証・正規化（パストラバーサル防止含む）。
export function normalizeArticle(
  a: ArticleInput | undefined,
  collection: Collection = 'blog',
): { ok: true; article: NormalizedArticle } | { ok: false; error: string; status: number } {
  const coll = collection || 'blog';

  // a が未定義・非オブジェクトなら先に弾く（以降の a.* アクセスを安全にする＝TS2532/18047 抑制）
  if (!a || typeof a !== 'object') {
    return { ok: false, error: 'article は必須です', status: 400 };
  }

  // externalUrl: sanitize した上で http(s) URL のみ採用。不正（空白・"not-a-url" 等）は
  // externalUrl 無しとして扱い、news でも body 必須とする（危険なスキームの URL で本文免除を防ぐ）。
  const sanitizedExternalUrl = a.externalUrl ? sanitizeText(a.externalUrl, 2000) : '';
  const validExternalUrl = isHttpUrl(sanitizedExternalUrl) ? sanitizedExternalUrl : undefined;

  // 必須フィールドを一元検証: 欠落名を収集してメッセージに使い、
  // 同じ条件で直接 return することで TS が slug/title/description を string に狭める
  // （配列経由の遅延 return ではプロパティの型が狭まらないため）。
  const requiresBody = coll !== 'news' || !validExternalUrl;
  const missing: string[] = [];
  if (!a.slug) missing.push('slug');
  if (!a.title) missing.push('title');
  if (!a.description) missing.push('description');
  if (requiresBody && !a.body) missing.push('body');
  if (coll === 'cases' && !a.summary) missing.push('summary');
  if (!a.slug || !a.title || !a.description || (requiresBody && !a.body) || (coll === 'cases' && !a.summary)) {
    return { ok: false, error: `article.${missing.join(' / ')} は必須です`, status: 400 };
  }

  try {
    assertSlug(a.slug);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'slug が不正です', status: 400 };
  }

  const common = {
    slug: a.slug,
    title: sanitizeText(a.title, 200),
    description: sanitizeText(a.description, 500),
    tags: Array.isArray(a.tags)
      ? a.tags.slice(0, 10).map((t) => sanitizeText(t, 50)).filter(Boolean)
      : [],
    body: String(a.body ?? '').slice(0, 100_000),
    externalUrl: validExternalUrl,
    summary: a.summary ? sanitizeText(a.summary, 1000) : undefined,
    publishedAt:
      a.publishedAt && isValidCalendarDate(a.publishedAt)
        ? sanitizeText(a.publishedAt, 10)
        : undefined,
    featured: a.featured === true,
    isDraft: a.isDraft === true,
  };
  // coll をリテラル狭めし、各コレクションの厳密な category 型を持つユニオンメンバを構築する。
  let article: NormalizedArticle;
  if (coll === 'news') {
    article = { ...common, collection: 'news', category: normalizeCategory(a.category, 'news') };
  } else if (coll === 'cases') {
    article = { ...common, collection: 'cases', category: normalizeCategory(a.category, 'cases') };
  } else {
    article = { ...common, collection: 'blog', category: normalizeCategory(a.category) };
  }
  if (!article.title || !article.description) {
    return { ok: false, error: 'title / description が空です', status: 400 };
  }
  return { ok: true, article };
}
