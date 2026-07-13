import type { Env, NormalizedInquiry, StructuredLead, Classification, ContactIntent, ChatMode, ChatLocale, NotificationMessage } from './types';

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
}

export interface StoredSubmission {
  inquiry: NormalizedInquiry;
  submissionId: string;
  receiptId: string;
}

export interface CreateSubmissionResult {
  submissionId: string;
  receiptId: string;
  duplicate: boolean;
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
  };
}

export function newSessionId(): string {
  return crypto.randomUUID();
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

async function emailHmac(secret: string | undefined, email: string): Promise<string> {
  if (!secret) throw new Error('PII storage is not configured');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(email.toLowerCase()));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function upsertContactSession(env: Env, state: SessionState): Promise<void> {
  if (!env.DB) return;
  const now = nowSeconds();
  await env.DB.prepare(`
    INSERT INTO contact_sessions
      (session_id, intent, mode, locale, source, stage, turn_count,
       structured_lead_json, missing_fields_json, classification, status,
       created_at, updated_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
    ON CONFLICT(session_id) DO UPDATE SET
      intent=excluded.intent, mode=excluded.mode, locale=excluded.locale,
      source=excluded.source, stage=excluded.stage, turn_count=excluded.turn_count,
      structured_lead_json=excluded.structured_lead_json,
      missing_fields_json=excluded.missing_fields_json,
      classification=excluded.classification, status='active',
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
    now,
    now,
    now + SESSION_TTL_SECONDS,
  ).run();
}

export async function createSubmission(
  env: Env,
  inquiry: NormalizedInquiry,
  options: { idempotencyKey: string; sessionId?: string | null },
): Promise<CreateSubmissionResult> {
  if (!env.DB) throw new Error('D1 is not configured');
  const existing = await env.DB.prepare(
    'SELECT submission_id, receipt_id FROM submission_intake WHERE idempotency_key = ? LIMIT 1',
  ).bind(options.idempotencyKey).first<{ submission_id: string; receipt_id: string }>();
  if (existing) return { submissionId: existing.submission_id, receiptId: existing.receipt_id, duplicate: true };

  const submissionId = crypto.randomUUID();
  const receiptId = `COR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${submissionId.slice(0, 8).toUpperCase()}`;
  const now = nowSeconds();
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
  // A submit may arrive from a stale browser tab. Keep the inquiry durable even
  // when its optional session row has already expired rather than violating the FK.
  let sessionId = options.sessionId || null;
  if (sessionId) {
    const session = await env.DB.prepare('SELECT session_id FROM contact_sessions WHERE session_id = ? LIMIT 1').bind(sessionId).first<{ session_id: string }>();
    if (!session) sessionId = null;
  }
  const statements = [
    env.DB.prepare(`
      INSERT INTO submission_intake
        (submission_id, idempotency_key, session_id, receipt_id,
         name_ciphertext, email_ciphertext, company_ciphertext,
         message_ciphertext, summary_ciphertext, email_hmac, intent, source,
         structured_lead_json, utm_json, classification, status,
         created_at, updated_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued', ?, ?, ?)
    `).bind(
      submissionId,
      options.idempotencyKey,
      sessionId,
      receiptId,
      name,
      email,
      company,
      message,
      summary,
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
        (outbox_id, submission_id, status, attempts, available_at, created_at, updated_at)
      VALUES (?, ?, 'pending', 0, ?, ?, ?)
    `).bind(outboxId, submissionId, now, now, now),
    env.DB.prepare(`
      INSERT INTO audit_events (event_id, event_type, submission_id, session_id, metadata_json, created_at)
      VALUES (?, 'submission_queued', ?, ?, '{}', ?)
    `).bind(crypto.randomUUID(), submissionId, sessionId, now),
  ];
  try {
    await env.DB.batch(statements);
  } catch (error) {
    // A concurrent retry may have won the unique idempotency key race.
    const raced = await env.DB.prepare(
      'SELECT submission_id, receipt_id FROM submission_intake WHERE idempotency_key = ? LIMIT 1',
    ).bind(options.idempotencyKey).first<{ submission_id: string; receipt_id: string }>();
    if (raced) return { submissionId: raced.submission_id, receiptId: raced.receipt_id, duplicate: true };
    throw error;
  }
  return { submissionId, receiptId, duplicate: false };
}

interface SubmissionRow {
  submission_id: string;
  receipt_id: string;
  name_ciphertext: string;
  email_ciphertext: string;
  company_ciphertext: string;
  message_ciphertext: string;
  summary_ciphertext: string;
  intent: ContactIntent | '';
  source: string;
  structured_lead_json: string;
  utm_json: string;
  classification: Classification | '';
}

export async function getSubmissionForNotification(env: Env, submissionId: string): Promise<StoredSubmission | null> {
  if (!env.DB) return null;
  const row = await env.DB.prepare(`
    SELECT s.submission_id, s.receipt_id, s.name_ciphertext, s.email_ciphertext,
      s.company_ciphertext, s.message_ciphertext, s.summary_ciphertext,
      s.intent, s.source, s.structured_lead_json, s.utm_json, s.classification
    FROM submission_intake s
    JOIN notification_outbox o ON o.submission_id = s.submission_id
    WHERE s.submission_id = ? AND o.status IN ('pending', 'processing')
    LIMIT 1
  `).bind(submissionId).first<SubmissionRow>();
  if (!row) return null;
  const [name, email, company, message, conversationSummary] = await Promise.all([
    decryptText(env.PII_ENCRYPTION_KEY, row.name_ciphertext),
    decryptText(env.PII_ENCRYPTION_KEY, row.email_ciphertext),
    decryptText(env.PII_ENCRYPTION_KEY, row.company_ciphertext),
    decryptText(env.PII_ENCRYPTION_KEY, row.message_ciphertext),
    decryptText(env.PII_ENCRYPTION_KEY, row.summary_ciphertext),
  ]);
  let structuredLead: StructuredLead = {};
  let utm: Record<string, string> = {};
  try { structuredLead = JSON.parse(row.structured_lead_json) as StructuredLead; } catch { /* safe default */ }
  try { utm = JSON.parse(row.utm_json) as Record<string, string>; } catch { /* safe default */ }
  return {
    submissionId: row.submission_id,
    receiptId: row.receipt_id,
    inquiry: { name, email, company, message, conversationSummary, classification: row.classification, intent: row.intent, source: row.source, structuredLead, utm },
  };
}

export async function markOutboxProcessing(env: Env, submissionId: string): Promise<void> {
  if (!env.DB) return;
  await env.DB.prepare(`UPDATE notification_outbox SET status='processing', attempts=attempts+1, updated_at=? WHERE submission_id=? AND status IN ('pending','processing')`).bind(nowSeconds(), submissionId).run();
}

/** Atomically claims a pending message so duplicate queue deliveries cannot send twice. */
export async function claimOutbox(env: Env, submissionId: string): Promise<boolean> {
  if (!env.DB) return false;
  const result = await env.DB.prepare(
    "UPDATE notification_outbox SET status='processing', attempts=attempts+1, updated_at=? WHERE submission_id=? AND status='pending'",
  ).bind(nowSeconds(), submissionId).run();
  return (result.meta?.changes || 0) > 0;
}

export async function markOutboxSent(env: Env, submissionId: string): Promise<void> {
  if (!env.DB) return;
  const now = nowSeconds();
  await env.DB.batch([
    env.DB.prepare("UPDATE notification_outbox SET status='sent', sent_at=?, updated_at=? WHERE submission_id=?").bind(now, now, submissionId),
    env.DB.prepare("UPDATE submission_intake SET status='sent', updated_at=? WHERE submission_id=?").bind(now, submissionId),
  ]);
}

export async function markOutboxFailed(env: Env, submissionId: string, errorMessage: string): Promise<void> {
  if (!env.DB) return;
  const safeError = errorMessage.slice(0, 200).replace(/[\r\n]/g, ' ');
  await env.DB.prepare("UPDATE notification_outbox SET status='pending', last_error=?, updated_at=? WHERE submission_id=?").bind(safeError, nowSeconds(), submissionId).run();
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

export function queueMessage(submissionId: string): NotificationMessage {
  return { submissionId };
}
