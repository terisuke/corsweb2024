import { afterEach, describe, expect, it, vi } from 'vitest';

// import.meta.env をテストごとに差し替えるため、動的 import する
async function loadSite() {
  vi.resetModules();
  return import('../site');
}

describe('getGriftUrl / getContactUrl (ADR-0010)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('defaults to griftai.org when env is unset', async () => {
    vi.stubEnv('PUBLIC_GRIFT_BASE_URL', '');
    const { getGriftBaseUrl, getGriftUrl } = await loadSite();
    expect(getGriftBaseUrl()).toBe('https://griftai.org');
    expect(getGriftUrl('/')).toBe('https://griftai.org/');
  });

  it('uses PUBLIC_GRIFT_BASE_URL for Preview/Prod switch', async () => {
    vi.stubEnv('PUBLIC_GRIFT_BASE_URL', 'https://preview.grift.example');
    const { getGriftUrl } = await loadSite();
    expect(getGriftUrl('/team-beta')).toBe('https://preview.grift.example/team-beta');
  });

  it('appends intent and source query params', async () => {
    vi.stubEnv('PUBLIC_GRIFT_BASE_URL', 'https://griftai.org');
    const { getGriftUrl } = await loadSite();
    const url = getGriftUrl('/', {
      intent: 'grift-team-beta',
      source: 'home-hero',
      utm: { utm_source: 'cor' },
    });
    const u = new URL(url);
    expect(u.searchParams.get('intent')).toBe('grift-team-beta');
    expect(u.searchParams.get('source')).toBe('home-hero');
    expect(u.searchParams.get('utm_source')).toBe('cor');
  });

  it('getContactUrl localizes path and intent', async () => {
    const { getContactUrl } = await loadSite();
    expect(getContactUrl('ja', { intent: 'confidential-ai-assessment', source: 'header' })).toBe(
      '/contact?intent=confidential-ai-assessment&source=header',
    );
    expect(getContactUrl('en', { intent: 'local-llm-poc' })).toBe(
      '/en/contact?intent=local-llm-poc',
    );
  });

  it('resolveExternalHref rewrites grift sentinel and absolute griftai URLs', async () => {
    vi.stubEnv('PUBLIC_GRIFT_BASE_URL', 'https://preview.example');
    const { resolveExternalHref } = await loadSite();
    expect(resolveExternalHref('grift', { source: 'works' })).toContain('preview.example');
    expect(resolveExternalHref('https://griftai.org', { source: 'works' })).toContain(
      'preview.example',
    );
    expect(resolveExternalHref('/works/foo')).toBe('/works/foo');
    expect(resolveExternalHref(null)).toBeNull();
  });
});

describe('isProductionSite (ADR-0010 noindex)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('treats unset env as production', async () => {
    vi.stubEnv('PUBLIC_SITE_ENV', '');
    const { isProductionSite, getSiteEnv } = await loadSite();
    expect(getSiteEnv()).toBe('production');
    expect(isProductionSite()).toBe(true);
  });

  it('preview is not production', async () => {
    vi.stubEnv('PUBLIC_SITE_ENV', 'preview');
    const { isProductionSite } = await loadSite();
    expect(isProductionSite()).toBe(false);
  });
});

describe('ContactIntent 7 keys (ADR-0014 / #250)', () => {
  it('exports contract-dev and isContactIntent', async () => {
    const { CONTACT_INTENTS, isContactIntent, AUTO_HANDOFF_INTENTS, getContactUrl } = await loadSite();
    expect(CONTACT_INTENTS).toContain('contract-dev');
    expect(CONTACT_INTENTS).toHaveLength(7);
    expect(isContactIntent('contract-dev')).toBe(true);
    expect(isContactIntent('nope')).toBe(false);
    expect([...AUTO_HANDOFF_INTENTS]).toEqual(['contract-dev']);
    expect(getContactUrl('ja', { intent: 'contract-dev', source: 'header-ai-dev' })).toBe(
      '/contact?intent=contract-dev&source=header-ai-dev',
    );
  });
});
