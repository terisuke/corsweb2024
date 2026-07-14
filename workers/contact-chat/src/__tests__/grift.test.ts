import { afterEach, describe, expect, it, vi } from 'vitest';
import worker from '../index';
import {
  GRIFT_MAX_RESPONSE_BYTES,
  GRIFT_MAX_PORTAL_TTL_MS,
  GRIFT_TIMEOUT_MS,
  handoffToGrift,
  normalizeHandoffConsent,
} from '../grift';
import { decryptText, encryptText, type TrustedContactSession } from '../storage';
import { resetRateLimits } from '../security';
import type { ContactIntent, Env, NormalizedInquiry } from '../types';

const GRIFT_ORIGIN = 'https://internal.grift.example';
const PORTAL_ORIGIN = 'https://app.griftai.org';
const WORKER_RECEIVED_AT = new Date().toISOString();
const BROWSER_ACCEPTED_AT = new Date(Date.now() - 1_000).toISOString();
const EXPIRES_AT = new Date(Date.now() + 60 * 60 * 1000).toISOString();

const ENV: Env = {
  ANTHROPIC_API_KEY: '',
  RESEND_API_KEY: 're_test',
  TURNSTILE_SECRET: '',
  LLM_PROVIDER: 'anthropic',
  CONTACT_TO_EMAIL: 'cloudia@cor-jp.com',
  CONTACT_FROM_EMAIL: 'noreply@cor-jp.com',
  GRIFT_HANDOFF_ENABLED: 'true',
  GRIFT_API_ORIGIN: GRIFT_ORIGIN,
  GRIFT_PUBLIC_URL_ORIGINS: PORTAL_ORIGIN,
  CLOUDIA_HANDOFF_AUTH_TOKEN: 'service-secret-value',
};

const INQUIRY: NormalizedInquiry = {
  name: '山田太郎',
  email: 'taro@example.com',
  company: 'Example Inc.',
  message: '受発注システムの開発を相談したいです',
  summaryText: '受発注システムの目的と時期を確認済み',
  conversationSummary: '受発注システムの目的と時期を確認済み',
  classification: 'genuine',
  intent: 'contract-dev',
  source: 'browser-forged-source',
  structuredLead: {
    purpose: '受発注の効率化',
    industryRole: '製造業の情報システム担当',
    dataSensitivity: '社外秘',
    stage: '要件整理中',
    timingBudget: '3か月以内',
    discoverySource: '検索',
    contactReason: '開発相談',
  },
  utm: {},
  conversationExcerpt: '訪問者: 生会話全文をGriftへ送ってはいけない',
};

const SESSION: TrustedContactSession = {
  sessionId: 'session-1',
  intent: 'contract-dev',
  locale: 'ja',
  source: 'cloudia',
  classification: 'genuine',
  summary: 'D1で検証済みの相談要約',
  structuredLead: INQUIRY.structuredLead,
};

const CONSENT = {
  accepted: true as const,
  version: 'cloudia-grift-v1' as const,
  acceptedAt: WORKER_RECEIVED_AT,
  browserAcceptedAt: BROWSER_ACCEPTED_AT,
  summaryConfirmed: true as const,
};

function successResponse(overrides: Record<string, unknown> = {}): Response {
  return new Response(JSON.stringify({
    submission_id: 'submission-1',
    case_id: 'case-1',
    chat_url: `${PORTAL_ORIGIN}/chat/portal/opaque-token`,
    expires_at: EXPIRES_AT,
    duplicate: false,
    ...overrides,
  }), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });
}

function successResponseForRequest(init?: RequestInit, overrides: Record<string, unknown> = {}): Response {
  const submissionId = new Headers(init?.headers).get('idempotency-key') || '';
  return successResponse({ submission_id: submissionId, ...overrides });
}

afterEach(() => {
  resetRateLimits();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('normalizeHandoffConsent', () => {
  it('accepted/version/acceptedAt が揃った明示同意だけを受理する', () => {
    expect(normalizeHandoffConsent({
      accepted: true,
      version: 'cloudia-grift-v1',
      acceptedAt: BROWSER_ACCEPTED_AT,
      summaryConfirmed: true,
    }, WORKER_RECEIVED_AT)).toEqual(CONSENT);
    expect(normalizeHandoffConsent({ accepted: true }, WORKER_RECEIVED_AT)).toBeNull();
    expect(normalizeHandoffConsent({
      accepted: true,
      version: 'cloudia-grift-v1',
      acceptedAt: BROWSER_ACCEPTED_AT,
      summaryConfirmed: false,
    }, WORKER_RECEIVED_AT)).toBeNull();
    expect(normalizeHandoffConsent({
      accepted: false,
      version: 'cloudia-grift-v1',
      acceptedAt: BROWSER_ACCEPTED_AT,
    }, WORKER_RECEIVED_AT)).toBeNull();
    expect(normalizeHandoffConsent({
      accepted: true,
      version: 'cloudia-grift-v1',
      acceptedAt: 'not-a-date',
    }, WORKER_RECEIVED_AT)).toBeNull();
    expect(normalizeHandoffConsent({
      accepted: true,
      version: 'forged-version',
      acceptedAt: BROWSER_ACCEPTED_AT,
      summaryConfirmed: true,
    }, WORKER_RECEIVED_AT)).toBeNull();
    expect(normalizeHandoffConsent({
      accepted: true,
      version: 'cloudia-grift-v1',
      acceptedAt: BROWSER_ACCEPTED_AT,
      summaryConfirmed: 'true',
    }, WORKER_RECEIVED_AT)).toBeNull();
  });
});

describe('handoffToGrift', () => {
  it('D1のcontract-dev sessionと明示同意がある場合だけBearerで同期呼出しする', async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async (_url, init) => successResponseForRequest(init),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: INQUIRY,
      session: SESSION,
      consent: CONSENT,
    })).resolves.toEqual({
      status: 'ready',
      url: `${PORTAL_ORIGIN}/chat/portal/opaque-token`,
      expiresAt: EXPIRES_AT,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    if (!init) throw new Error('Grift request init missing');
    expect(url).toBe(`${GRIFT_ORIGIN}/v1/internal/cloudia/intake-sessions`);
    expect(init.method).toBe('POST');
    expect(init.redirect).toBe('manual');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer service-secret-value');
    expect((init.headers as Record<string, string>)['idempotency-key']).toBe('submission-1');
    const payload = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(payload).toEqual({
      schema_version: 'cloudia-grift-handoff.v1',
      intent: 'contract-dev',
      source: 'corsweb-contact-chat',
      locale: 'ja',
      contact: {
        name: INQUIRY.name,
        email: INQUIRY.email,
        company: INQUIRY.company,
      },
      inquiry: {
        message: INQUIRY.message,
        summary: INQUIRY.conversationSummary,
        structured_lead: {
          purpose: '受発注の効率化',
          industry_role: '製造業の情報システム担当',
          data_sensitivity: '社外秘',
          stage: '要件整理中',
          timing_budget: '3か月以内',
        },
      },
      consent: {
        version: 'cloudia-grift-v1',
        accepted_at: CONSENT.acceptedAt,
      },
    });
    expect(JSON.stringify(payload)).not.toContain('tenant_id');
    expect(JSON.stringify(payload)).not.toContain('生会話全文');
    expect(JSON.stringify(payload)).not.toContain('browser-forged-source');
  });

  it.each([
    'contract-dev',
    'grift-team-beta',
    'grift-paid-trial',
    'estimate-audit',
  ] as const)('trusted D1 intent=%sは固定contract-dev payloadでhandoffする', async (intent) => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async (_url, init) => successResponseForRequest(init),
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(handoffToGrift(ENV, {
      submissionId: `submission-${intent}`,
      inquiry: { ...INQUIRY, intent },
      session: { ...SESSION, intent },
      consent: CONSENT,
    })).resolves.toMatchObject({ status: 'ready' });
    const payload = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as Record<string, unknown>;
    expect(payload.intent).toBe('contract-dev');
    expect(payload.source).toBe('corsweb-contact-chat');
  });

  it.each([
    'confidential-ai-assessment',
    'local-llm-poc',
    'press-speaking-other',
  ] as const)('対象外intent=%sでは呼び出さず既存応答を維持する', async (intent) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: { ...INQUIRY, intent },
      session: { ...SESSION, intent },
      consent: CONSENT,
    })).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('trusted session intentと正規化済みinquiry intentが不一致ならfallbackにする', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: { ...INQUIRY, intent: 'grift-team-beta' },
      session: { ...SESSION, intent: 'grift-paid-trial' },
      consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('明示同意なしでは呼び出さず既存応答を維持する', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: INQUIRY,
      session: SESSION,
      consent: null,
    })).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('contract-devの同意があっても信頼済みsessionなしではfallbackにする', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: INQUIRY,
      session: null,
      consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('feature flagがexact trueでなければ呼び出さずfallbackにする', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(handoffToGrift({ ...ENV, GRIFT_HANDOFF_ENABLED: 'false' }, {
      submissionId: 'submission-1',
      inquiry: INQUIRY,
      session: SESSION,
      consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['sales', 'spam'] as const)('信頼済みsessionが%sなら呼び出さずfallbackにする', async (classification) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: { ...INQUIRY, classification },
      session: { ...SESSION, classification },
      consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('partial structured leadを欠落補完せず契約どおり送る', async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async (_url, init) => successResponseForRequest(init),
    );
    vi.stubGlobal('fetch', fetchMock);
    await handoffToGrift(ENV, {
      submissionId: 'submission-partial',
      inquiry: INQUIRY,
      session: { ...SESSION, structuredLead: { purpose: 'PoC相談' } },
      consent: CONSENT,
    });
    const payload = JSON.parse(String(fetchMock.mock.calls[0][1]?.body)) as {
      inquiry?: { structured_lead?: Record<string, string> };
    };
    expect(payload.inquiry?.structured_lead).toEqual({ purpose: 'PoC相談' });
  });

  it('8秒でtimeoutしHTTPエラーにせずfallbackにする', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }));
    vi.stubGlobal('fetch', fetchMock);
    const pending = handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: INQUIRY,
      session: SESSION,
      consent: CONSENT,
    });
    await vi.advanceTimersByTimeAsync(GRIFT_TIMEOUT_MS);
    await expect(pending).resolves.toEqual({ status: 'fallback' });
  });

  it.each([400, 429, 500, 503])('Grift HTTP %i はfallbackにする', async (status) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('provider error', { status })));
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: INQUIRY,
      session: SESSION,
      consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
  });

  it('3xx redirectを追跡せずfallbackにする', async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async () => new Response(null, {
      status: 302,
      headers: { location: 'https://evil.example/steal' },
    }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1', inquiry: INQUIRY, session: SESSION, consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
    expect(fetchMock.mock.calls[0][1]?.redirect).toBe('manual');
  });

  it('invalid JSONはfallbackにする', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{invalid', { status: 200 })));
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: INQUIRY,
      session: SESSION,
      consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
  });

  it('JSONでも必須fieldの型が契約外ならfallbackにする', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => successResponse({ duplicate: 'false' })));
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: INQUIRY,
      session: SESSION,
      consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
  });

  it('Grift応答のsubmission_idが要求IDと不一致なら別case URLを返さない', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => successResponse({ submission_id: 'other-submission' })));
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: INQUIRY,
      session: SESSION,
      consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
  });

  it('summaryTextとD1保存用summaryが一致しない場合はhandoffしない', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: { ...INQUIRY, conversationSummary: '別の要約' },
      session: SESSION,
      consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('応答上限を超えるContent-Lengthは本文を信用せずfallbackにする', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', {
      status: 200,
      headers: { 'content-length': String(GRIFT_MAX_RESPONSE_BYTES + 1) },
    })));
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: INQUIRY,
      session: SESSION,
      consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
  });

  it('Content-Lengthなしの巨大responseもstreaming上限でfallbackにする', async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(GRIFT_MAX_RESPONSE_BYTES + 1));
        controller.close();
      },
    });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(body, {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })));
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1', inquiry: INQUIRY, session: SESSION, consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
  });

  it('許可origin外の公開URLはブラウザへ返さない', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => successResponse({
      chat_url: 'https://evil.example/chat/portal/stolen-token',
    })));
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: INQUIRY,
      session: SESSION,
      consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
  });

  it.each([
    `${PORTAL_ORIGIN}/chat/portal/opaque-token?next=https://evil.example`,
    `${PORTAL_ORIGIN}/chat/portal/opaque-token#fragment`,
    `https://user@app.griftai.org/chat/portal/opaque-token`,
    `${PORTAL_ORIGIN}/other/opaque-token`,
    `${PORTAL_ORIGIN}/chat/portal/token%2Fescape`,
  ])('open redirect/path confusion URLを拒否する: %s', async (chatUrl) => {
    vi.stubGlobal('fetch', vi.fn(async () => successResponse({ chat_url: chatUrl })));
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1', inquiry: INQUIRY, session: SESSION, consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
  });

  it.each([
    new Date(Date.now() - 1).toISOString(),
    new Date(Date.now() + GRIFT_MAX_PORTAL_TTL_MS + 60_000).toISOString(),
  ])('期限が過去または24時間超ならfallbackにする: %s', async (expiresAt) => {
    vi.stubGlobal('fetch', vi.fn(async () => successResponse({ expires_at: expiresAt })));
    await expect(handoffToGrift(ENV, {
      submissionId: 'submission-1', inquiry: INQUIRY, session: SESSION, consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
  });

  it.each([
    'http://internal.grift.example',
    'https://127.0.0.1',
    'https://2130706433',
    'https://0x7f000001',
    'https://[::1]',
    'https://metadata.google.internal',
    'https://internal.grift.example/path',
    'https://user@internal.grift.example',
  ])('SSRFになり得るAPI origin設定を拒否する: %s', async (apiOrigin) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(handoffToGrift({ ...ENV, GRIFT_API_ORIGIN: apiOrigin }, {
      submissionId: 'submission-1', inquiry: INQUIRY, session: SESSION, consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([undefined, '', 'bad token', 'bad\nsecret'])('Bearer token不足/不正はfallbackにする', async (token) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(handoffToGrift({ ...ENV, CLOUDIA_HANDOFF_AUTH_TOKEN: token }, {
      submissionId: 'submission-1', inquiry: INQUIRY, session: SESSION, consent: CONSENT,
    })).resolves.toEqual({ status: 'fallback' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('duplicate成功も同じsubmission IDを冪等キーにしてreadyを返す', async () => {
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async (_url, init) => successResponseForRequest(init, { duplicate: true }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(handoffToGrift(ENV, {
      submissionId: 'same-submission-id',
      inquiry: INQUIRY,
      session: SESSION,
      consent: CONSENT,
    })).resolves.toMatchObject({ status: 'ready' });
    const [, init] = fetchMock.mock.calls[0];
    if (!init) throw new Error('Grift request init missing');
    expect((init.headers as Record<string, string>)['idempotency-key']).toBe('same-submission-id');
  });

  it('ログへPII・service secret・公開URLを出さない', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const rejectedUrl = 'https://evil.example/chat/portal/token-must-not-be-logged';
    vi.stubGlobal('fetch', vi.fn(async () => successResponse({ chat_url: rejectedUrl })));
    await handoffToGrift(ENV, {
      submissionId: 'submission-1',
      inquiry: INQUIRY,
      session: SESSION,
      consent: CONSENT,
    });
    const output = JSON.stringify(log.mock.calls);
    expect(output).not.toContain(INQUIRY.email);
    expect(output).not.toContain(ENV.CLOUDIA_HANDOFF_AUTH_TOKEN);
    expect(output).not.toContain(rejectedUrl);
    expect(output).not.toContain('submission-1');
  });
});

function post(body: Record<string, unknown>, ip: string): Request {
  return new Request('https://cor-jp.com/api/contact/submit', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cf-connecting-ip': ip,
    },
    body: JSON.stringify(body),
  });
}

function confirmedHandoffFields(intent: ContactIntent = 'contract-dev') {
  return {
    intent,
    summaryText: {
      version: 1,
      locale: 'ja',
      intent,
      classification: 'genuine',
      readyForContact: true,
      stage: 'ready',
      structuredLead: INQUIRY.structuredLead,
      text: '画面で確認済みの編集要約',
    },
    handoffConsent: {
      accepted: true,
      version: 'cloudia-grift-v1',
      acceptedAt: CONSENT.browserAcceptedAt,
      summaryConfirmed: true,
    },
  };
}

async function createDb(options: {
  active?: boolean;
  classification?: 'genuine' | 'sales' | 'spam';
  intent?: ContactIntent;
} = {}) {
  const excerpt = await encryptText('storage-secret', '暗号化済み会話抜粋');
  const calls: Array<{ sql: string; bindings: unknown[] }> = [];
  let existing: {
    submission_id: string;
    receipt_id: string;
    payload_fingerprint: string;
    metadata_json: string | null;
  } | null = null;
  return {
    calls,
    prepare(sql: string) {
      return {
        bind(...bindings: unknown[]) {
          calls.push({ sql, bindings });
          if (sql.includes('INSERT INTO submission_intake')) {
            existing = {
              submission_id: String(bindings[0]),
              receipt_id: String(bindings[4]),
              payload_fingerprint: String(bindings[2]),
              metadata_json: null,
            };
          }
          if (sql.includes('INSERT INTO audit_events') && existing) {
            existing.metadata_json = String(bindings[3]);
          }
          return {
            first: async <T>() => {
              if (sql.includes('FROM contact_sessions') && sql.includes("status = 'active'")) {
                if (options.active === false) return null as T;
                if (sql.includes('conversation_excerpt_ciphertext')) {
                  return { session_id: 'session-1', conversation_excerpt_ciphertext: excerpt } as T;
                }
                return {
                  session_id: 'session-1',
                  intent: options.intent || 'contract-dev',
                  locale: 'ja',
                  source: 'cloudia',
                  classification: options.classification || 'genuine',
                  summary_text: 'D1で検証済みの相談要約',
                  structured_lead_json: JSON.stringify(INQUIRY.structuredLead),
                } as T;
              }
              if (sql.includes('FROM submission_intake s')) return existing as T;
              return null as T;
            },
            run: async () => ({ meta: { changes: 1 } }),
          };
        },
      };
    },
    batch: async () => undefined,
  } as unknown as D1Database & { calls: Array<{ sql: string; bindings: unknown[] }> };
}

function submitEnv(db: D1Database, queueSend: (message: unknown) => Promise<void>): Env {
  return {
    ...ENV,
    DB: db,
    CONTACT_NOTIFICATIONS: { send: queueSend } as unknown as Queue,
    PII_ENCRYPTION_KEY: 'storage-secret',
    PII_HMAC_KEY: 'hmac-secret',
  };
}

describe('POST /api/contact/submit Grift integration', () => {
  it('Grift accepted_atはbrowser時刻ではなくWorker受信時刻を送る', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(WORKER_RECEIVED_AT));
    const db = await createDb();
    const queueSend = vi.fn(async () => undefined);
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async (_url, init) => successResponseForRequest(init),
    );
    vi.stubGlobal('fetch', fetchMock);
    const response = await worker.fetch(post({
      sessionId: 'session-1',
      idempotencyKey: 'worker-consent-time',
      name: INQUIRY.name,
      email: INQUIRY.email,
      message: INQUIRY.message,
      ...confirmedHandoffFields(),
    }, '198.51.100.30'), submitEnv(db, queueSend));

    expect(response.status).toBe(200);
    const [, init] = fetchMock.mock.calls[0];
    if (!init) throw new Error('Grift request init missing');
    const payload = JSON.parse(String(init.body)) as {
      consent?: { accepted_at?: string; browser_accepted_at?: string };
      inquiry?: { summary?: string };
    };
    expect(payload.consent?.accepted_at).toBe(WORKER_RECEIVED_AT);
    expect(payload.consent?.accepted_at).not.toBe(BROWSER_ACCEPTED_AT);
    expect(payload.consent?.browser_accepted_at).toBeUndefined();
    expect(payload.inquiry?.summary).toBe('画面で確認済みの編集要約');
    const insert = db.calls.find((call) => call.sql.includes('INSERT INTO submission_intake'));
    await expect(decryptText('storage-secret', String(insert?.bindings[9])))
      .resolves.toBe('画面で確認済みの編集要約');
    expect(payload.inquiry?.summary).not.toBe('D1で検証済みの相談要約');
  });

  it.each(['success', 'failure'] as const)('Grift %sでも社内通知と本人receiptを維持する', async (outcome) => {
    const db = await createDb();
    const queueSend = vi.fn(async () => undefined);
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: RequestInit) => outcome === 'success'
      ? successResponseForRequest(init)
      : new Response('failure', { status: 503 })));
    const response = await worker.fetch(post({
      sessionId: 'session-1',
      idempotencyKey: `email-maintained-${outcome}`,
      name: INQUIRY.name,
      email: INQUIRY.email,
      company: INQUIRY.company,
      message: INQUIRY.message,
      ...confirmedHandoffFields(),
    }, outcome === 'success' ? '198.51.100.31' : '198.51.100.32'), submitEnv(db, queueSend));

    expect(response.status).toBe(200);
    expect(queueSend).toHaveBeenCalledTimes(2);
    expect(queueSend).toHaveBeenCalledWith(expect.objectContaining({ messageType: 'internal' }));
    expect(queueSend).toHaveBeenCalledWith(expect.objectContaining({ messageType: 'receipt' }));
    const body = await response.json() as { handoff?: { status?: string } };
    expect(body.handoff?.status).toBe(outcome === 'success' ? 'ready' : 'fallback');
  });

  it('既存submissionの再送は同じsubmission IDでGriftを冪等呼出しする', async () => {
    const db = await createDb();
    const queueSend = vi.fn(async () => undefined);
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async (_url, init) => successResponseForRequest(init, { duplicate: true }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const requestBody = {
      sessionId: 'session-1',
      idempotencyKey: 'duplicate-client-key',
      name: INQUIRY.name,
      email: INQUIRY.email,
      message: INQUIRY.message,
      ...confirmedHandoffFields(),
    };
    const env = submitEnv(db, queueSend);
    const firstResponse = await worker.fetch(post(requestBody, '198.51.100.33'), env);
    const response = await worker.fetch(post(requestBody, '198.51.100.35'), env);

    expect(firstResponse.status).toBe(200);
    expect(response.status).toBe(200);
    const body = await response.json() as { duplicate?: boolean; handoff?: { status?: string } };
    expect(body.duplicate).toBe(true);
    expect(body.handoff?.status).toBe('ready');
    const [, init] = fetchMock.mock.calls[1];
    if (!init) throw new Error('Grift request init missing');
    expect((init.headers as Record<string, string>)['idempotency-key'])
      .toBe((fetchMock.mock.calls[0][1]?.headers as Record<string, string>)['idempotency-key']);
  });

  it('同じidempotency keyで確認済みsummaryが変われば409にして再handoffしない', async () => {
    const db = await createDb();
    const queueSend = vi.fn(async () => undefined);
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async (_url, init) => successResponseForRequest(init),
    );
    vi.stubGlobal('fetch', fetchMock);
    const env = submitEnv(db, queueSend);
    const base = {
      sessionId: 'session-1',
      idempotencyKey: 'summary-conflict-key',
      name: INQUIRY.name,
      email: INQUIRY.email,
      message: INQUIRY.message,
      ...confirmedHandoffFields(),
    };
    const first = await worker.fetch(post(base, '198.51.100.36'), env);
    const second = await worker.fetch(post({
      ...base,
      summaryText: {
        ...(base.summaryText as Record<string, unknown>),
        text: '編集後の別要約',
      },
    }, '198.51.100.37'), env);
    expect(first.status).toBe(200);
    expect(second.status).toBe(409);
    await expect(second.json()).resolves.toMatchObject({ code: 'IDEMPOTENCY_PAYLOAD_CONFLICT' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(queueSend).toHaveBeenCalledTimes(2);
  });

  it.each([undefined, false])('summaryConfirmed=%sではGriftを呼ばずメールQueueだけ維持する', async (summaryConfirmed) => {
    const db = await createDb();
    const queueSend = vi.fn(async () => undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const fields = confirmedHandoffFields();
    const response = await worker.fetch(post({
      sessionId: 'session-1',
      idempotencyKey: `unconfirmed-${String(summaryConfirmed)}`,
      name: INQUIRY.name,
      email: INQUIRY.email,
      message: INQUIRY.message,
      ...fields,
      handoffConsent: summaryConfirmed === undefined
        ? {
            accepted: fields.handoffConsent.accepted,
            version: fields.handoffConsent.version,
            acceptedAt: fields.handoffConsent.acceptedAt,
          }
        : { ...fields.handoffConsent, summaryConfirmed },
    }, summaryConfirmed === undefined ? '198.51.100.38' : '198.51.100.39'), submitEnv(db, queueSend));
    expect(response.status).toBe(200);
    const body = await response.json() as { handoff?: unknown };
    expect(body.handoff).toBeUndefined();
    expect(queueSend).toHaveBeenCalledTimes(2);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    undefined,
    'legacy summary string',
    { version: 1, locale: 'ja', intent: 'contract-dev', classification: 'genuine', text: '' },
    { version: 1, locale: 'ja', intent: 'contract-dev', classification: 'genuine', summaryText: 'alias only' },
    { version: 1, locale: 'ja', intent: 'contract-dev', classification: 'genuine', text: 'user@example.comへ連絡' },
    { version: 1, locale: 'ja', intent: 'contract-dev', classification: 'genuine', text: 'token: sk-abcdefghijklmnop' },
  ])('確認同意があってもsummaryText.text厳格契約外なら400: %j', async (summaryText) => {
    const db = await createDb();
    const queueSend = vi.fn(async () => undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const fields = confirmedHandoffFields();
    const response = await worker.fetch(post({
      sessionId: 'session-1',
      idempotencyKey: `invalid-summary-${typeof summaryText}`,
      name: INQUIRY.name,
      email: INQUIRY.email,
      message: INQUIRY.message,
      intent: fields.intent,
      summaryText,
      handoffConsent: fields.handoffConsent,
    }, '198.51.100.40'), submitEnv(db, queueSend));
    expect(response.status).toBe(400);
    expect(queueSend).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('期限切れD1 sessionではGriftを呼ばずfallbackにする', async () => {
    const db = await createDb({ active: false });
    const queueSend = vi.fn(async () => undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await worker.fetch(post({
      sessionId: 'session-1',
      idempotencyKey: 'expired-session',
      name: INQUIRY.name,
      email: INQUIRY.email,
      message: INQUIRY.message,
      ...confirmedHandoffFields(),
    }, '198.51.100.60'), submitEnv(db, queueSend));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ handoff: { status: 'fallback' } });
    expect(queueSend).toHaveBeenCalledTimes(2);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('internal→receiptのQueue登録を開始し、両方完了するまでGriftを呼ばない', async () => {
    const db = await createDb();
    const resolvers: Array<() => void> = [];
    const queueSend = vi.fn((_message: unknown) => new Promise<void>((resolve) => resolvers.push(resolve)));
    const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
      async (_url, init) => successResponseForRequest(init),
    );
    vi.stubGlobal('fetch', fetchMock);
    const pending = worker.fetch(post({
      sessionId: 'session-1',
      idempotencyKey: 'queue-barrier',
      name: INQUIRY.name,
      email: INQUIRY.email,
      message: INQUIRY.message,
      ...confirmedHandoffFields(),
    }, '198.51.100.61'), submitEnv(db, queueSend));
    await vi.waitFor(() => expect(queueSend).toHaveBeenCalledTimes(2));
    expect(queueSend.mock.calls.map(([message]) => (message as { messageType?: string }).messageType))
      .toEqual(['internal', 'receipt']);
    expect(fetchMock).not.toHaveBeenCalled();
    resolvers[1]();
    await Promise.resolve();
    expect(fetchMock).not.toHaveBeenCalled();
    resolvers[0]();
    expect((await pending).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('Queue例外のmessageにPII/tokenがあってもログへ出さずGriftを呼ばない', async () => {
    const secretError = `${INQUIRY.email} ${ENV.CLOUDIA_HANDOFF_AUTH_TOKEN}`;
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const db = await createDb();
    const queueSend = vi.fn(async () => { throw new Error(secretError); });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await worker.fetch(post({
      sessionId: 'session-1',
      idempotencyKey: 'queue-error-log',
      name: INQUIRY.name,
      email: INQUIRY.email,
      message: INQUIRY.message,
      ...confirmedHandoffFields(),
    }, '198.51.100.62'), submitEnv(db, queueSend));
    expect(response.status).toBe(503);
    const output = JSON.stringify(log.mock.calls);
    expect(output).not.toContain(INQUIRY.email);
    expect(output).not.toContain(ENV.CLOUDIA_HANDOFF_AUTH_TOKEN);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Content-Lengthなし64KiB超request bodyをstreaming拒否する', async () => {
    const db = await createDb();
    const queueSend = vi.fn(async () => undefined);
    const request = post({
      name: INQUIRY.name,
      email: INQUIRY.email,
      message: 'x'.repeat(70 * 1024),
    }, '198.51.100.63');
    expect(request.headers.get('content-length')).toBeNull();
    const response = await worker.fetch(request, submitEnv(db, queueSend));
    expect(response.status).toBe(400);
    expect(queueSend).not.toHaveBeenCalled();
  });

  it('honeypot spamはGriftも通知Queueも呼ばず従来どおり200を返す', async () => {
    const db = await createDb();
    const queueSend = vi.fn(async () => undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await worker.fetch(post({
      sessionId: 'session-1',
      name: INQUIRY.name,
      email: INQUIRY.email,
      message: INQUIRY.message,
      website: 'https://spam.example',
      ...confirmedHandoffFields(),
    }, '198.51.100.34'), submitEnv(db, queueSend));

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(queueSend).not.toHaveBeenCalled();
  });
});
