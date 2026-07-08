#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const FIREBASE_CONFIG = path.resolve('firebase.json');

const normalize = value => String(value ?? '').toLowerCase();

const findRoute = (headers, source) => headers.find(route => route.source === source);

const headerMap = route => {
  const map = new Map();
  for (const header of route?.headers ?? []) {
    map.set(normalize(header.key), String(header.value ?? ''));
  }
  return map;
};

const hasHeader = (headers, key, expected) => {
  const actual = headers.get(normalize(key));
  return expected instanceof RegExp ? expected.test(actual ?? '') : actual === expected;
};

const requireRouteHeader = (violations, headers, source, key, expected) => {
  const route = findRoute(headers, source);
  if (!route) {
    violations.push(`[firebase-headers] Missing headers route: ${source}`);
    return;
  }
  const routeHeaders = headerMap(route);
  if (!hasHeader(routeHeaders, key, expected)) {
    const actual = routeHeaders.get(normalize(key)) ?? '<missing>';
    violations.push(
      `[firebase-headers] ${source} ${key} expected ${expected.toString()} but found "${actual}".`
    );
  }
};

const main = async () => {
  const raw = await readFile(FIREBASE_CONFIG, 'utf8');
  const config = JSON.parse(raw);
  const headers = config?.hosting?.headers;
  const violations = [];

  if (!Array.isArray(headers)) {
    throw new Error('[firebase-headers] hosting.headers must be an array.');
  }

  requireRouteHeader(violations, headers, '**', 'Cache-Control', /max-age=3600/);
  requireRouteHeader(violations, headers, '**', 'X-Content-Type-Options', 'nosniff');
  requireRouteHeader(
    violations,
    headers,
    '**',
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  );
  requireRouteHeader(violations, headers, '**', 'X-Frame-Options', 'DENY');

  requireRouteHeader(violations, headers, '**/*.html', 'Cache-Control', /no-cache/);
  requireRouteHeader(violations, headers, '**/*.html', 'Pragma', 'no-cache');
  requireRouteHeader(violations, headers, '**/*.html', 'Expires', '0');

  requireRouteHeader(violations, headers, '**/*.@(js|css)', 'Cache-Control', /immutable/);
  requireRouteHeader(
    violations,
    headers,
    '**/*.@(jpg|jpeg|png|gif|webp|avif|svg)',
    'Cache-Control',
    /immutable/
  );
  requireRouteHeader(violations, headers, '/images/blog/uploads/**', 'X-Content-Type-Options', 'nosniff');

  const allHeaders = headers.flatMap(route => route.headers ?? []);
  const csp = allHeaders.find(header => normalize(header.key) === 'content-security-policy');
  const reportOnly = allHeaders.find(
    header => normalize(header.key) === 'content-security-policy-report-only'
  );
  if (csp) {
    console.log('[firebase-headers][csp] enforcing CSP is configured; audit only checks presence here.');
  } else if (reportOnly) {
    console.log('[firebase-headers][csp] report-only CSP is configured.');
  } else {
    console.log('[firebase-headers][csp] planned: no Firebase CSP header is enforced by this baseline.');
  }

  if (violations.length > 0) {
    throw new Error(violations.join('\n'));
  }

  console.log('[firebase-headers] firebase.json passed baseline header audit.');
};

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
