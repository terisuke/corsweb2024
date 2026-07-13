import type { Env, NormalizedInquiry } from './types';

// --- メール送信プロバイダ抽象化 ---
// 既定実装は Resend API。将来 SendGrid / SES 等を足すときは EmailProvider を実装するだけ。
// replyTo: 問い合わせ者のメール（担当者が「返信」で直接顧客に届くようにする）。
export interface EmailProvider {
  send(to: string, from: string, subject: string, text: string, replyTo?: string, cc?: string): Promise<void>;
}

const RESEND_URL = 'https://api.resend.com/emails';

class ResendProvider implements EmailProvider {
  constructor(private readonly apiKey: string) {}

  async send(
    to: string,
    from: string,
    subject: string,
    text: string,
    replyTo?: string, cc?: string,
  ): Promise<void> {
    // 重要(セキュリティ): 本文は必ず `text` のみで送る。`html` は使わない。
    // reply は LLM 出力ではないが（ここは /submit のPII本文）、staff の webmail での
    // stored-XSS を構造的に防ぐため、HTMLレンダリングされる経路を作らない方針を徹底する。
    const payload: Record<string, unknown> = { from, to, subject, text };
    // reply_to は isValidEmail 済み（単一アドレス・CRLFなし）なのでヘッダ注入の心配なし。
    if (replyTo) payload.reply_to = replyTo;
    if (cc) payload.cc = cc;
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      // 本文（鍵を含みうる）はログに出さず、ステータスのみ。
      throw new Error(`メール送信に失敗しました（status ${res.status}）`);
    }
  }
}

export type EmailProviderResult =
  | { ok: true; provider: EmailProvider }
  | { ok: false; status: number; error: string };

// RESEND_API_KEY 未設定なら fail closed（503）。本物の問い合わせをサイレントに握り潰さない。
export function getEmailProvider(env: Env): EmailProviderResult {
  if (!env.RESEND_API_KEY) {
    return {
      ok: false,
      status: 503,
      error: 'お問い合わせの送信設定が未完了です。お手数ですが時間をおいて再度お試しください。',
    };
  }
  return { ok: true, provider: new ResendProvider(env.RESEND_API_KEY) };
}

// 件名: 分類・intent を含め、社内でトリアージしやすくする。
export function buildSubject(inquiry: NormalizedInquiry): string {
  const tags: string[] = [];
  if (inquiry.classification) tags.push(inquiry.classification);
  if (inquiry.intent) tags.push(inquiry.intent);
  const prefix = tags.length ? `[${tags.join('][')}] ` : '';
  return `${prefix}お問い合わせ: ${inquiry.name}`;
}

// 本文: 構造化した問い合わせ＋会話サマリ＋分類メモ。
// PII（name/email/company/message）はこのメール本文にのみ載る。LLM には絶対に渡さない。
export function buildBody(inquiry: NormalizedInquiry): string {
  const lines = [
    'cor-jp.com のお問い合わせフォーム（AIチャット）から新しい問い合わせが届きました。',
    '',
    '── お問い合わせ内容 ──',
    `お名前　: ${inquiry.name}`,
    `メール　: ${inquiry.email}`,
    `会社名　: ${inquiry.company || '(未記入)'}`,
    `intent　: ${inquiry.intent || '(未指定)'}`,
    `source　: ${inquiry.source || '(未指定)'}`,
    '',
    '── 本文 ──',
    inquiry.message,
  ];
  const lead = inquiry.structuredLead || {};
  const leadLines: string[] = [];
  if (lead.purpose) leadLines.push(`目的　　: ${lead.purpose}`);
  if (lead.industryRole) leadLines.push(`業種・役割: ${lead.industryRole}`);
  if (lead.dataSensitivity) leadLines.push(`データ感度: ${lead.dataSensitivity}`);
  if (lead.stage) leadLines.push(`進捗段階: ${lead.stage}`);
  if (lead.timingBudget) leadLines.push(`時期・予算: ${lead.timingBudget}`);
  if (leadLines.length) {
    lines.push('', '── 構造化リード（非PII） ──', ...leadLines);
  }
  const utmEntries = Object.entries(inquiry.utm || {});
  if (utmEntries.length) {
    lines.push('', '── UTM ──');
    for (const [k, v] of utmEntries) lines.push(`${k}: ${v}`);
  }
  if (inquiry.conversationSummary) {
    lines.push('', '── AIチャットの会話サマリ ──', inquiry.conversationSummary);
  }
  lines.push(
    '',
    '── AIによる分類（参考） ──',
    inquiry.classification || '(未分類)',
    '',
    '※この分類はAIの自動判定です。最終判断は担当者が行ってください。',
  );
  return lines.join('\n');
}

// 問い合わせメールを社内インボックスへ送る。
// 差出人は CONTACT_FROM_EMAIL 固定（なりすまし防止）だが、reply_to に問い合わせ者の
// メールを入れることで、担当者が「返信」すると顧客へ直接届く（contact flow を壊さない）。
export async function sendInquiryEmail(
  env: Env,
  provider: EmailProvider,
  inquiry: NormalizedInquiry,
): Promise<void> {
  await provider.send(
    env.CONTACT_TO_EMAIL || 'cloudia@cor-jp.com',
    env.CONTACT_FROM_EMAIL,
    buildSubject(inquiry),
    buildBody(inquiry),
    inquiry.email, // reply_to: isValidEmail 済みの単一アドレス
    env.CONTACT_CC_EMAIL || 'company@cor-jp.com',
  );
}
