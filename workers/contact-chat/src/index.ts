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
  if (text.length > MAX_BODY_BYTES) return null;
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
function parseChatResult(raw: string): ChatResult {
  let reply = raw.trim();
  let classification: Classification = 'genuine';
  let readyForContact = false;

  // ```json フェンスが付いていた場合に備えて剥がす。
  const fenced = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : reply;
  try {
    const obj = JSON.parse(candidate) as Partial<ChatResult>;
    if (obj && typeof obj === 'object') {
      if (typeof obj.reply === 'string') reply = obj.reply.trim();
      if (typeof obj.classification === 'string' && VALID_CLASS.includes(obj.classification)) {
        classification = obj.classification;
      }
      if (typeof obj.readyForContact === 'boolean') readyForContact = obj.readyForContact;
    }
  } catch {
    // JSON でなければ、モデルの素の文章を reply として返す（会話を止めない）。
  }
  if (!reply) reply = '申し訳ありません、もう一度お聞かせいただけますか？';
  return { reply, classification, readyForContact };
}

// POST /api/contact/chat — 会話による問い合わせの絞り込み。PIIは扱わない。
async function handleChat(req: Request, env: Env): Promise<Response> {
  const body = await readJsonBody(req);
  if (!body) return json({ error: 'リクエストボディが不正なJSONです' }, 400);

  // Turnstile（シークレットがあれば検証。無ければスキップ＝fail open）。
  const ip = clientIp(req);
  const ts = await verifyTurnstile(env, body.turnstileToken, ip);
  if (!ts.ok) return json({ error: ts.error }, ts.status);

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
