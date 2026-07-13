-- Persist the server-validated, non-PII summary as the submit source of truth.
ALTER TABLE contact_sessions ADD COLUMN summary_text TEXT NOT NULL DEFAULT '';
