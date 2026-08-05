import type { Locale } from './i18n';

// cases / news コレクションは blog と同じく `<collection>/<lang>/<slug>.md` に配置する。
// Astro の slug には言語ディレクトリが含まれる（例: `ja/grift`）ため、公開 URL に使う際は
// 接頭辞を外す必要がある。ここに集約しておき、各ルートでの書き方のブレを防ぐ。

export const LOCALES = ['ja', 'en', 'zh', 'ko', 'es'] as const;

// ja はルート直下（/works, /news）が担当するため、[lang] ルートが生成するのはこの4言語。
export const NON_JA_LOCALES = ['en', 'zh', 'ko', 'es'] as const;

export type NonJaLocale = (typeof NON_JA_LOCALES)[number];

// toLocaleDateString に渡す BCP 47 タグ。ja は既存表示（2026年7月2日）を保つため ja-JP のまま。
export const DATE_LOCALES: Record<Locale, string> = {
  ja: 'ja-JP',
  en: 'en-US',
  zh: 'zh-CN',
  ko: 'ko-KR',
  es: 'es-ES',
};

const LANG_PREFIX_RE = new RegExp(`^(${LOCALES.join('|')})/`);

/**
 * 言語ディレクトリ接頭辞を外した公開 slug を返す。
 * 例: `ja/grift` → `grift`。接頭辞が無い slug はそのまま返す。
 * 先頭のみを対象にしているのは、記事 slug 自体に `en/` 等が含まれても壊さないため。
 */
export function toCleanSlug(slug: string): string {
  return slug.replace(LANG_PREFIX_RE, '');
}

interface LocalizableEntry {
  slug: string;
  data: { lang?: string };
}

/**
 * ja 版を基準に、指定ロケールの翻訳があればそれで置き換えた一覧を返す。
 *
 * 翻訳記事の整備は ja 記事の追加と非同期に進むため、未翻訳でも同じ URL が必ず生成されるよう
 * ja へフォールバックする（言語切替で 404 に落ちない／ビルドが壊れない）。
 * 並び順は渡された ja 一覧の順序を保つ。
 */
export function localizeEntries<T extends LocalizableEntry>(
  all: readonly T[],
  locale: Locale,
): T[] {
  const jaEntries = all.filter((entry) => (entry.data.lang ?? 'ja') === 'ja');
  if (locale === 'ja') return jaEntries;

  const translated = new Map(
    all
      .filter((entry) => entry.data.lang === locale)
      .map((entry) => [toCleanSlug(entry.slug), entry] as const),
  );

  return jaEntries.map((entry) => translated.get(toCleanSlug(entry.slug)) ?? entry);
}
