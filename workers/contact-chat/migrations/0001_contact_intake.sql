-- Contact intake state is intentionally metadata-only. Raw transcripts and PII are
-- never written to D1; encrypted submit fields are short-lived and purged by TTL.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS contact_sessions (
  session_id TEXT PRIMARY KEY,
  intent TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'intake',
  locale TEXT NOT NULL DEFAULT 'ja',
  source TEXT NOT NULL DEFAULT '',
  stage TEXT NOT NULL DEFAULT 'intent',
  turn_count INTEGER NOT NULL DEFAULT 0,
  structured_lead_json TEXT NOT NULL DEFAULT '{}',
  missing_fields_json TEXT NOT NULL DEFAULT '[]',
  classification TEXT NOT NULL DEFAULT 'genuine',
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_sessions_expiry
  ON contact_sessions (expires_at);

CREATE TABLE IF NOT EXISTS submission_intake (
  submission_id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  session_id TEXT,
  receipt_id TEXT NOT NULL UNIQUE,
  name_ciphertext TEXT NOT NULL,
  email_ciphertext TEXT NOT NULL,
  company_ciphertext TEXT NOT NULL,
  message_ciphertext TEXT NOT NULL,
  summary_ciphertext TEXT NOT NULL,
  email_hmac TEXT NOT NULL,
  intent TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  structured_lead_json TEXT NOT NULL DEFAULT '{}',
  utm_json TEXT NOT NULL DEFAULT '{}',
  classification TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'queued',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES contact_sessions(session_id)
);

CREATE INDEX IF NOT EXISTS idx_submission_intake_expiry
  ON submission_intake (expires_at);
CREATE INDEX IF NOT EXISTS idx_submission_intake_session
  ON submission_intake (session_id);

CREATE TABLE IF NOT EXISTS notification_outbox (
  outbox_id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at INTEGER NOT NULL,
  last_error TEXT,
  sent_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES submission_intake(submission_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_outbox_status
  ON notification_outbox (status, available_at);

CREATE TABLE IF NOT EXISTS audit_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  submission_id TEXT,
  session_id TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_events_created
  ON audit_events (created_at);
