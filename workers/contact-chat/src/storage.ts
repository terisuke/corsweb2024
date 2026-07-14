import type {
  Env,
  NormalizedInquiry,
  StructuredLead,
  Classification,
  ContactIntent,
  ChatMode,
  ChatLocale,
  NotificationMessage,
  NotificationType,
  HandoffConsent,
} from './types';
import {
  MAX_CONVERSATION_EXCERPT_LEN,
  buildDeterministicSummary,
  canonicalizeSummaryText,
  maskSensitiveContent,
  normalizeIntent,
  normalizeSource,
  normalizeStructuredLead,
} from './validate';

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const SUBMISSION_TTL_SECONDS = 90 * 24 * 60 * 60;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN = /(?:\+?\d[\d\s().-]{6,}\d)/;

export interface SessionState {
  sessionId: string;
  intent: ContactIntent | '';
  mode: ChatMode;
  locale: ChatLocale;
  source: string;
  stage: string;
  turnCount: number;
  structuredLead: StructuredLead;
  missingFields: string[];
  classification: Classification;
  summary: string;
  conversationExcerpt: string;
}

/** Active D1 state restored at submit time; browser session fields are never authoritative. */
export interface TrustedContactSession {
  sessionId: string;
  intent: ContactIntent | '';
  locale: ChatLocale;
  source: string;
  classification: Classification;
  summary: string;
  structuredLead: StructuredLead;
}

export interface StoredSubmission {
  inquiry: NormalizedInquiry;
  submissionId: string;
  receiptId: string;
  outboxId: string;
  messageType: NotificationType;
}

export interface CreateSubmissionResult {
  submissionId: string;
  receiptId: string;
  duplicate: boolean;
  /** First accepted Worker timestamp is reused for exact idempotent replays. */
  handoffConsent: HandoffConsent | null;
}

export class SubmissionConflictError extends Error {
  readonly code = 'IDEMPOTENCY_PAYLOAD_CONFLICT';

  constructor() {
    super('idempotency payload conflict');
    this.name = 'SubmissionConflictError';
  }
}

const nowSeconds = (): number => Math.floor(Date.now() / 1000);

function redactMetadataValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, 240);
  if (!trimmed) return undefined;
  return EMAIL_PATTERN.test(trimmed) || PHONE_PATTERN.test(trimmed) ? '[redacted]' : trimmed;
}

function redactStructuredLead(lead: StructuredLead | undefined): StructuredLead {
  if (!lead) return {};
  return {
    purpose: redactMetadataValue(lead.purpose),
    industryRole: redactMetadataValue(lead.industryRole),
    dataSensitivity: redactMetadataValue(lead.dataSensitivity),
    stage: redactMetadataValue(lead.stage),
    timingBudget: redactMetadataValue(lead.timingBudget),
    discoverySource: redactMetadataValue(lead.discoverySource),
    contactReason: redactMetadataValue(lead.contactReason),
  };
}

export function newSessionId(): string {
  return crypto.randomUUID();
}

export function newReceiptId(): string {
  return `COR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function asSafeId(value: unknown, max = 128): string | null {
  if (typeof value !== 'string' || value.length < 1 || value.length > max) return null;
  return /^[A-Za-z0-9._:-]+$/.test(value) ? value : null;
}

export function normalizeSessionId(value: unknown): string | null {
  return asSafeId(value);
}

export function normalizeIdempotencyKey(value: unknown): string {
  const candidate = asSafeId(value, 160);
  return candidate || crypto.randomUUID();
}

function bytesToBase64(bytes: Uint8Array): string {
  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  return btoa(text);
}

function base64ToBytes(value: string): Uint8Array {
  const text = atob(value);
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
  return bytes;
}

async function keyBytes(secret: string): Promise<ArrayBuffer> {
  // Accept a 32-byte base64 secret, but hash a passphrase for operational ergonomics.
  try {
    const decoded = base64ToBytes(secret);
    if (decoded.byteLength === 32) return decoded.buffer as ArrayBuffer;
  } catch {
    // Fall through to SHA-256 derivation.
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return digest;
}

async function importAesKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', await keyBytes(secret), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptText(secret: string | undefined, plaintext: string): Promise<string> {
  if (!secret) throw new Error('PII storage is not configured');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importAesKey(secret);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));
  return `v1.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(ciphertext))}`;
}

export async function decryptText(secret: string | undefined, encoded: string): Promise<string> {
  if (!secret) throw new Error('PII storage is not configured');
  const [version, ivText, ciphertextText] = encoded.split('.');
  if (version !== 'v1' || !ivText || !ciphertextText) throw new Error('invalid encrypted value');
  const key = await importAesKey(secret);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(ivText) },
    key,
    base64ToBytes(ciphertextText),
  );
  return new TextDecoder().decode(plaintext);
}

async function hmacHex(secret: string | undefined, value: string): Promise<string> {
  if (!secret) throw new Error('PII storage is not configured');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function emailHmac(secret: string | undefined, email: string): Promise<string> {
  return hmacHex(secret, email.toLowerCase());
}

function stableJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return JSON.stringify(value) ?? 'null';
  }
  if (typeof value === 'number') return Number.isFinite(value) ? (JSON.stringify(value) ?? 'null') : 'null';
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${stableJson(entryValue)}`).join(',')}}`;
  }
  return 'null';
}

async function submissionPayloadFingerprint(
  secret: string | undefined,
  inquiry: NormalizedInquiry,
  sessionId: string | null,
  trustedSession: TrustedContactSession | null,
  consent: HandoffConsent | null,
): Promise<string> {
  // The canonical input is transient. D1 receives only this keyed digest, never
  // a plaintext copy of PII or consent data for idempotency comparison.
  const canonical = stableJson({
    version: 1,
    sessionId,
    session: trustedSession ? {
      sessionId: trustedSession.sessionId,
      intent: trustedSession.intent,
      locale: trustedSession.locale,
      source: trustedSession.source,
      classification: trustedSession.classification,
      structuredLead: trustedSession.structuredLead,
    } : null,
    inquiry: {
      name: inquiry.name,
      email: inquiry.email,
      company: inquiry.company,
      message: inquiry.message,
      summary: inquiry.conversationSummary,
      classification: inquiry.classification,
      intent: inquiry.intent,
      source: inquiry.source,
      structuredLead: inquiry.structuredLead,
      utm: inquiry.utm,
    },
    consent: consent ? {
      accepted: true,
      version: consent.version,
      browserAcceptedAt: consent.browserAcceptedAt,
      summaryConfirmed: consent.summaryConfirmed,
      // acceptedAt is deliberately excluded: it is generated anew by the
      // Worker on transport retries. The original value is restored from audit.
    } : null,
  });
  return hmacHex(secret, `submission-payload:v1:${canonical}`);
}

export async function upsertContactSession(env: Env, state: SessionState): Promise<void> {
  if (!env.DB) return;
  const now = nowSeconds();
  const conversationExcerpt = await encryptText(
    env.PII_ENCRYPTION_KEY,
    state.conversationExcerpt.slice(0, MAX_CONVERSATION_EXCERPT_LEN),
  );
  await env.DB.prepare(`
    INSERT INTO contact_sessions
      (session_id, intent, mode, locale, source, stage, turn_count,
       structured_lead_json, missing_fields_json, classification, summary_text,
       conversation_excerpt_ciphertext, status,
       created_at, updated_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
    ON CONFLICT(session_id) DO UPDATE SET
      intent=excluded.intent, mode=excluded.mode, locale=excluded.locale,
      source=excluded.source, stage=excluded.stage, turn_count=excluded.turn_count,
      -- JSON1 merge keeps fields collected in earlier turns when the model
      -- omits them from a later partial structuredLead response.
      structured_lead_json=json_patch(contact_sessions.structured_lead_json, excluded.structured_lead_json),
      missing_fields_json=excluded.missing_fields_json,
      classification=excluded.classification, summary_text=excluded.summary_text,
      conversation_excerpt_ciphertext=excluded.conversation_excerpt_ciphertext, status='active',
      updated_at=excluded.updated_at, expires_at=excluded.expires_at
  `).bind(
    state.sessionId,
    state.intent,
    state.mode,
    state.locale,
    state.source,
    state.stage,
    state.turnCount,
    JSON.stringify(redactStructuredLead(state.structuredLead)),
    JSON.stringify(state.missingFields),
    state.classification,
    state.summary.slice(0, 1500),
    conversationExcerpt,
    now,
    now,
    now + SESSION_TTL_SECONDS,
  ).run();
}

interface TrustedContactSessionRow {
  session_id: string;
  intent: string;
  locale: string;
  source: string;
  classification: string;
  summary_text: string;
  structured_lead_json: string;
}

export async function getTrustedContactSession(
  env: Env,
  sessionId: string | null,
): Promise<TrustedContactSession | null> {
  if (!env.DB || !sessionId) return null;
  const row = await env.DB.prepare(`
    SELECT session_id, intent, locale, source, classification,
      summary_text, structured_lead_json
    FROM contact_sessions
    WHERE session_id = ? AND status = 'active' AND expires_at > ?
    LIMIT 1
  `).bind(sessionId, nowSeconds()).first<TrustedContactSessionRow>();
  if (!row || row.session_id !== sessionId) return null;
  if (row.locale !== 'ja' && row.locale !== 'en') return null;
  if (row.classification !== 'genuine' && row.classification !== 'sales' && row.classification !== 'spam') {
    return null;
  }
  const intent = normalizeIntent(row.intent);
  if (row.intent && !intent) return null;
  const structuredLead = normalizeStructuredLeadJson(row.structured_lead_json);
  const canonicalSummary = canonicalizeSummaryText(typeof row.summary_text === 'string' ? row.summary_text : '');
  const summary = canonicalSummary
    ? maskSensitiveContent(canonicalSummary)
    : buildDeterministicSummary({ classification: row.classification, intent, structuredLead });
  return {
    sessionId: row.session_id,
    intent,
    locale: row.locale,
    source: normalizeSource(row.source),
    classification: row.classification,
    summary,
    structuredLead,
  };
}

function normalizeStructuredLeadJson(value: string): StructuredLead {
  try {
    return normalizeStructuredLead(JSON.parse(value));
  } catch {
    return {};
  }
}

interface ExistingSubmissionRow {
  submission_id: string;
  receipt_id: string;
  payload_fingerprint: string;
  metadata_json: string | null;
}

async function findExistingSubmission(env: Env, idempotencyKey: string): Promise<ExistingSubmissionRow | null> {
  if (!env.DB) return null;
  return env.DB.prepare(`
    SELECT s.submission_id, s.receipt_id, s.payload_fingerprint,
      (SELECT a.metadata_json
       FROM audit_events a
       WHERE a.submission_id = s.submission_id AND a.event_type = 'submission_queued'
       ORDER BY a.created_at ASC
       LIMIT 1) AS metadata_json
    FROM submission_intake s
    WHERE s.idempotency_key = ?
    LIMIT 1
  `).bind(idempotencyKey).first<ExistingSubmissionRow>();
}

function restoreStoredHandoffConsent(metadataJson: string | null): HandoffConsent | null {
  if (!metadataJson) return null;
  try {
    const metadata = JSON.parse(metadataJson) as { handoff_consent?: Record<string, unknown> };
    const consent = metadata.handoff_consent;
    if (
      !consent
      || consent.accepted !== true
      || consent.version !== 'cloudia-grift-v1'
      || consent.summary_confirmed !== true
      || typeof consent.accepted_at !== 'string'
      || typeof consent.browser_accepted_at !== 'string'
      || !Number.isFinite(Date.parse(consent.accepted_at))
      || !Number.isFinite(Date.parse(consent.browser_accepted_at))
    ) return null;
    return {
      accepted: true,
      version: 'cloudia-grift-v1',
      acceptedAt: new Date(consent.accepted_at).toISOString(),
      browserAcceptedAt: new Date(consent.browser_accepted_at).toISOString(),
      summaryConfirmed: true,
    };
  } catch {
    return null;
  }
}

function replayResult(existing: ExistingSubmissionRow, fingerprint: string): CreateSubmissionResult {
  if (existing.payload_fingerprint !== fingerprint) throw new SubmissionConflictError();
  return {
    submissionId: existing.submission_id,
    receiptId: existing.receipt_id,
    duplicate: true,
    handoffConsent: restoreStoredHandoffConsent(existing.metadata_json),
  };
}

export async function createSubmission(
  env: Env,
  inquiry: NormalizedInquiry,
  options: {
    idempotencyKey: string;
    sessionId?: string | null;
    trustedSession?: TrustedContactSession | null;
    handoffConsent?: HandoffConsent | null;
  },
): Promise<CreateSubmissionResult> {
  if (!env.DB) throw new Error('D1 is not configured');
  const now = nowSeconds();
  // Copy the already encrypted session excerpt into the submission row. This
  // avoids decrypting/re-encrypting chat content during handoff and prevents a
  // browser from injecting an arbitrary transcript at submit time.
  let trustedSession: TrustedContactSession | null = options.trustedSession?.sessionId === options.sessionId
    ? (options.trustedSession ?? null)
    : null;
  let sessionId = trustedSession?.sessionId || null;
  let conversationExcerptCiphertext = '';
  if (sessionId) {
    const session = await env.DB.prepare(
      "SELECT session_id, conversation_excerpt_ciphertext FROM contact_sessions WHERE session_id = ? AND status = 'active' AND expires_at > ? LIMIT 1",
    ).bind(sessionId, now).first<{ session_id: string; conversation_excerpt_ciphertext?: string }>();
    if (!session) {
      sessionId = null;
      trustedSession = null;
    } else {
      conversationExcerptCiphertext = session.conversation_excerpt_ciphertext || '';
    }
  }
  const fingerprint = await submissionPayloadFingerprint(
    env.PII_HMAC_KEY,
    inquiry,
    sessionId,
    trustedSession,
    options.handoffConsent || null,
  );
  const existing = await findExistingSubmission(env, options.idempotencyKey);
  if (existing) return replayResult(existing, fingerprint);

  const submissionId = crypto.randomUUID();
  const receiptId = newReceiptId();
  if (!conversationExcerptCiphertext) {
    conversationExcerptCiphertext = await encryptText(
      env.PII_ENCRYPTION_KEY,
      (inquiry.conversationExcerpt || '').slice(0, MAX_CONVERSATION_EXCERPT_LEN),
    );
  }
  const pii = await Promise.all([
    encryptText(env.PII_ENCRYPTION_KEY, inquiry.name),
    encryptText(env.PII_ENCRYPTION_KEY, inquiry.email),
    encryptText(env.PII_ENCRYPTION_KEY, inquiry.company),
    encryptText(env.PII_ENCRYPTION_KEY, inquiry.message),
    encryptText(env.PII_ENCRYPTION_KEY, inquiry.conversationSummary),
    emailHmac(env.PII_HMAC_KEY, inquiry.email),
  ]);
  const [name, email, company, message, summary, emailHash] = pii;
  const outboxId = crypto.randomUUID();
  const auditMetadata = options.handoffConsent
    ? {
        handoff_consent: {
          accepted: true,
          version: options.handoffConsent.version,
          accepted_at: options.handoffConsent.acceptedAt,
          browser_accepted_at: options.handoffConsent.browserAcceptedAt,
          summary_confirmed: options.handoffConsent.summaryConfirmed,
        },
      }
    : {};
  const statements = [
    env.DB.prepare(`
      INSERT INTO submission_intake
        (submission_id, idempotency_key, payload_fingerprint, session_id, receipt_id,
         name_ciphertext, email_ciphertext, company_ciphertext,
         message_ciphertext, summary_ciphertext, conversation_excerpt_ciphertext,
         email_hmac, intent, source,
         structured_lead_json, utm_json, classification, status,
         created_at, updated_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued', ?, ?, ?)
    `).bind(
      submissionId,
      options.idempotencyKey,
      fingerprint,
      sessionId,
      receiptId,
      name,
      email,
      company,
      message,
      summary,
      conversationExcerptCiphertext,
      emailHash,
      inquiry.intent,
      inquiry.source,
      JSON.stringify(redactStructuredLead(inquiry.structuredLead)),
      JSON.stringify(inquiry.utm),
      inquiry.classification,
      now,
      now,
      now + SUBMISSION_TTL_SECONDS,
    ),
    env.DB.prepare(`
      INSERT INTO notification_outbox
        (outbox_id, submission_id, message_type, status, attempts, available_at,
         delivery_status, created_at, updated_at)
      VALUES (?, ?, 'internal', 'pending', 0, ?, 'queued', ?, ?)
    `).bind(outboxId, submissionId, now, now, now),
    env.DB.prepare(`
      INSERT INTO notification_outbox
        (outbox_id, submission_id, message_type, status, attempts, available_at,
         delivery_status, created_at, updated_at)
      VALUES (?, ?, 'receipt', 'pending', 0, ?, 'queued', ?, ?)
    `).bind(crypto.randomUUID(), submissionId, now, now, now),
    env.DB.prepare(`
      INSERT INTO audit_events (event_id, event_type, submission_id, session_id, metadata_json, created_at)
      VALUES (?, 'submission_queued', ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), submissionId, sessionId, JSON.stringify(auditMetadata), now),
  ];
  try {
    await env.DB.batch(statements);
  } catch (error) {
    // A concurrent retry may have won the unique idempotency key race.
    const raced = await findExistingSubmission(env, options.idempotencyKey);
    if (raced) return replayResult(raced, fingerprint);
    throw error;
  }
  return {
    submissionId,
    receiptId,
    duplicate: false,
    handoffConsent: options.handoffConsent || null,
  };
}

interface SubmissionRow {
  outbox_id: string;
  submission_id: string;
  receipt_id: string;
  message_type: NotificationType;
  name_ciphertext: string;
  email_ciphertext: string;
  company_ciphertext: string;
  message_ciphertext: string;
  summary_ciphertext: string;
  conversation_excerpt_ciphertext: string;
  intent: ContactIntent | '';
  source: string;
  structured_lead_json: string;
  utm_json: string;
  classification: Classification | '';
  metadata_json: string | null;
}

export async function getSubmissionForNotification(
  env: Env,
  submissionId: string,
  messageType: NotificationType = 'internal',
): Promise<StoredSubmission | null> {
  if (!env.DB) return null;
  const row = await env.DB.prepare(`
    SELECT o.outbox_id, o.message_type, s.submission_id, s.receipt_id,
      s.name_ciphertext, s.email_ciphertext,
      s.company_ciphertext, s.message_ciphertext, s.summary_ciphertext,
      s.conversation_excerpt_ciphertext,
      s.intent, s.source, s.structured_lead_json, s.utm_json, s.classification,
      (SELECT a.metadata_json
       FROM audit_events a
       WHERE a.submission_id = s.submission_id AND a.event_type = 'submission_queued'
       ORDER BY a.created_at ASC
       LIMIT 1) AS metadata_json
    FROM submission_intake s
    JOIN notification_outbox o ON o.submission_id = s.submission_id
    WHERE s.submission_id = ? AND o.message_type = ? AND o.status IN ('pending', 'processing')
    LIMIT 1
  `).bind(submissionId, messageType).first<SubmissionRow>();
  if (!row) return null;
  const [name, email, company, message, conversationSummary, conversationExcerpt] = await Promise.all([
    decryptText(env.PII_ENCRYPTION_KEY, row.name_ciphertext),
    decryptText(env.PII_ENCRYPTION_KEY, row.email_ciphertext),
    decryptText(env.PII_ENCRYPTION_KEY, row.company_ciphertext),
    decryptText(env.PII_ENCRYPTION_KEY, row.message_ciphertext),
    decryptText(env.PII_ENCRYPTION_KEY, row.summary_ciphertext),
    messageType === 'internal' && row.conversation_excerpt_ciphertext
      ? decryptText(env.PII_ENCRYPTION_KEY, row.conversation_excerpt_ciphertext)
      : Promise.resolve(''),
  ]);
  let structuredLead: StructuredLead = {};
  let utm: Record<string, string> = {};
  try { structuredLead = normalizeStructuredLead(JSON.parse(row.structured_lead_json)); } catch { /* safe default */ }
  try { utm = JSON.parse(row.utm_json) as Record<string, string>; } catch { /* safe default */ }
  return {
    submissionId: row.submission_id,
    receiptId: row.receipt_id,
    outboxId: row.outbox_id,
    messageType: row.message_type,
    inquiry: {
      name,
      email,
      company,
      message,
      summaryText: conversationSummary,
      conversationSummary,
      ...(restoreStoredHandoffConsent(row.metadata_json) ? { summaryConfirmed: true as const } : {}),
      classification: row.classification,
      intent: row.intent,
      source: row.source,
      structuredLead,
      utm,
      ...(messageType === 'internal' && conversationExcerpt ? { conversationExcerpt } : {}),
    },
  };
}

export async function markOutboxProcessing(env: Env, submissionId: string, messageType: NotificationType = 'internal'): Promise<void> {
  if (!env.DB) return;
  await env.DB.prepare(`UPDATE notification_outbox SET status='processing', delivery_status='sending', attempts=attempts+1, updated_at=? WHERE submission_id=? AND message_type=? AND status IN ('pending','processing')`).bind(nowSeconds(), submissionId, messageType).run();
}

/** Atomically claims a pending message so duplicate queue deliveries cannot send twice. */
export async function claimOutbox(env: Env, submissionId: string, messageType: NotificationType = 'internal'): Promise<boolean> {
  if (!env.DB) return false;
  const result = await env.DB.prepare(
    "UPDATE notification_outbox SET status='processing', delivery_status='sending', attempts=attempts+1, updated_at=? WHERE submission_id=? AND message_type=? AND status='pending'",
  ).bind(nowSeconds(), submissionId, messageType).run();
  return (result.meta?.changes || 0) > 0;
}

export async function markOutboxSent(
  env: Env,
  submissionId: string,
  messageType: NotificationType = 'internal',
  providerMessageId = '',
  deliveryStatus = 'accepted',
): Promise<void> {
  if (!env.DB) return;
  const now = nowSeconds();
  await env.DB.batch([
    env.DB.prepare("UPDATE notification_outbox SET status='sent', delivery_status=?, provider_message_id=?, sent_at=?, updated_at=? WHERE submission_id=? AND message_type=?").bind(deliveryStatus, providerMessageId, now, now, submissionId, messageType),
    // 既存のsubmission statusは「社内通知が送れた」ことを意味するため、本人確認メールの
    // 成否で上書きしない。本人向けOutboxの状態は同じ行に保存する。
    ...(messageType === 'internal'
      ? [env.DB.prepare("UPDATE submission_intake SET status='sent', updated_at=? WHERE submission_id=?").bind(now, submissionId)]
      : []),
  ]);
}

export function markOutboxFailed(env: Env, submissionId: string, errorMessage: string): Promise<void>;
export function markOutboxFailed(env: Env, submissionId: string, messageType: NotificationType, errorMessage: string): Promise<void>;
export async function markOutboxFailed(
  env: Env,
  submissionId: string,
  messageTypeOrError: NotificationType | string,
  maybeErrorMessage?: string,
): Promise<void> {
  if (!env.DB) return;
  const messageType: NotificationType = messageTypeOrError === 'receipt' ? 'receipt' : 'internal';
  const errorMessage = maybeErrorMessage ?? messageTypeOrError;
  // エラー本文はプロバイダや入力値を含み得るため保存しない。運用に必要なHTTP statusだけを
  // 固定形式で残し、PII/秘密情報のD1・ログへの混入を防ぐ。
  const status = /status\s+(\d{3})/.exec(errorMessage)?.[1];
  const safeError = status ? `provider_status_${status}` : 'notification_failed';
  await env.DB.prepare("UPDATE notification_outbox SET status='pending', delivery_status='failed', last_error=?, updated_at=? WHERE submission_id=? AND message_type=?").bind(safeError, nowSeconds(), submissionId, messageType).run();
}

export async function purgeExpiredData(env: Env): Promise<void> {
  if (!env.DB) return;
  const now = nowSeconds();
  // Delete dependents first because D1 enforces the submission foreign key.
  await env.DB.batch([
    env.DB.prepare(`DELETE FROM audit_events WHERE submission_id IN (SELECT submission_id FROM submission_intake WHERE expires_at < ?)`)
      .bind(now),
    env.DB.prepare(`DELETE FROM notification_outbox WHERE submission_id IN (SELECT submission_id FROM submission_intake WHERE expires_at < ?)`)
      .bind(now),
    env.DB.prepare('DELETE FROM submission_intake WHERE expires_at < ?').bind(now),
    env.DB.prepare('DELETE FROM contact_sessions WHERE expires_at < ?').bind(now),
  ]);
}

export function queueMessage(submissionId: string, messageType?: NotificationType): NotificationMessage {
  // No type preserves old Queue payloads; all newly created rows pass the type
  // explicitly so internal and receipt notifications remain observable.
  return messageType ? { submissionId, messageType } : { submissionId };
}
