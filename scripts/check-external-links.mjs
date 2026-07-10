#!/usr/bin/env node
/**
 * 公開前ガード（ADR-0010 / ADR-0007 / #244–#247）
 * - コンポーネント / pages / i18n に griftai.org 直書きがないこと（site.ts の既定値は除外）
 * - マーケティング文言に未実装の「30秒」・根拠のない倍率がないこと
 *
 * content/ 配下のブログ・事例は対象外（記事本文の外部リンクは許容）。
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['src/components', 'src/pages', 'src/i18n', 'src/layouts'];
const ALLOW_FILES = new Set([
  // DEFAULT_GRIFT_BASE とコメントのみ
  'src/config/site.ts',
]);

const EXT = new Set(['.astro', '.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.mdx']);

/** @type {{file: string, line: number, rule: string, text: string}[]} */
const findings = [];

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'content') continue;
      walk(full);
      continue;
    }
    const rel = relative(ROOT, full).replace(/\\/g, '/');
    if (ALLOW_FILES.has(rel)) continue;
    const ext = name.slice(name.lastIndexOf('.'));
    if (!EXT.has(ext)) continue;
    scanFile(full, rel);
  }
}

function scanFile(full, rel) {
  const text = readFileSync(full, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    // comments with griftai in works.astro etc. — still flag absolute URLs in code/strings
    if (/https?:\/\/griftai\.org/i.test(line)) {
      // allow pure comments that mention the domain for docs
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('<!--')) {
        return;
      }
      findings.push({
        file: rel,
        line: i + 1,
        rule: 'hardcoded-grift-url',
        text: trimmed.slice(0, 120),
      });
    }
    // 未実装の「30秒」約束（CTA 文言）
    if (
      /30\s*秒|30초|30\s*sec|30-second|30\s*s\b|（30\s*s）|\(30\s*s\)/i.test(line) &&
      !/30\s*日|30\s*days|第30|Articles?\s*30|¥?100k\s*-\s*¥?300k|10万.?30万|300万/i.test(line)
    ) {
      // privacy / legal noise
      if (/privacy|legal|tokushoho|個人情報|APPI/i.test(rel)) return;
      findings.push({
        file: rel,
        line: i + 1,
        rule: 'unverified-30-second-claim',
        text: line.trim().slice(0, 120),
      });
    }
    // 根拠のない倍率
    if (/4\s*[〜～~\-–—]\s*5\s*[倍×xX]|4\s*~\s*5배|4\s*–\s*5×/.test(line)) {
      findings.push({
        file: rel,
        line: i + 1,
        rule: 'unverified-multiplier',
        text: line.trim().slice(0, 120),
      });
    }
  });
}

for (const d of SCAN_DIRS) {
  walk(join(ROOT, d));
}

if (findings.length) {
  console.error('❌ check-external-links failed:\n');
  for (const f of findings) {
    console.error(`  [${f.rule}] ${f.file}:${f.line}`);
    console.error(`    ${f.text}\n`);
  }
  process.exit(1);
}

console.log('✅ check-external-links: no hardcoded griftai.org / 30s claims / unverified multipliers in scanned paths');
