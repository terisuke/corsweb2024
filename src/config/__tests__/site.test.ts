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

describe('福岡100選エンブレムの掲載ガード（#276 条件③）', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  // 掲載期間の境界は production の isWithinFukuoka100DisplayPeriod を直接呼んで検証する。
  // （テスト内でロジックを再実装すると、定数を書き換えても落ちない空虚なテストになる）
  it('開始前（JST 2026-07-31 23:59:59）は掲載期間外', async () => {
    const { isWithinFukuoka100DisplayPeriod } = await loadSite();

    expect(isWithinFukuoka100DisplayPeriod(new Date('2026-07-31T23:59:59+09:00'))).toBe(false);
  });

  it('JST 8/1 0:00 ちょうどから掲載期間内（ホストTZに依存しない）', async () => {
    const { isWithinFukuoka100DisplayPeriod } = await loadSite();

    // 2026-07-31T15:00:00Z === JST 2026-08-01 00:00
    expect(isWithinFukuoka100DisplayPeriod(new Date('2026-07-31T15:00:00Z'))).toBe(true);
  });

  it('掲載最終日（JST 2027-07-31 23:59）は掲載期間内', async () => {
    const { isWithinFukuoka100DisplayPeriod } = await loadSite();

    expect(isWithinFukuoka100DisplayPeriod(new Date('2027-07-31T23:59:00+09:00'))).toBe(true);
  });

  // 終端は「終了日の翌日0時」＝排他的。23:59:59 等に退行すると最終日の末尾が欠けるため固定する。
  it('掲載最終日の最終秒（JST 2027-07-31 23:59:59.500）も掲載期間内＝終端は翌日0時', async () => {
    const { isWithinFukuoka100DisplayPeriod } = await loadSite();

    expect(isWithinFukuoka100DisplayPeriod(new Date('2027-07-31T23:59:59.500+09:00'))).toBe(true);
  });

  it('1年経過後（JST 2027-08-01 0:00）は掲載期間外＝許諾期間を超えて出さない', async () => {
    const { isWithinFukuoka100DisplayPeriod } = await loadSite();

    expect(isWithinFukuoka100DisplayPeriod(new Date('2027-08-01T00:00:00+09:00'))).toBe(false);
  });

  it('フラグ off の間は掲載期間内でも表示しない（期間内であることを固定した上で検証）', async () => {
    const { isFukuoka100EmblemVisible, isWithinFukuoka100DisplayPeriod } = await loadSite();
    const inWindow = new Date('2026-09-01T00:00:00+09:00');

    // false の理由が「期間外」ではなくフラグであることを担保する
    expect(isWithinFukuoka100DisplayPeriod(inWindow)).toBe(true);
    expect(isFukuoka100EmblemVisible(inWindow)).toBe(false);
  });

  // 意図的なトリップワイヤ: 既定で有効化された状態を誤って出荷しないための固定。
  // IOBI の掲載開始回答を受けて正式に有効化する際は、この期待値を意識的に更新すること。
  it('[トリップワイヤ] 既定ではフラグが無効（有効化時は本テストを意図的に更新する）', async () => {
    const { FUKUOKA100_EMBLEM_ENABLED } = await loadSite();

    expect(FUKUOKA100_EMBLEM_ENABLED).toBe(false);
  });
});
