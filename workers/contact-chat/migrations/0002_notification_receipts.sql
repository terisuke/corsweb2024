-- Split one submission notification into independently retryable internal and
-- receipt messages. Existing rows are preserved as internal notifications.
PRAGMA foreign_keys = ON;

ALTER TABLE notification_outbox RENAME TO notification_outbox_legacy;
DROP INDEX IF EXISTS idx_notification_outbox_status;

CREATE TABLE notification_outbox (
  outbox_id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'internal' CHECK (message_type IN ('internal', 'receipt')),
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at INTEGER NOT NULL,
  last_error TEXT,
  provider_message_id TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'queued',
  sent_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (submission_id, message_type),
  FOREIGN KEY (submission_id) REFERENCES submission_intake(submission_id)
);

INSERT INTO notification_outbox (
  outbox_id, submission_id, message_type, status, attempts, available_at,
  last_error, provider_message_id, delivery_status, sent_at, created_at, updated_at
)
SELECT
  outbox_id,
  submission_id,
  'internal',
  status,
  attempts,
  available_at,
  last_error,
  NULL,
  CASE status
    WHEN 'sent' THEN 'accepted'
    WHEN 'processing' THEN 'sending'
    ELSE 'queued'
  END,
  sent_at,
  created_at,
  updated_at
FROM notification_outbox_legacy;

DROP TABLE notification_outbox_legacy;

CREATE INDEX idx_notification_outbox_status
  ON notification_outbox (status, available_at);
CREATE INDEX idx_notification_outbox_type
  ON notification_outbox (submission_id, message_type, status);
