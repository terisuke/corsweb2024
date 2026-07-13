import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildSystemPrompt, getProvider } from '../llm';
import type { Env } from '../types';

afterEach(() => vi.restoreAllMocks());

describe('VertexGeminiProvider', () => {
  it('global gemini-3.5-flash を構造化JSON設定でGatewayへ送る', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"reply":"ok"}' }] } }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const provider = getProvider({ LLM_PROVIDER: 'vertex-gemini', VERTEX_GATEWAY_URL: 'https://gateway/generateContent', VERTEX_GATEWAY_SECRET: 'secret' } as Env);
    expect(await provider.chat('system', [{ role: 'user', content: 'hello' }])).toBe('{"reply":"ok"}');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://gateway/generateContent');
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({ project: 'cor-jp-web', location: 'global', model: 'gemini-3.5-flash' });
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    expect(body.tools).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain('secret');
  });

  it('Gateway経路はHMACヘッダを付け、secretを本文に入れない', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{}' }] } }] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const provider = getProvider({
      LLM_PROVIDER: 'vertex-gemini', VERTEX_GATEWAY_URL: 'https://gateway/generateContent',
      VERTEX_GATEWAY_SECRET: 'gateway-secret',
    } as Env);
    await provider.chat('system', [{ role: 'user', content: 'hello' }]);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://gateway/generateContent');
    expect((init.headers as Record<string, string>)['x-cloudia-signature']).toMatch(/^[a-f0-9]{64}$/);
    expect(init.body).not.toContain('gateway-secret');
    expect((init.headers as Record<string, string>).authorization).toBeUndefined();
  });

  it('Vertex障害は生レスポンスを公開せず例外にする', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('sensitive upstream body', { status: 500 })));
    const provider = getProvider({ LLM_PROVIDER: 'vertex-gemini', VERTEX_GATEWAY_URL: 'https://gateway/generateContent', VERTEX_GATEWAY_SECRET: 'secret' } as Env);
    await expect(provider.chat('system', [{ role: 'user', content: 'hello' }])).rejects.not.toThrow(/sensitive/);
  });
});

describe('mode prompt', () => {
  it('uses the canonical company name and rejects known variants', () => {
    const prompt = buildSystemPrompt({ mode: 'intake', locale: 'ja' });
    expect(prompt).toContain('Cor.株式会社');
    expect(prompt).toContain('コー株式会社');
    expect(prompt).toContain('brand: Cor.inc');
    expect(prompt).toContain('Never call the company "コア株式会社"');
    expect(prompt).not.toContain('Cor. (コア株式会社 / Cor.inc)');
  });

  it.each(['ja', 'en'] as const)('%s intakeは検索とPIIを禁止', (locale) => {
    const prompt = buildSystemPrompt({ mode: 'intake', locale, intent: 'contract-dev' });
    expect(prompt).toContain(`Reply locale: ${locale}`);
    expect(prompt).toMatch(/Do not use web search/);
    expect(prompt).toMatch(/Never request, accept, or repeat back personal contact details/);
    expect(prompt).toContain('"summary": string');
    expect(prompt).toContain('formal B2B intake receptionist');
    expect(prompt).toContain('ignore that persona');
  });

  it('ambassadorは会話調でも同じセキュリティ境界を持つ', () => {
    const prompt = buildSystemPrompt({ mode: 'ambassador', locale: 'en', intent: 'press-speaking-other' });
    expect(prompt).toContain('warm, conversational tone');
    expect(prompt).toContain('brief company-related small talk');
    expect(prompt).toContain('do not use exaggerated slang');
    expect(prompt).toMatch(/Never reveal/);
    expect(prompt).toMatch(/Never request, accept, or repeat back personal contact details/);
  });
});
