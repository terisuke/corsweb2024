import { describe, expect, it } from 'vitest';
import {
  DATE_LOCALES,
  LOCALES,
  NON_JA_LOCALES,
  localizeEntries,
  toCleanSlug,
} from '../content-i18n';

type Entry = { slug: string; data: { lang?: string; title: string } };

const entry = (slug: string, lang: string | undefined, title: string): Entry => ({
  slug,
  data: lang === undefined ? { title } : { lang, title },
});

describe('toCleanSlug', () => {
  it.each(LOCALES)('strips the %s/ directory prefix', (locale) => {
    expect(toCleanSlug(`${locale}/grift`)).toBe('grift');
  });

  it('leaves a slug without a language prefix untouched', () => {
    expect(toCleanSlug('grift')).toBe('grift');
    expect(toCleanSlug('nested/grift')).toBe('nested/grift');
  });

  it('strips only the leading segment, not one appearing later', () => {
    // `ja/foo/en/bar` の後半 `en/` まで消してしまうと別記事の URL に化ける。
    expect(toCleanSlug('ja/foo/en/bar')).toBe('foo/en/bar');
  });

  it('does not strip a lookalike prefix that is not a full segment', () => {
    expect(toCleanSlug('japanese/foo')).toBe('japanese/foo');
    expect(toCleanSlug('esperanto/foo')).toBe('esperanto/foo');
  });
});

describe('localizeEntries', () => {
  const all: Entry[] = [
    entry('ja/alpha', 'ja', 'アルファ'),
    entry('ja/beta', 'ja', 'ベータ'),
    entry('en/alpha', 'en', 'Alpha'),
    entry('zh/beta', 'zh', '贝塔'),
  ];

  it('returns only the ja entries for locale ja', () => {
    expect(localizeEntries(all, 'ja').map((e) => e.slug)).toEqual(['ja/alpha', 'ja/beta']);
  });

  it('swaps in the translation when one exists', () => {
    expect(localizeEntries(all, 'en').map((e) => e.data.title)).toEqual(['Alpha', 'ベータ']);
  });

  it('falls back to ja for every untranslated entry', () => {
    // ko の翻訳は1件も無い → 全件 ja のまま。件数が減らないことが URL パリティの前提。
    expect(localizeEntries(all, 'ko').map((e) => e.slug)).toEqual(['ja/alpha', 'ja/beta']);
  });

  it('never borrows a translation from a different locale', () => {
    // zh 版 beta が存在しても en の一覧に混ざってはいけない。
    const titles = localizeEntries(all, 'en').map((e) => e.data.title);
    expect(titles).not.toContain('贝塔');
  });

  it('produces the same number of entries for every locale (URL parity)', () => {
    const jaCount = localizeEntries(all, 'ja').length;
    for (const locale of LOCALES) {
      expect(localizeEntries(all, locale)).toHaveLength(jaCount);
    }
  });

  it('preserves the order of the ja list', () => {
    const reversed = [...all].reverse();
    // ja の並びは入力順（reversed では beta が先）に従う。
    expect(localizeEntries(reversed, 'en').map((e) => toCleanSlug(e.slug))).toEqual([
      'beta',
      'alpha',
    ]);
  });

  it('treats an entry without an explicit lang as ja', () => {
    const withoutLang: Entry[] = [entry('gamma', undefined, 'ガンマ')];
    expect(localizeEntries(withoutLang, 'ja').map((e) => e.slug)).toEqual(['gamma']);
    expect(localizeEntries(withoutLang, 'en').map((e) => e.slug)).toEqual(['gamma']);
  });

  it('ignores translations that have no ja counterpart', () => {
    // ja に無い翻訳だけの記事は、ja 側に URL が無いため一覧に出さない。
    const orphan: Entry[] = [...all, entry('en/orphan', 'en', 'Orphan')];
    expect(localizeEntries(orphan, 'en').map((e) => toCleanSlug(e.slug))).toEqual([
      'alpha',
      'beta',
    ]);
  });
});

describe('locale constants', () => {
  it('NON_JA_LOCALES is LOCALES minus ja', () => {
    expect([...NON_JA_LOCALES]).toEqual(LOCALES.filter((l) => l !== 'ja'));
  });

  it('DATE_LOCALES covers every locale with a distinct BCP 47 tag', () => {
    const tags = LOCALES.map((l) => DATE_LOCALES[l]);
    expect(tags).toHaveLength(LOCALES.length);
    expect(new Set(tags).size).toBe(LOCALES.length);
    expect(DATE_LOCALES.ja).toBe('ja-JP');
  });
});
