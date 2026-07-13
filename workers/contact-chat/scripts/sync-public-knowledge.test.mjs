import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(packageRoot, 'scripts/sync-public-knowledge.mjs');
const fixedId = 'approved-doc-123';

function makeManifest(overrides = {}) {
  return {
    version: 1,
    project: 'cor-jp-web',
    entries: [{
      id: fixedId,
      locale: 'ja',
      label: 'Approved FAQ',
      mimeType: 'application/vnd.google-apps.document',
      public: true,
      enabled: true,
    }],
    ...overrides,
  };
}

function makeFakeGws(dir) {
  const fakePath = path.join(dir, 'fake-gws.mjs');
  fs.writeFileSync(fakePath, `#!/usr/bin/env node
import fs from 'node:fs';
const args = process.argv.slice(2);
if (process.env.FAKE_GWS_LOG) {
  fs.appendFileSync(process.env.FAKE_GWS_LOG, JSON.stringify({ args, project: process.env.GOOGLE_WORKSPACE_PROJECT_ID }) + '\\n');
}
if (args.includes('drive')) {
  console.log(JSON.stringify({ id: 'approved-doc-123', mimeType: 'application/vnd.google-apps.document', modifiedTime: '2026-07-13T00:00:00Z' }));
} else {
  const mode = process.env.FAKE_GWS_MODE || 'clean';
  const text = mode === 'pii' ? 'Contact: user@example.com' : mode === 'secret' ? 'Token xoxs-12345678901234567890' : 'Public FAQ text.';
  console.log(JSON.stringify({ body: { content: [{ paragraph: { elements: [{ textRun: { content: text } }] } }] } }));
}
`, { mode: 0o755 });
  return fakePath;
}

function runSync({ manifest, dryRun = false, mode = 'clean' }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cloudia-kb-sync-'));
  const manifestPath = path.join(dir, 'manifest.json');
  const outputPath = path.join(dir, 'generated.json');
  const logPath = path.join(dir, 'gws.log');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  const fakeGws = makeFakeGws(dir);
  const result = spawnSync(process.execPath, [scriptPath, ...(dryRun ? ['--dry-run'] : [])], {
    cwd: packageRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      PUBLIC_KB_MANIFEST: manifestPath,
      PUBLIC_KB_OUTPUT: outputPath,
      GWS_BIN: fakeGws,
      FAKE_GWS_LOG: logPath,
      FAKE_GWS_MODE: mode,
      // The script must pin this back to cor-jp-web.
      GOOGLE_WORKSPACE_PROJECT_ID: 'attacker-project',
    },
  });
  const calls = fs.existsSync(logPath)
    ? fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean).map((line) => JSON.parse(line))
    : [];
  return { dir, outputPath, result, calls };
}

function cleanup(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

test('Worker source has no Workspace CLI or Google token runtime path', () => {
  const sourceDir = path.join(packageRoot, 'src');
  const source = fs.readdirSync(sourceDir)
    .filter((file) => file.endsWith('.ts'))
    .map((file) => fs.readFileSync(path.join(sourceDir, file), 'utf8'))
    .join('\n');
  assert.doesNotMatch(source, /\bgws\b|GOOGLE_WORKSPACE_PROJECT_ID|GOOGLE_APPLICATION_CREDENTIALS|GOOGLE_ACCESS_TOKEN/);
});

test('manifest project is pinned and cannot be redirected', () => {
  const run = runSync({ manifest: makeManifest({ project: 'attacker-project' }), dryRun: true });
  try {
    assert.notEqual(run.result.status, 0);
    assert.match(run.result.stderr, /cor-jp-web/);
    assert.equal(run.calls.length, 0);
  } finally {
    cleanup(run.dir);
  }
});

test('dry-run validates fixed IDs without contacting Workspace or writing content', () => {
  const run = runSync({ manifest: makeManifest(), dryRun: true });
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    assert.equal(fs.existsSync(run.outputPath), false);
    assert.equal(run.calls.length, 0);
    assert.match(run.result.stdout, /without contacting Workspace/);
  } finally {
    cleanup(run.dir);
  }
});

test('PII and secret-like document content fails closed before output write', () => {
  for (const mode of ['pii', 'secret']) {
    const run = runSync({ manifest: makeManifest(), mode });
    try {
      assert.notEqual(run.result.status, 0);
      assert.equal(fs.existsSync(run.outputPath), false);
      assert.doesNotMatch(`${run.result.stdout}\n${run.result.stderr}`, /user@example\.com|xoxs-/);
    } finally {
      cleanup(run.dir);
    }
  }
});

test('clean approved document is written atomically with restrictive permissions', () => {
  const run = runSync({ manifest: makeManifest() });
  try {
    assert.equal(run.result.status, 0, run.result.stderr);
    const stat = fs.statSync(run.outputPath);
    assert.equal(stat.mode & 0o777, 0o600);
    const payload = JSON.parse(fs.readFileSync(run.outputPath, 'utf8'));
    assert.equal(payload.project, 'cor-jp-web');
    assert.equal(payload.entries[0].text, 'Public FAQ text.');
  } finally {
    cleanup(run.dir);
  }
});
