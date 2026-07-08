#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const FILES = {
  yomimono: path.resolve('workers/yomimono/src/index.ts'),
  yomimonoWrangler: path.resolve('workers/yomimono/wrangler.toml'),
  contact: path.resolve('workers/contact-chat/src/index.ts'),
  contactWrangler: path.resolve('workers/contact-chat/wrangler.toml'),
};

const assertIncludes = (violations, label, text, expected) => {
  if (!text.includes(expected)) {
    violations.push(`[worker-headers] ${label} must include: ${expected}`);
  }
};

const assertMatches = (violations, label, text, pattern) => {
  if (!pattern.test(text)) {
    violations.push(`[worker-headers] ${label} must match: ${pattern}`);
  }
};

const main = async () => {
  const [yomimono, yomimonoWrangler, contact, contactWrangler] = await Promise.all(
    Object.values(FILES).map(file => readFile(file, 'utf8'))
  );
  const violations = [];

  assertIncludes(violations, 'yomimono route', yomimonoWrangler, 'cor-jp.com/blog-admin*');
  assertIncludes(violations, 'contact route', contactWrangler, 'cor-jp.com/api/contact/*');

  assertIncludes(violations, 'yomimono security headers', yomimono, 'const SECURITY_HEADERS');
  assertIncludes(violations, 'yomimono security headers', yomimono, "'x-content-type-options': 'nosniff'");
  assertIncludes(violations, 'yomimono security headers', yomimono, "'referrer-policy': 'no-referrer'");
  assertIncludes(violations, 'yomimono security headers', yomimono, "'cache-control': 'no-store'");
  assertIncludes(violations, 'yomimono html CSP', yomimono, "'content-security-policy': CSP");
  assertIncludes(violations, 'yomimono CSP', yomimono, "frame-ancestors 'none'");
  assertIncludes(violations, 'yomimono CSP', yomimono, "base-uri 'none'");
  assertIncludes(violations, 'yomimono CSP', yomimono, "form-action 'none'");
  assertIncludes(violations, 'yomimono CSP', yomimono, "connect-src 'self'");
  assertMatches(
    violations,
    'yomimono json helper',
    yomimono,
    /headers:\s*\{\s*'content-type':\s*'application\/json; charset=utf-8',\s*\.\.\.SECURITY_HEADERS\s*\}/
  );
  assertMatches(
    violations,
    'yomimono redirect',
    yomimono,
    /headers:\s*\{\s*location:\s*base \+ '\/login',\s*\.\.\.SECURITY_HEADERS\s*\}/
  );

  assertIncludes(violations, 'contact json headers', contact, "'x-content-type-options': 'nosniff'");
  assertIncludes(violations, 'contact json headers', contact, "'referrer-policy': 'no-referrer'");
  assertIncludes(violations, 'contact json headers', contact, "'cache-control': 'no-store'");
  assertIncludes(violations, 'contact origin policy', contact, 'isSameOrigin(req)');

  if (yomimono.includes("script-src 'unsafe-inline'") || yomimono.includes("style-src 'unsafe-inline'")) {
    console.log(
      '[worker-headers][csp] yomimono keeps inline script/style for the self-contained CMS UI; stricter CSP is planned, not enforced by this baseline.'
    );
  }

  if (violations.length > 0) {
    throw new Error(violations.join('\n'));
  }

  console.log('[worker-headers] Cloudflare Worker header baseline passed.');
};

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
