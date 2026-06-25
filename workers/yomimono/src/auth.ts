import type { Env } from './types';

// Cloudflare Access の JWT（Cf-Access-Jwt-Assertion）を暗号検証する。
// ヘッダ Cf-Access-Authenticated-User-Email は偽装可能なので信頼しない。
// 署名検証 + aud/iss/exp + メールドメインを全て満たした場合のみメールを返す。

interface Jwk {
  kid: string;
  kty: string;
  alg?: string;
  n: string;
  e: string;
}

interface JwtPayload {
  aud?: string | string[];
  exp?: number;
  iss?: string;
  email?: string;
}

// インフライトの fetch を Promise ごと共有し、TTL切れ直後の同時多発 fetch（スタンピード）を防ぐ。
let certCachePromise: Promise<{ keys: Jwk[]; fetchedAt: number }> | null = null;

async function getCerts(teamDomain: string): Promise<Jwk[]> {
  const now = Date.now();
  if (certCachePromise) {
    const cached = await certCachePromise;
    if (now - cached.fetchedAt < 3_600_000) return cached.keys;
  }
  certCachePromise = fetch(`https://${teamDomain}/cdn-cgi/access/certs`)
    .then(async (res) => {
      if (!res.ok) throw new Error('Cloudflare Access の証明書取得に失敗しました');
      const data = (await res.json()) as { keys: Jwk[] };
      return { keys: data.keys ?? [], fetchedAt: Date.now() };
    })
    .catch((err) => {
      certCachePromise = null; // エラー時はキャッシュを破棄して次回リトライ可能に
      throw err;
    });
  return (await certCachePromise).keys;
}

function b64urlToBytes(s: string): Uint8Array {
  const norm = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + ((4 - (s.length % 4)) % 4), '=');
  const bin = atob(norm);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function decodeJson<T>(b64url: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(b64urlToBytes(b64url))) as T;
  } catch {
    return null;
  }
}

// 検証成功で cor-jp.com のメール、失敗で null。設定未完了(team/aud未設定)も null（fail closed）。
export async function verifyAccessEmail(req: Request, env: Env): Promise<string | null> {
  const team = env.CF_ACCESS_TEAM_DOMAIN;
  const aud = env.CF_ACCESS_AUD;
  if (!team || !aud) return null;

  const token = req.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;

  const header = decodeJson<{ alg?: string; kid?: string }>(headerB64);
  const payload = decodeJson<JwtPayload>(payloadB64);
  if (!header || !payload || header.alg !== 'RS256' || !header.kid) return null;

  let keys: Jwk[];
  try {
    keys = await getCerts(team);
  } catch {
    return null;
  }
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;

  let valid = false;
  try {
    const key = await crypto.subtle.importKey(
      'jwk',
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    valid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      b64urlToBytes(sigB64),
      new TextEncoder().encode(`${headerB64}.${payloadB64}`),
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp < nowSec) return null;
  if (payload.iss !== `https://${team}`) return null; // iss は必須（欠落トークンも拒否）
  const audOk = Array.isArray(payload.aud) ? payload.aud.includes(aud) : payload.aud === aud;
  if (!audOk) return null;

  const email = payload.email;
  if (!email || !email.toLowerCase().endsWith(`@${env.ALLOWED_EMAIL_DOMAIN.toLowerCase()}`)) {
    return null;
  }
  return email;
}
