import type { ChatResult, Classification, Env, InquiryInput } from './types';
import { normalizeMessages, normalizeInquiry } from './validate';
import {
  CHAT_LIMIT,
  SUBMIT_LIMIT,
  clientIp,
  isRateLimited,
  isSameOrigin,
  verifyTurnstile,
} from './security';
import { SYSTEM_PROMPT, getProvider } from './llm';
import { getEmailProvider, sendInquiryEmail } from './email';

// 最大リクエストボディサイズ（DoS/暴走入力対策）。会話＋サマリでも十分な余裕。
const MAX_BODY_BYTES = 64 * 1024;

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      // 認証なしの公開エンドポイントだがキャッシュさせない（応答に分類等が含まれるため）。
      'cache-control': 'no-store',
    },
  });

// JSON ボディを上限つきで読む。Content-Type が JSON でない／不正JSON／過大は null。
async function readJsonBody(req: Request): Promise<Record<string, unknown> | null> {
  const ct = req.headers.get('content-type') || '';
  if (!/application\/json/i.test(ct)) return null;
  // Content-Length で早期に過大ボディを弾く（無い場合は読み取り後に長さ確認）。
  const len = Number(req.headers.get('content-length') || '0');
  if (len > MAX_BODY_BYTES) return null;
  let text: string;
  try {
    text = await req.text();
  } catch {
    return null;
  }
  // 読み取り後のサイズ確認はバイト数で行う（Content-Length はバイト、text.length は
  // UTF-16コード単位。CJKでは1文字3バイト等になり、文字数だと上限がザルになる）。
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return null;
  try {
    const data = JSON.parse(text);
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// LLM の出力（JSON文字列のはず）を厳格にパースし、ChatResult へ正規化する。
// 形式が崩れていても安全側に倒す（reply はテキストとして扱い、分類は genuine 既定）。
const VALID_CLASS: readonly Classification[] = ['genuine', 'sales', 'spam'];

// 文字列リテラルを尊重しながら、最初のトップレベル `{...}` を抜き出す。
// 散文に包まれた JSON（"Sure!\n{...}"）や、reply 値に ``` を含むケースでも、
// JSON 部分だけを正しく取り出せる（フェンス正規表現では取りこぼす）。
export function extractJsonObject(s: string): string | null {
  const start = s.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') inStr = true;
    else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return s.slice(start, i + 1);
  }
  return null;
}

// LLM の出力（JSON文字列のはず）を厳格にパースし、ChatResult へ正規化する。
// 形式が崩れていても安全側に倒す（生のモデル出力を reply として漏らさない）。
// 試行順: (a) フェンスブロック → (b) trim 全体 → (c) extractJsonObject。
// 全て失敗したときのみ素のテキストへフォールバックする。
export function parseChatResult(raw: string): ChatResult {
  const trimmed = raw.trim();
  let classification: Classification = 'genuine';
  let readyForContact = false;

  // 候補を優先順で構築（最初に parse 成功したものを採用）。
  const candidates: string[] = [];
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) candidates.push(fenced[1].trim());
  candidates.push(trimmed);
  const extracted = extractJsonObject(trimmed);
  if (extracted) candidates.push(extracted);

  let reply = '';
  let parsedOk = false;
  for (const candidate of candidates) {
    try {
      const obj = JSON.parse(candidate);
      // 配列/数値/null も JSON.parse は通すため、オブジェクトのみ採用する。
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) continue;
      const o = obj as Partial<ChatResult>;
      if (typeof o.reply === 'string') reply = o.reply.trim();
      if (typeof o.classification === 'string' && VALID_CLASS.includes(o.classification)) {
        classification = o.classification;
      }
      if (typeof o.readyForContact === 'boolean') readyForContact = o.readyForContact;
      parsedOk = true;
      break;
    } catch {
      // 次の候補へ。
    }
  }

  // どの候補も object として parse できなければ、素の文章を reply とする（会話を止めない）。
  // ただし生の JSON ブロブをそのまま返さないよう、parse 成功時は reply のみを使う。
  if (!parsedOk) reply = trimmed;
  if (!reply) reply = '申し訳ありません、もう一度お聞かせいただけますか？';
  return { reply, classification, readyForContact };
}

// POST /api/contact/chat — 会話による問い合わせの絞り込み。PIIは扱わない。
// Turnstile は付与しない（トークンは単回使用で、複数ターン会話では2ターン目以降に
// 新しいトークンが無く 403 になってしまうため）。/chat の悪用対策は
// レート制限＋同一オリジン＋（必須の）Cloudflare WAF レート制限ルールで担保する。
// PII を扱う本命の濫用点である /submit でのみ Turnstile を要求する。
async function handleChat(req: Request, env: Env): Promise<Response> {
  const body = await readJsonBody(req);
  if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);

  const norm = normalizeMessages(body.messages);
  if (!norm.ok) return json({ error: norm.error }, norm.status);

  // fail closed: LLM 未設定なら 503（getProvider が投げる）。
  let provider;
  try {
    provider = getProvider(env);
  } catch {
    return json({ error: 'AIが一時的に利用できません。時間をおいて再試行してください' }, 503);
  }

  let raw: string;
  try {
    raw = await provider.chat(SYSTEM_PROMPT, norm.messages);
  } catch (e) {
    console.error('contact-chat llm error:', e instanceof Error ? e.message : String(e));
    return json({ error: 'AIの応答に失敗しました。時間をおいて再試行してください' }, 502);
  }

  return json(parseChatResult(raw));
}

// POST /api/contact/submit — 最終送信。PIIはここで扱い、LLMには絶対渡さずメールにのみ送る。
async function handleSubmit(req: Request, env: Env): Promise<Response> {
  const body = await readJsonBody(req);
  if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);

  // Turnstile（シークレットがあれば検証）。
  const ip = clientIp(req);
  const ts = await verifyTurnstile(env, body.turnstileToken, ip);
  if (!ts.ok) return json({ error: ts.error }, ts.status);

  const norm = normalizeInquiry(body as InquiryInput);
  if (!norm.ok) {
    // ハニーポット命中時は bot に成功を装って 200（実際には送信しない）。
    if (norm.honeypot) return json({ ok: true });
    return json({ error: norm.error }, norm.status);
  }

  // fail closed: メール未設定なら 503（本物の問い合わせを握り潰さない）。
  const emailProvider = getEmailProvider(env);
  if (!emailProvider.ok) {
    console.error('contact-chat email not configured (RESEND_API_KEY unset)');
    return json({ error: emailProvider.error }, emailProvider.status);
  }

  try {
    await sendInquiryEmail(env, emailProvider.provider, norm.inquiry);
  } catch (e) {
    console.error('contact-chat email send error:', e instanceof Error ? e.message : String(e));
    return json({ error: 'お問い合わせの送信に失敗しました。時間をおいて再試行してください' }, 502);
  }

  return json({ ok: true });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    // 死活確認（認証不要・PIIなし）。
    if (req.method === 'GET' && path === '/api/contact/health') {
      return json({ ok: true });
    }

    try {
      // 同一オリジン強制（CORSは開けない。cor-jp.com 上のウィジェットのみ）。
      if (!isSameOrigin(req)) {
        return json({ error: 'origin not allowed' }, 403);
      }

      if (req.method === 'POST' && path === '/api/contact/chat') {
        const ip = clientIp(req);
        if (isRateLimited(`chat:${ip}`, CHAT_LIMIT)) {
          return json({ error: 'リクエストが多すぎます。少し待ってから再試行してください' }, 429);
        }
        return await handleChat(req, env);
      }

      if (req.method === 'POST' && path === '/api/contact/submit') {
        const ip = clientIp(req);
        if (isRateLimited(`submit:${ip}`, SUBMIT_LIMIT)) {
          return json({ error: 'リクエストが多すぎます。少し待ってから再試行してください' }, 429);
        }
        return await handleSubmit(req, env);
      }

      return json({ error: 'Not Found' }, 404);
    } catch (e: unknown) {
      // 詳細はサーバー側ログのみ。クライアントには汎用メッセージ（内部情報の漏洩防止）。
      console.error('contact-chat error:', e instanceof Error ? e.message : String(e));
      return json({ error: '処理中にエラーが発生しました' }, 500);
    }
  },
};
