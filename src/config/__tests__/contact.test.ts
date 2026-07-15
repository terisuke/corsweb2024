import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadContactConfig() {
  vi.resetModules();
  return import('../contact');
}

describe('Cloudia Grift handoff configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses the canonical Grift app origin and 24-hour TTL', async () => {
    vi.stubEnv('PUBLIC_GRIFT_HANDOFF_ALLOWED_ORIGINS', '');
    const { CLOUDIA_GRIFT_HANDOFF_ALLOWED_ORIGINS, CLOUDIA_GRIFT_HANDOFF_MAX_TTL_MS } =
      await loadContactConfig();

    expect(CLOUDIA_GRIFT_HANDOFF_ALLOWED_ORIGINS).toEqual(['https://app.griftai.org']);
    expect(CLOUDIA_GRIFT_HANDOFF_MAX_TTL_MS).toBe(24 * 60 * 60 * 1000);
  });

  it('adds only exact HTTPS origins from the configured allowlist', async () => {
    vi.stubEnv(
      'PUBLIC_GRIFT_HANDOFF_ALLOWED_ORIGINS',
      [
        'https://preview.grift.example',
        'https://preview.grift.example/',
        'http://insecure.example',
        'https://user:password@evil.example',
        'https://evil.example/path',
        'https://evil.example/?next=1',
        'not-a-url',
      ].join(',')
    );
    const { CLOUDIA_GRIFT_HANDOFF_ALLOWED_ORIGINS } = await loadContactConfig();

    expect(CLOUDIA_GRIFT_HANDOFF_ALLOWED_ORIGINS).toEqual([
      'https://app.griftai.org',
      'https://preview.grift.example',
    ]);
  });
});

describe('getCloudiaChatUrl / toCloudiaChatHref', () => {
  const base = new URL('https://cor-jp.com/some/page/?x=1');

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('defaults to the relative /contact/chat/ path on production', async () => {
    vi.stubEnv('PUBLIC_SITE_ENV', 'production');
    vi.stubEnv('PUBLIC_CLOUDIA_CHAT_ORIGIN', '');
    const { getCloudiaChatUrl } = await loadContactConfig();

    expect(getCloudiaChatUrl(base).toString()).toBe('https://cor-jp.com/contact/chat/');
  });

  it('defaults to the relative path when the site env is unset (local dev)', async () => {
    vi.stubEnv('PUBLIC_SITE_ENV', '');
    vi.stubEnv('PUBLIC_CLOUDIA_CHAT_ORIGIN', '');
    const { getCloudiaChatUrl } = await loadContactConfig();

    expect(getCloudiaChatUrl(base).toString()).toBe('https://cor-jp.com/contact/chat/');
  });

  it('points at the Cloudia Pages root on preview and development builds', async () => {
    for (const env of ['preview', 'development']) {
      vi.stubEnv('PUBLIC_SITE_ENV', env);
      vi.stubEnv('PUBLIC_CLOUDIA_CHAT_ORIGIN', '');
      const { getCloudiaChatUrl } = await loadContactConfig();

      expect(getCloudiaChatUrl(base).toString()).toBe('https://cloudia-contact.pages.dev/');
    }
  });

  it('honors an explicit HTTPS origin override', async () => {
    vi.stubEnv('PUBLIC_SITE_ENV', 'production');
    vi.stubEnv('PUBLIC_CLOUDIA_CHAT_ORIGIN', 'https://cloudia-dev.example');
    const { getCloudiaChatUrl } = await loadContactConfig();

    expect(getCloudiaChatUrl(base).toString()).toBe('https://cloudia-dev.example/');
  });

  it('ignores invalid overrides (non-HTTPS or with path) and falls back to env behavior', async () => {
    vi.stubEnv('PUBLIC_SITE_ENV', 'preview');
    vi.stubEnv('PUBLIC_CLOUDIA_CHAT_ORIGIN', 'http://insecure.example');
    let { getCloudiaChatUrl } = await loadContactConfig();
    expect(getCloudiaChatUrl(base).toString()).toBe('https://cloudia-contact.pages.dev/');

    vi.stubEnv('PUBLIC_CLOUDIA_CHAT_ORIGIN', 'https://ok.example/with-path');
    ({ getCloudiaChatUrl } = await loadContactConfig());
    expect(getCloudiaChatUrl(base).toString()).toBe('https://cloudia-contact.pages.dev/');
  });

  it("forces the relative path with the 'relative' literal even on preview", async () => {
    vi.stubEnv('PUBLIC_SITE_ENV', 'preview');
    vi.stubEnv('PUBLIC_CLOUDIA_CHAT_ORIGIN', 'relative');
    const { getCloudiaChatUrl } = await loadContactConfig();

    expect(getCloudiaChatUrl(base).toString()).toBe('https://cor-jp.com/contact/chat/');
  });

  it('keeps path+search for same-origin URLs and the full href for cross-origin', async () => {
    const { toCloudiaChatHref } = await loadContactConfig();
    const sameOrigin = new URL('https://cor-jp.com/contact/chat/?locale=ja&embed=1');
    const crossOrigin = new URL('https://cloudia-contact.pages.dev/?locale=ja&embed=1');

    expect(toCloudiaChatHref(sameOrigin, base)).toBe('/contact/chat/?locale=ja&embed=1');
    expect(toCloudiaChatHref(crossOrigin, base)).toBe('https://cloudia-contact.pages.dev/?locale=ja&embed=1');
  });
});
