# Public Knowledge Sync

The public chat must answer only from the checked-in, approved knowledge in `src/company-knowledge.ts`. Workspace data is not a runtime dependency.

This directory contains a guarded, operator-run import scaffold. The manifest accepts **fixed Google Docs IDs only**. It does not search Drive, does not accept a user-provided query, and does not write to Gmail, Calendar, Chat, or Tasks.

## Initial setup

1. Create or identify a Google Doc that is explicitly approved for public publication.
2. Put its fixed document ID in `public-knowledge-manifest.json`, set `enabled` to `true`, and keep `public: true` and the Google Docs MIME type unchanged.
3. Use an operator account with read-only access to those documents. Do not use the Worker, a browser token, or the broad `gws-corp` refresh token in production runtime.

## Dry run and sync

```bash
cd workers/contact-chat
GWS_BIN="$HOME/.local/bin/gws" npm run knowledge:sync:dry-run
GWS_BIN="$HOME/.local/bin/gws" npm run knowledge:sync
```

The normal sync calls `gws drive files get` and `gws docs documents get` only for manifest IDs. `knowledge:sync:dry-run` does not invoke gws at all: it validates the checked-in manifest and exits before reading Workspace content or credentials. A normal sync validates metadata, rejects non-public entries, blocks email/phone/postal/secret-like content, and writes `knowledge/generated/public-knowledge.json` atomically. Document bodies and credentials are never printed.

The generated file is a review artifact. A human must compare it with the existing public FAQ, remove anything not suitable for publication, update `src/company-knowledge.ts`, and submit the resulting diff for review. Do not auto-publish Workspace content directly to the Worker.

## CI and credential boundary

CI may use a short-lived, read-only Google credential through the CI provider's identity federation. A service-account JSON key or the local OAuth refresh token must not be committed, uploaded to Cloudflare, or placed in Worker secrets. A failed PII/secret check must fail the job; never redact and silently publish a document.
