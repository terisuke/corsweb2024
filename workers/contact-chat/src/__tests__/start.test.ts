import { afterEach, describe, expect, it } from 'vitest';
import worker from '../index';
import { resetRateLimits } from '../security';
import type { Env } from '../types';

afterEach(() => resetRateLimits());

const env = {
  LLM_PROVIDER: 'vertex-gemini',
  ANTHROPIC_API_KEY: '',
  RESEND_API_KEY: '',
  TURNSTILE_SECRET: '',
  CONTACT_TO_EMAIL: 'cloudia@cor-jp.com',
  CONTACT_FROM_EMAIL: 'noreply@cor-jp.com',
} as unknown as Env;

describe('chat start contract', () => {
  it('intent_selected starts a session without an empty LLM request', async () => {
    const response = await worker.fetch(new Request('https://cor-jp.com/api/contact/chat/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: 'intent_selected', intent: 'contract-dev', locale: 'ja' }),
    }), env);
    expect(response.status).toBe(200);
    const body = await response.json() as Record<string, unknown>;
    expect(body.intent).toBe('contract-dev');
    expect(body.reply).toContain('まず');
    expect(body.sessionId).toEqual(expect.any(String));
    expect(body.missingFields).toEqual(['purpose']);
  });
});
