#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const manifestPath = process.env.PUBLIC_KB_MANIFEST || path.join(root, 'knowledge/public-knowledge-manifest.json');
const outputPath = process.env.PUBLIC_KB_OUTPUT || path.join(root, 'knowledge/generated/public-knowledge.json');
const dryRun = process.argv.includes('--dry-run');
const gwsBin = process.env.GWS_BIN || 'gws';

const EXPECTED_PROJECT = 'cor-jp-web';
const SUPPORTED_DOC_MIME = 'application/vnd.google-apps.document';
const PLACEHOLDER_ID = /^REPLACE_WITH_APPROVED_/;
const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_RE = /(?<!\d)(?:\+?\d{1,3}[ -]?)?(?:0\d{1,4}[-ー－ ]?)?\d{2,4}[-ー－ ]?\d{3,4}[-ー－ ]?\d{3,4}(?!\d)/;
const POSTAL_RE = /(?:〒\s*)?\d{3}[-ー－ ]?\d{4}/;
const SECRET_RE = /(-----BEGIN [A-Z ]+PRIVATE KEY-----|AIza[0-9A-Za-z_-]{20,}|(?:sk|ghp|xox[a-z]?)-[A-Za-z0-9_-]{16,})/;

function fail(message) {
  console.error(`public knowledge sync failed: ${message}`);
  process.exit(1);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    fail(`cannot read manifest: ${path.basename(file)}`);
  }
}

function validateManifest(manifest) {
  if (!manifest || manifest.version !== 1 || manifest.project !== EXPECTED_PROJECT || !Array.isArray(manifest.entries)) {
    fail(`manifest must target ${EXPECTED_PROJECT} with version 1 and entries`);
  }
  const seen = new Set();
  for (const entry of manifest.entries) {
    if (!entry || typeof entry !== 'object') fail('manifest entry is not an object');
    if (typeof entry.id !== 'string' || PLACEHOLDER_ID.test(entry.id)) {
      if (entry.enabled) fail(`enabled entry ${entry.label || '(unlabeled)'} has no approved fixed document ID`);
      continue;
    }
    if (seen.has(entry.id)) fail(`duplicate document ID in manifest: ${entry.id}`);
    seen.add(entry.id);
    if (!['ja', 'en'].includes(entry.locale)) fail(`unsupported locale for ${entry.id}`);
    if (entry.mimeType !== SUPPORTED_DOC_MIME) fail(`unsupported MIME type for ${entry.id}`);
    if (entry.public !== true) fail(`entry ${entry.id} is not explicitly public`);
    if (typeof entry.label !== 'string' || !entry.label.trim()) fail(`entry ${entry.id} has no label`);
  }
}

function runGws(args) {
  const result = spawnSync(gwsBin, args, {
    cwd: root,
    // Workspace calls are operator/CI-only and always bound to the reviewed
    // project. Do not let a local environment override the target project.
    env: { ...process.env, GOOGLE_WORKSPACE_PROJECT_ID: EXPECTED_PROJECT },
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    // Do not echo stderr: it can contain request details or account metadata.
    fail(`gws request failed (exit ${result.status ?? 'unknown'})`);
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    fail('gws returned non-JSON output');
  }
}

function extractDocText(document) {
  const parts = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.textRun && typeof node.textRun.content === 'string') parts.push(node.textRun.content);
    if (Array.isArray(node.content)) node.content.forEach(walk);
    if (Array.isArray(node.elements)) node.elements.forEach(walk);
    // Google Docs wraps elements under paragraph/table/tableOfContents
    // structural objects. Walk other object-valued fields as well so a new
    // structural wrapper cannot silently turn an approved document into empty text.
    for (const [key, value] of Object.entries(node)) {
      if (key === 'textRun' || key === 'content' || key === 'elements') continue;
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') walk(value);
    }
  };
  walk(document?.body);
  return parts.join('').replace(/\r\n?/g, '\n').trim();
}

function assertPublicText(text, label) {
  if (!text || EMAIL_RE.test(text) || PHONE_RE.test(text) || POSTAL_RE.test(text) || SECRET_RE.test(text)) {
    fail(`PII/secret-like content detected in approved document ${label}; publish was blocked`);
  }
  if (text.length > 100_000) fail(`approved document ${label} exceeds the 100KB knowledge limit`);
}

function enabledEntries(manifest) {
  return manifest.entries.filter((entry) => entry.enabled === true);
}

function main() {
  const manifest = readJson(manifestPath);
  validateManifest(manifest);
  const entries = enabledEntries(manifest);
  if (entries.length === 0) {
    console.log('No enabled public knowledge entries. Add reviewed fixed IDs to the manifest before syncing.');
    return;
  }

  // The Google Workspace CLI intentionally has no --dry-run flag. A dry run
  // must therefore avoid invoking it altogether and only validate the checked-
  // in manifest. This guarantees that no document body or credential is read.
  if (dryRun) {
    console.log(`Validated ${entries.length} fixed public knowledge manifest entr${entries.length === 1 ? 'y' : 'ies'} without contacting Workspace.`);
    return;
  }

  const output = [];
  for (const entry of entries) {
    const metadataArgs = [
      'drive', 'files', 'get',
      '--params', JSON.stringify({ fileId: entry.id, fields: 'id,name,mimeType,modifiedTime' }),
    ];
    const docArgs = [
      'docs', 'documents', 'get',
      '--params', JSON.stringify({ documentId: entry.id }),
    ];
    const metadata = runGws(metadataArgs);
    if (metadata.id !== entry.id || metadata.mimeType !== SUPPORTED_DOC_MIME) {
      fail(`approved document ${entry.label} metadata did not match the manifest`);
    }
    const document = runGws(docArgs);
    const text = extractDocText(document);
    assertPublicText(text, entry.label);
    output.push({
      id: entry.id,
      locale: entry.locale,
      label: entry.label,
      mimeType: entry.mimeType,
      modifiedTime: metadata.modifiedTime || null,
      text,
    });
  }

  const payload = JSON.stringify({ version: 1, project: manifest.project, entries: output }, null, 2) + '\n';
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const tempPath = `${outputPath}.tmp-${process.pid}`;
  fs.writeFileSync(tempPath, payload, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(tempPath, outputPath);
  console.log(`Synced ${output.length} approved public knowledge document(s) to ${path.relative(root, outputPath)}.`);
}

main();
