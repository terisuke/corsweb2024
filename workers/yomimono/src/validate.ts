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
