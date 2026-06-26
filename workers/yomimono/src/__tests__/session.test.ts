import { describe, it, expect } from 'vitest';
import {
  ctEq,
  checkPassword,
  createSessionCookie,
  verifySession,
  clearSessionCookie,
} from '../session';
import type { Env } from '../types';

const env = {
  ACCESS_PASSWORD: 'correct-horse-battery-staple',
  SESSION_SECRET: 'unit-test-session-secret-0123456789',
  BASE_PATH: '/brog',
} as unknown as Env;

// undici(Node)は Request の Cookie ヘッダを禁止ヘッダとして落とすため、最小モックで渡す。
const reqWithCookieStr = (cookie: string | null) =>
  ({ headers: { get: (n: string) => (n.toLowerCase() === 'cookie' ? cookie : null) } }) as unknown as Request;
const reqWithCookie = (setCookie: string) => reqWithCookieStr(setCookie.split(';')[0]);

describe('ctEq — 定数時間比較', () => {
  it('一致', () => expect(ctEq('abc', 'abc')).toBe(true));
  it('不一致', () => expect(ctEq('abc', 'abd')).toBe(false));
  it('長さ違い', () => expect(ctEq('abc', 'abcd')).toBe(false));
});

describe('checkPassword', () => {
  it('正しい合言葉は true', async () => {
    expect(await checkPassword(env, 'correct-horse-battery-staple')).toBe(true);
  });
  it('間違った合言葉は false', async () => {
    expect(await checkPassword(env, 'wrong')).toBe(false);
  });
  it('非文字列は false', async () => {
    expect(await checkPassword(env, 12345 as unknown as string)).toBe(false);
  });
  it('ACCESS_PASSWORD 未設定なら false（fail closed）', async () => {
    expect(await checkPassword({ ...env, ACCESS_PASSWORD: '' } as Env, 'correct-horse-battery-staple')).toBe(
      false,
    );
  });
});

describe('セッションCookie 検証', () => {
  it('正規のセッションは検証を通る', async () => {
    const cookie = await createSessionCookie(env);
    expect(await verifySession(reqWithCookie(cookie), env)).toBe(true);
  });
  it('署名を改ざんすると失敗する', async () => {
    const cookie = await createSessionCookie(env);
    const val = cookie.split(';')[0]; // yomimono_session=<exp>.<sig>
    const tampered = val.slice(0, -1) + (val.slice(-1) === 'A' ? 'B' : 'A');
    expect(await verifySession(reqWithCookieStr(tampered), env)).toBe(false);
  });
  it('Cookie が無ければ false', async () => {
    expect(await verifySession(reqWithCookieStr(null), env)).toBe(false);
  });
  it('期限切れ/偽署名は false', async () => {
    expect(
      await verifySession(reqWithCookieStr('yomimono_session=1000.deadbeefdeadbeef'), env),
    ).toBe(false);
  });
  it('SESSION_SECRET 未設定なら false（fail closed）', async () => {
    const cookie = await createSessionCookie(env);
    expect(await verifySession(reqWithCookie(cookie), { ...env, SESSION_SECRET: '' } as Env)).toBe(false);
  });
  it('clearSessionCookie は Max-Age=0', () => {
    expect(clearSessionCookie(env)).toContain('Max-Age=0');
  });
});
