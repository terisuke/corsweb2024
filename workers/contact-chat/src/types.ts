export interface Env {
  // secrets（wrangler secret put で登録）
  ANTHROPIC_API_KEY: string; // LLM_PROVIDER=anthropic のとき必須。未設定なら /chat を fail closed。
  RESEND_API_KEY: string; // /submit のメール送信に必須。未設定なら 503（本物の問い合わせを握り潰さない）。
  TURNSTILE_SECRET: string; // Cloudflare Turnstile。任意。未設定なら検証スキップ（turnstileのみ fail open）。
  // vars（公開可・非シークレット）
  LLM_PROVIDER: string; // 既定 'vertex-gemini'。'anthropic' でロールバック可能。
  GOOGLE_CLOUD_PROJECT?: string;
  GOOGLE_CLOUD_LOCATION?: string;
  VERTEX_MODEL?: string;
  VERTEX_GATEWAY_URL?: string;
  VERTEX_GATEWAY_SECRET?: string;
  CONTACT_TO_EMAIL: string; // 問い合わせメールの宛先（社内インボックス）。
  CONTACT_CC_EMAIL?: string;
  CONTACT_FROM_EMAIL: string; // 問い合わせメールの差出人。
  // D1/Queue は本番・Previewで別バインディングを設定する。未設定時は従来の直送経路を維持。
  DB?: D1Database;
  CONTACT_NOTIFICATIONS?: Queue<NotificationMessage>;
  PII_ENCRYPTION_KEY?: string;
  PII_HMAC_KEY?: string;
}

export interface NotificationMessage {
  submissionId: string;
}

// /chat のメッセージ。role は user|assistant のみ（system はサーバ側が付与）。
export type ChatRole = 'user' | 'assistant';
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// 問い合わせの分類。LLM が会話から判定する。
export type Classification = 'genuine' | 'sales' | 'spam';
export type ChatMode = 'intake' | 'ambassador';
export type ChatLocale = 'ja' | 'en';

/**
 * ADR-0014 intent 正本（7 キー）。
 * src/config/site.ts の CONTACT_INTENTS と同値（parity テストで一致を担保）。
 */
export const CONTACT_INTENTS = [
  'confidential-ai-assessment',
  'local-llm-poc',
  'grift-team-beta',
  'grift-paid-trial',
  'estimate-audit',
  'contract-dev',
  'press-speaking-other',
] as const;

export type ContactIntent = (typeof CONTACT_INTENTS)[number];

/** Phase 3 (#259) で Grift 自動ハンドオフする intent。#250 では定数のみ。 */
export const AUTO_HANDOFF_INTENTS = ['contract-dev'] as const;

// 構造化リード（PII ではない。具体データ本文は入れない）
export interface StructuredLead {
  purpose?: string;
  industryRole?: string;
  dataSensitivity?: string;
  stage?: string;
  timingBudget?: string;
}

// /chat のレスポンス。PII は一切含まない（会話のみ）。
export interface ChatResult {
  reply: string;
  classification: Classification;
  readyForContact: boolean;
  /** 確定または推定された intent（未知は落とす） */
  intent?: ContactIntent | '';
  structuredLead?: StructuredLead;
  /** D1セッションを有効化した場合に返す会話識別子。PIIは含まない。 */
  sessionId?: string;
  stage?: string;
  missingFields?: string[];
}

// /submit の受け取り。PII を含む。LLM には絶対に渡さない（メールにのみ送る）。
export interface InquiryInput {
  sessionId?: unknown;
  idempotencyKey?: unknown;
  name?: unknown;
  email?: unknown;
  company?: unknown;
  message?: unknown;
  conversationSummary?: unknown;
  classification?: unknown;
  intent?: unknown;
  source?: unknown;
  structuredLead?: unknown;
  utm?: unknown;
  turnstileToken?: unknown;
  website?: unknown; // ハニーポット（人間は空のまま）。値が入っていれば bot とみなす。
}

// 検証・正規化済みの問い合わせ（メール本文に使う）。
export interface NormalizedInquiry {
  name: string;
  email: string;
  company: string;
  message: string;
  conversationSummary: string;
  classification: Classification | '';
  intent: ContactIntent | '';
  source: string;
  structuredLead: StructuredLead;
  utm: Record<string, string>;
}
