import type {
  ChatMessage,
  ChatRole,
  Classification,
  InquiryInput,
  NormalizedInquiry,
} from './types';

// --- 入力サニタイズ（プロンプト注入・制御文字対策） ---
// NUL/制御文字を除去し、長さを制限する。yomimono の sanitizeText と同方針。
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// チャット用サニタイズ: 改行(\n)は会話文として残し、それ以外の制御文字のみ除去する。
export function sanitizeMessage(s: unknown, maxLen: number): string {
  return String(s ?? '')
    .replace(CONTROL_CHARS, ' ')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, maxLen);
}

// 単一行用サニタイズ: 改行も含む全制御文字を空白化（name/email/company 等）。
// eslint-disable-next-line no-control-regex
const ALL_CONTROL = /[\x00-\x1F\x7F]/g;
export function sanitizeLine(s: unknown, maxLen: number): string {
  return String(s ?? '')
    .replace(ALL_CONTROL, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

// --- /chat メッセージ配列の検証 ---
export const MAX_MESSAGES = 20;
export const MAX_MESSAGE_LEN = 2000;
export const VALID_ROLES: readonly ChatRole[] = ['user', 'assistant'];

export type ChatValidation =
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; error: string; status: number };

// クライアント由来の messages を検証・正規化する。
// - 配列であること / 1件以上 / 上限件数 / role が user|assistant / content が文字列
// - 各メッセージは制御文字除去＋長さ制限（プロンプト注入の素材を最小化）
export function normalizeMessages(input: unknown): ChatValidation {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: 'messages は1件以上の配列が必要です', status: 400 };
  }
  if (input.length > MAX_MESSAGES) {
    return { ok: false, error: `メッセージ数が多すぎます（最大${MAX_MESSAGES}件）`, status: 400 };
  }
  const messages: ChatMessage[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') {
      return { ok: false, error: 'messages の各要素はオブジェクトである必要があります', status: 400 };
    }
    const role = (raw as { role?: unknown }).role;
    const content = (raw as { content?: unknown }).content;
    if (typeof role !== 'string' || !VALID_ROLES.includes(role as ChatRole)) {
      return { ok: false, error: 'role は user か assistant のみ許可されます', status: 400 };
    }
    if (typeof content !== 'string') {
      return { ok: false, error: 'content は文字列である必要があります', status: 400 };
    }
    const clean = sanitizeMessage(content, MAX_MESSAGE_LEN);
    if (!clean) {
      return { ok: false, error: '空のメッセージは送れません', status: 400 };
    }
    messages.push({ role: role as ChatRole, content: clean });
  }
  return { ok: true, messages };
}

// --- /submit 問い合わせの検証 ---
export const MAX_NAME_LEN = 100;
export const MAX_EMAIL_LEN = 254; // RFC 5321 のローカル+ドメイン上限
export const MAX_COMPANY_LEN = 200;
export const MAX_INQUIRY_MESSAGE_LEN = 5000;
export const MAX_SUMMARY_LEN = 8000;

// RFC を厳密には実装せず、実用的で過剰拒否しない緩めのチェック。
// 1個の @、前後に空白なし、ドメインに少なくとも1つのドット。制御文字は既に除去済み前提。
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LEN && EMAIL_RE.test(email);
}

const VALID_CLASSIFICATIONS: readonly Classification[] = ['genuine', 'sales', 'spam'];
function normalizeClassification(c: unknown): Classification | '' {
  return typeof c === 'string' && (VALID_CLASSIFICATIONS as readonly string[]).includes(c)
    ? (c as Classification)
    : '';
}

export type InquiryValidation =
  | { ok: true; inquiry: NormalizedInquiry }
  | { ok: false; error: string; status: number; honeypot?: boolean };

// /submit ボディを検証・正規化する。
// ハニーポット(website)が埋まっていれば bot とみなし honeypot:true を返す（呼び出し側でサイレント200）。
export function normalizeInquiry(input: InquiryInput | undefined): InquiryValidation {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'リクエストボディが不正です', status: 400 };
  }

  // ハニーポット: 人間は website を空のまま送る。値があれば bot。
  const honeypot = sanitizeLine(input.website, 200);
  if (honeypot) {
    return { ok: false, error: 'dropped', status: 200, honeypot: true };
  }

  const name = sanitizeLine(input.name, MAX_NAME_LEN);
  const email = sanitizeLine(input.email, MAX_EMAIL_LEN);
  const company = sanitizeLine(input.company, MAX_COMPANY_LEN);
  const message = sanitizeMessage(input.message, MAX_INQUIRY_MESSAGE_LEN);
  const conversationSummary = sanitizeMessage(input.conversationSummary, MAX_SUMMARY_LEN);
  const classification = normalizeClassification(input.classification);

  if (!name) {
    return { ok: false, error: 'お名前は必須です', status: 400 };
  }
  if (!email || !isValidEmail(email)) {
    return { ok: false, error: 'メールアドレスの形式が正しくありません', status: 400 };
  }
  if (!message) {
    return { ok: false, error: 'お問い合わせ内容は必須です', status: 400 };
  }

  return {
    ok: true,
    inquiry: { name, email, company, message, conversationSummary, classification },
  };
}
