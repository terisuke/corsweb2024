import { describe, it, expect } from 'vitest';
import {
  getCurrentLocale,
  getLocalizedUrl,
  getOtherLocale,
  emphasizeKyousou,
  getTranslations,
  getJaTranslations,
  type Locale,
} from '../i18n';

const makeUrl = (pathname: string): URL => new URL(`https://example.com${pathname}`);

describe('getCurrentLocale', () => {
  it('returns "ja" for the root path', () => {
    expect(getCurrentLocale(makeUrl('/'))).toBe('ja');
  });

  it('returns "ja" for a non-prefixed path', () => {
    expect(getCurrentLocale(makeUrl('/about'))).toBe('ja');
    expect(getCurrentLocale(makeUrl('/blog/post'))).toBe('ja');
  });

  it.each([
    ['/en', 'en'],
    ['/zh', 'zh'],
    ['/ko', 'ko'],
    ['/es', 'es'],
  ] as const)('detects bare prefix %s as %s', (pathname, expected) => {
    expect(getCurrentLocale(makeUrl(pathname))).toBe(expected);
  });

  it.each([
    ['/en/', 'en'],
    ['/en/blog', 'en'],
    ['/zh/about', 'zh'],
    ['/ko/contact', 'ko'],
    ['/es/blog/post', 'es'],
  ] as const)('detects prefixed sub-path %s as %s', (pathname, expected) => {
    expect(getCurrentLocale(makeUrl(pathname))).toBe(expected);
  });

  it('treats a false prefix like /english as "ja" (word boundary required)', () => {
    expect(getCurrentLocale(makeUrl('/english'))).toBe('ja');
    expect(getCurrentLocale(makeUrl('/endpoint'))).toBe('ja');
    expect(getCurrentLocale(makeUrl('/esperanto'))).toBe('ja');
    expect(getCurrentLocale(makeUrl('/korean'))).toBe('ja');
  });

  it('does not match a locale that appears mid-path', () => {
    expect(getCurrentLocale(makeUrl('/blog/en'))).toBe('ja');
    expect(getCurrentLocale(makeUrl('/blog/en/post'))).toBe('ja');
    expect(getCurrentLocale(makeUrl('/docs/es/guide'))).toBe('ja');
  });
});

describe('getLocalizedUrl', () => {
  it('returns the path unchanged for "ja"', () => {
    expect(getLocalizedUrl('/about', 'ja')).toBe('/about');
    expect(getLocalizedUrl('/', 'ja')).toBe('/');
  });

  it.each([
    ['/about', 'en', '/en/about'],
    ['/blog/post', 'zh', '/zh/blog/post'],
    ['/contact', 'ko', '/ko/contact'],
    ['/services', 'es', '/es/services'],
  ] as const)('prefixes %s for locale %s', (path, locale, expected) => {
    expect(getLocalizedUrl(path, locale)).toBe(expected);
  });

  it('maps root "/" to the bare locale prefix (no trailing slash)', () => {
    expect(getLocalizedUrl('/', 'en')).toBe('/en');
    expect(getLocalizedUrl('/', 'zh')).toBe('/zh');
    expect(getLocalizedUrl('/', 'ko')).toBe('/ko');
    expect(getLocalizedUrl('/', 'es')).toBe('/es');
  });

  it('round-trips with getCurrentLocale for root and non-root paths', () => {
    for (const locale of ['en', 'zh', 'ko', 'es'] as const) {
      for (const path of ['/', '/blog']) {
        const localized = getLocalizedUrl(path, locale);
        expect(getCurrentLocale(makeUrl(localized))).toBe(locale);
      }
    }
  });
});

describe('getOtherLocale', () => {
  it('cycles through the locale order ja -> en -> zh -> ko -> es -> ja', () => {
    expect(getOtherLocale('ja')).toBe('en');
    expect(getOtherLocale('en')).toBe('zh');
    expect(getOtherLocale('zh')).toBe('ko');
    expect(getOtherLocale('ko')).toBe('es');
    expect(getOtherLocale('es')).toBe('ja');
  });

  it('visits every locale exactly once over a full cycle', () => {
    const visited: Locale[] = [];
    let current: Locale = 'ja';
    for (let i = 0; i < 5; i++) {
      current = getOtherLocale(current);
      visited.push(current);
    }
    expect([...visited].sort()).toEqual([...LOCALES].sort());
    expect(current).toBe('ja'); // returns to the start
  });
});

describe('emphasizeKyousou', () => {
  const WRAPPED = '<span class="nowrap">「きょうそう」</span>';

  it('wraps a bracketed occurrence in a nowrap span', () => {
    expect(emphasizeKyousou('「きょうそう」')).toBe(WRAPPED);
  });

  it('leaves text without the bracketed term untouched', () => {
    expect(emphasizeKyousou('きょうそう')).toBe('きょうそう');
    expect(emphasizeKyousou('普通のテキスト')).toBe('普通のテキスト');
    expect(emphasizeKyousou('')).toBe('');
  });

  it('wraps every occurrence when the term appears multiple times', () => {
    const input = '「きょうそう」と「きょうそう」';
    expect(emphasizeKyousou(input)).toBe(`${WRAPPED}と${WRAPPED}`);
  });

  it('wraps the term even when followed by a definition parenthesis', () => {
    // Current behaviour: the regex matches the bracketed term regardless of
    // the following character, so the definition form is also wrapped.
    expect(emphasizeKyousou('「きょうそう」（共創）')).toBe(`${WRAPPED}（共創）`);
  });

  it('does not mutate the original input string', () => {
    const input = '「きょうそう」';
    const copy = input;
    emphasizeKyousou(input);
    expect(input).toBe(copy);
  });
});

const LOCALES: Locale[] = ['ja', 'en', 'zh', 'ko', 'es'];

describe('getTranslations / getJaTranslations', () => {
  it.each(LOCALES)('returns a non-empty object for locale %s', (locale) => {
    const t = getTranslations(locale);
    expect(t).toBeTypeOf('object');
    expect(t).not.toBeNull();
    expect(Object.keys(t).length).toBeGreaterThan(0);
  });

  it('returns identical top-level keys across all five locales', () => {
    const reference = Object.keys(getTranslations('ja')).sort();
    for (const locale of LOCALES) {
      expect(Object.keys(getTranslations(locale)).sort()).toEqual(reference);
    }
  });

  it('getJaTranslations() is the same object as getTranslations("ja")', () => {
    expect(getJaTranslations()).toBe(getTranslations('ja'));
  });
});

// Index-aware recursive key set: objects contribute dotted paths, arrays
// descend into each element with a concrete "[i]" index segment. Using the
// index (rather than a union "[]") means a per-index divergence — e.g. a `link`
// key that moves to a different array position, or a locale gaining/losing an
// array element — surfaces as a distinct path and fails the comparison.
function collectKeys(value: unknown, prefix: string, acc: Set<string>): void {
  if (Array.isArray(value)) {
    value.forEach((el, i) => collectKeys(el, `${prefix}[${i}]`, acc));
  } else if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${key}` : key;
      acc.add(path);
      collectKeys((value as Record<string, unknown>)[key], path, acc);
    }
  }
}

function keySet(locale: Locale): Set<string> {
  const acc = new Set<string>();
  collectKeys(getTranslations(locale), '', acc);
  return acc;
}

// Collect the length of every array reachable in the tree, keyed by its dotted
// path (index segments omitted so the path is stable across locales).
function collectArrayLengths(
  value: unknown,
  prefix: string,
  acc: Map<string, number>,
): void {
  if (Array.isArray(value)) {
    acc.set(prefix, value.length);
    value.forEach((el) => collectArrayLengths(el, `${prefix}[]`, acc));
  } else if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${key}` : key;
      collectArrayLengths((value as Record<string, unknown>)[key], path, acc);
    }
  }
}

function arrayLengths(locale: Locale): Map<string, number> {
  const acc = new Map<string, number>();
  collectArrayLengths(getTranslations(locale), '', acc);
  return acc;
}

describe('locale JSON key-structure consistency (regression guard M-2)', () => {
  const TRANSLATED: Locale[] = ['en', 'zh', 'ko', 'es'];

  it.each(TRANSLATED)(
    'locale %s has the exact same index-aware key set as en',
    (locale) => {
      const en = keySet('en');
      const target = keySet(locale);
      const missing = [...en].filter((k) => !target.has(k));
      const extra = [...target].filter((k) => !en.has(k));
      expect(missing).toEqual([]);
      expect(extra).toEqual([]);
    },
  );

  it.each(TRANSLATED)(
    'locale %s has the same array lengths as en at every path',
    (locale) => {
      const en = arrayLengths('en');
      const target = arrayLengths(locale);
      expect([...target.keys()].sort()).toEqual([...en.keys()].sort());
      for (const [path, length] of en) {
        expect(target.get(path)).toBe(length);
      }
    },
  );

  it('freezes the exact set of index-aware keys en has but ja lacks', () => {
    const en = keySet('en');
    const ja = keySet('ja');
    // ja and en diverge in the works.items array: en/zh/ko/es carry a link on
    // items[1] and a whole extra 7th item (items[6]) that ja does not have.
    // Freeze that exact difference so any new divergence fails the test.
    const enNotJa = [...en].filter((k) => !ja.has(k)).sort();
    expect(enNotJa).toEqual([
      'works.items[1].link',
      'works.items[6].description',
      'works.items[6].name',
      'works.items[6].tag',
    ]);
  });

  it('reflects the ja/en works.items length difference (ja: 6, en: 7)', () => {
    expect(arrayLengths('ja').get('works.items')).toBe(6);
    expect(arrayLengths('en').get('works.items')).toBe(7);
  });
});
