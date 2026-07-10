/**
 * サイト横断の URL / 環境ヘルパ（ADR-0010 / ADR-0011）。
 * 外部ドメインや intent 付き CTA はここ経由のみにする。
 */
import { getLocalizedUrl, type Locale } from '../utils/i18n';

/** ADR-0010 intent 正本 */
export type ContactIntent =
  | 'confidential-ai-assessment'
  | 'local-llm-poc'
  | 'grift-team-beta'
  | 'grift-paid-trial'
  | 'estimate-audit'
  | 'press-speaking-other';

export type SiteEnv = 'production' | 'preview' | 'development';

const DEFAULT_GRIFT_BASE = 'https://griftai.org';

export function getSiteEnv(): SiteEnv {
  const raw = (import.meta.env.PUBLIC_SITE_ENV || '').toLowerCase();
  if (raw === 'preview' || raw === 'development' || raw === 'production') {
    return raw;
  }
  // 未設定時は production 扱い（ローカル dev でも index 可）。Preview は CI で明示する。
  return 'production';
}

/** Preview / develop チャネルでは noindex */
export function isProductionSite(): boolean {
  return getSiteEnv() === 'production';
}

export function getGriftBaseUrl(): string {
  const base = import.meta.env.PUBLIC_GRIFT_BASE_URL || DEFAULT_GRIFT_BASE;
  return String(base).replace(/\/$/, '');
}

export type GriftUrlOptions = {
  intent?: string;
  source?: string;
  utm?: Record<string, string>;
};

/**
 * Grift への絶対 URL を生成する。
 * path は '/' 始まり、または 'grift' センチネル（i18n 用）。
 */
export function getGriftUrl(path = '/', opts: GriftUrlOptions = {}): string {
  let pathname = path || '/';
  if (pathname === 'grift' || pathname === 'grift:') {
    pathname = '/';
  }
  // 誤って絶対 URL が入っていても base を env で上書き
  if (/^https?:\/\//i.test(pathname)) {
    try {
      const incoming = new URL(pathname);
      pathname = `${incoming.pathname}${incoming.search}` || '/';
    } catch {
      pathname = '/';
    }
  }
  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  const url = new URL(pathname, `${getGriftBaseUrl()}/`);
  if (opts.intent) url.searchParams.set('intent', opts.intent);
  if (opts.source) url.searchParams.set('source', opts.source);
  if (opts.utm) {
    for (const [key, value] of Object.entries(opts.utm)) {
      if (value) url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export type ContactUrlOptions = {
  intent?: ContactIntent | string;
  source?: string;
};

/** Cor /contact への locale + intent 付き URL */
export function getContactUrl(locale: Locale, opts: ContactUrlOptions = {}): string {
  const base = getLocalizedUrl('/contact', locale);
  const params = new URLSearchParams();
  if (opts.intent) params.set('intent', opts.intent);
  if (opts.source) params.set('source', opts.source);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * i18n / CMS 由来の href を解決する。
 * - 'grift' / griftai.org を含む → getGriftUrl
 * - それ以外はそのまま
 */
export function resolveExternalHref(
  href: string | null | undefined,
  opts: GriftUrlOptions = {},
): string | null {
  if (href == null || href === '') return null;
  if (href === 'grift' || href.startsWith('grift:') || /griftai\.org/i.test(href)) {
    return getGriftUrl('/', opts);
  }
  return href;
}
