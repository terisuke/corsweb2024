import type { Env } from './types';

// Cloudflare Access の代わりに Worker 自身でログインセッションを管理する。
// 合言葉(ACCESS_PASSWORD) → HMAC署名つきセッションCookie を発行し、以降はそれで認証する。
// 署名鍵 = SESSION_SECRET。どちらか未設定なら全て fail closed（401）。

const COOKIE = 'yomimono_session';
const TTL_SEC = 48 * 3600; // 48時間（main書込み権限を持つツールのため短め。失効はSESSION_SECRETローテで全消し）

function b64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return b64url(new Uint8Array(sig));
}

// 定数時間比較（タイミング攻撃対策）。長さが違えば即 false。
export function ctEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// 合言葉の照合。両者を SESSION_SECRET でHMAC化して固定長で定数時間比較（長さも秘匿）。
export async function checkPassword(env: Env, password: unknown): Promise<boolean> {
  if (!env.ACCESS_PASSWORD || !env.SESSION_SECRET || typeof password !== 'string') return false;
  const a = await hmac(env.SESSION_SECRET, 'pw:' + password);
  const b = await hmac(env.SESSION_SECRET, 'pw:' + env.ACCESS_PASSWORD);
  return ctEq(a, b);
}

export async function createSessionCookie(env: Env): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + TTL_SEC;
  const sig = await hmac(env.SESSION_SECRET, String(exp));
  const path = env.BASE_PATH || '/';
  return `${COOKIE}=${exp}.${sig}; HttpOnly; Secure; SameSite=Lax; Path=${path}; Max-Age=${TTL_SEC}`;
}

export function clearSessionCookie(env: Env): string {
  const path = env.BASE_PATH || '/';
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=${path}; Max-Age=0`;
}

// セッションCookieを検証。署名不一致・期限切れ・未設定は false（fail closed）。
export async function verifySession(req: Request, env: Env): Promise<boolean> {
  if (!env.ACCESS_PASSWORD || !env.SESSION_SECRET) return false;
  const cookie = req.headers.get('Cookie') || '';
  const m = cookie.match(/(?:^|;\s*)yomimono_session=([^;\s]+)/);
  if (!m) return false;
  const parts = m[1].split('.');
  if (parts.length !== 2) return false;
  const [exp, sig] = parts;
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  let expected: string;
  try {
    expected = await hmac(env.SESSION_SECRET, exp);
  } catch {
    return false;
  }
  return ctEq(sig, expected);
}
