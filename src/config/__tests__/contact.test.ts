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
