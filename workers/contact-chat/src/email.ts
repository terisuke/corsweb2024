import type { Env, NormalizedInquiry } from './types';

// --- メール送信プロバイダ抽象化 ---
// 既定実装は Resend API。将来 SendGrid / SES 等を足すときは EmailProvider を実装するだけ。
export interface EmailProvider {
  send(to: string, from: string, subject: string, text: string): Promise<void>;
}

const RESEND_URL = 'https://api.resend.com/emails';

class ResendProvider implements EmailProvider {
  constructor(private readonly apiKey: string) {}

  async send(to: string, from: string, subject: string, text: string): Promise<void> {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, text }),
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

// 件名: 分類を含め、社内でトリアージしやすくする。
export function buildSubject(inquiry: NormalizedInquiry): string {
  const tag = inquiry.classification ? `[${inquiry.classification}] ` : '';
  return `${tag}お問い合わせ: ${inquiry.name}`;
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
    '',
    '── 本文 ──',
    inquiry.message,
  ];
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

// 問い合わせメールを社内インボックスへ送る。reply-to に問い合わせ者のメールを入れたいが、
// Resend の text 送信に留め、差出人は CONTACT_FROM_EMAIL 固定（なりすまし防止）。
export async function sendInquiryEmail(
  env: Env,
  provider: EmailProvider,
  inquiry: NormalizedInquiry,
): Promise<void> {
  await provider.send(
    env.CONTACT_TO_EMAIL,
    env.CONTACT_FROM_EMAIL,
    buildSubject(inquiry),
    buildBody(inquiry),
  );
}
