import ja from '../i18n/locales/ja.json';
import en from '../i18n/locales/en.json';
import zh from '../i18n/locales/zh.json';
import ko from '../i18n/locales/ko.json';
import es from '../i18n/locales/es.json';

export type Locale = 'ja' | 'en' | 'zh' | 'ko' | 'es';

// ja を正とした翻訳スキーマ。ja のみに存在する追加キーがあるため、
// 他言語は共通部分 (typeof en) で受け、getTranslations は共通スキーマを返す。
export type Translations = typeof en;
export type JaTranslations = typeof ja;

const translations: Record<Locale, Translations> = { ja, en, zh, ko, es };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

// JA 専用の翻訳取得。Home C案コンポーネント等、現状 ja のみにコピーが存在する
// セクションで利用する。union ではなく ja の具体型を返すため新規キーに型安全にアクセスできる。
export function getJaTranslations(): JaTranslations {
  return ja;
}

// ブランド語「きょうそう」を語の途中で折らないよう nowrap で包む（set:html で使用）。
// 定義文「きょうそう（共創・…）」は対象外（閉じ括弧が直後に来る完全一致のみ）。
export function emphasizeKyousou(text: string): string {
  return text.replace(/「きょうそう」/g, '<span class="nowrap">「きょうそう」</span>');
}

export function getCurrentLocale(url: URL): Locale {
  const pathname = url.pathname;
  if (/^\/en(\/|$)/.test(pathname)) {
    return 'en';
  }
  if (/^\/zh(\/|$)/.test(pathname)) {
    return 'zh';
  }
  if (/^\/ko(\/|$)/.test(pathname)) {
    return 'ko';
  }
  if (/^\/es(\/|$)/.test(pathname)) {
    return 'es';
  }
  return 'ja';
}

export function getOtherLocale(currentLocale: Locale): Locale {
  const localeOrder: Locale[] = ['ja', 'en', 'zh', 'ko', 'es'];
  const currentIndex = localeOrder.indexOf(currentLocale);
  const nextIndex = (currentIndex + 1) % localeOrder.length;
  return localeOrder[nextIndex];
}

export function getLocalizedUrl(path: string, locale: Locale): string {
  if (locale === 'ja') return path;
  const localePrefix = `/${locale}`;
  return path === '/' ? localePrefix : `${localePrefix}${path}`;
}
