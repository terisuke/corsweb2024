-- Keep a bounded, server-masked conversation excerpt for internal triage only.
-- Values are AES-GCM ciphertext produced by the Worker; old rows remain empty.
ALTER TABLE contact_sessions
  ADD COLUMN conversation_excerpt_ciphertext TEXT NOT NULL DEFAULT '';

ALTER TABLE submission_intake
  ADD COLUMN conversation_excerpt_ciphertext TEXT NOT NULL DEFAULT '';
