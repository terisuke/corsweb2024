import { getCollection } from 'astro:content';
import type { Locale } from './i18n';

const ALL_LOCALES: readonly Locale[] = ['ja', 'en', 'zh', 'ko', 'es'];

/**
 * ブログの一覧 / タグ / カテゴリのインデックスページで、言語切替が「同一の翻訳ページ」へ
 * 飛んでよいロケールを返す（#307）。ページネーションも考慮し、そのページ番号が存在する言語だけを含める。
 *
 * これが無いと、記事数の多い ja（20本）が、翻訳の少ない言語（en 10本など）に存在しない
 * ページ番号（例 /en/blog/2/）や、その言語に無いタグページへリンクして 404 になる。
 *
 * `matches` は言語で絞らないこと（このヘルパーがロケールごとに data.lang で絞る）。
 *   一覧    : () => true
 *   タグ    : (d) => d.tags.includes(tag)
 *   カテゴリ: (d) => d.category === id
 */
export async function blogIndexLocales(
  matches: (data: { tags: string[]; category: string }) => boolean,
  currentPage: number,
  pageSize = 12,
): Promise<Locale[]> {
  const all = await getCollection('blog', ({ data }) => !data.isDraft);
  return ALL_LOCALES.filter(
    (loc) =>
      // p.data は tags/category が optional 型だが、ブログ schema 上は常に存在する。matches は
      // それらを前提に判定するため、ここで必須形にキャストする。
      all.filter(
        (p) => p.data.lang === loc && matches(p.data as { tags: string[]; category: string }),
      ).length >
      (currentPage - 1) * pageSize,
  );
}
