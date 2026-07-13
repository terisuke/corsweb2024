import { describe, expect, it } from 'vitest';
import worker from '../index';
import type { Env } from '../types';

const env: Env = {
  ANTHROPIC_API_KEY: 'test-anthropic-key',
  GH_APP_PRIVATE_KEY: 'test-private-key',
  GH_OWNER: 'Cor-Incorporated',
  GH_REPO: 'corsweb2024',
  GH_APP_ID: '1',
  GH_INSTALLATION_ID: '2',
  BLOG_DIR: 'src/content/blog/ja',
  NEWS_DIR: 'src/content/news',
  CASES_DIR: 'src/content/cases',
  PUBLISH_BRANCH: 'develop',
  STYLE_GUIDE_PATH: 'docs/blog-style-guide.md',
  BASE_PATH: '/blog-admin',
  ACCESS_PASSWORD: 'correct-horse-battery-staple',
  SESSION_SECRET: 'unit-test-session-secret-0123456789',
};

function req(path: string, init?: RequestInit): Request {
  return new Request(`https://cor-jp.com${path}`, init);
}

function jsonReq(path: string, body: unknown): Request {
  return req(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function expectSecurityHeaders(response: Response): void {
  expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  expect(response.headers.get('cache-control')).toBe('no-store');
}

describe('yomimono Worker security headers', () => {
  it('ログインHTMLはCSPとsecurity headersを返す', async () => {
    const response = await worker.fetch(req('/blog-admin/login'), env);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(response.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
    expect(response.headers.get('content-security-policy')).toContain("base-uri 'none'");
    expect(response.headers.get('content-security-policy')).toContain("form-action 'none'");
    expectSecurityHeaders(response);
  });

  it('health JSONはcache-control no-store付きのsecurity headersを返す', async () => {
    const response = await worker.fetch(req('/blog-admin/health'), env);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({ ok: true, publishBranch: 'develop' });
    expectSecurityHeaders(response);
  });

  it('ログイン成功時もsecurity headersを返す', async () => {
    const response = await worker.fetch(
      jsonReq('/blog-admin/api/login', { password: env.ACCESS_PASSWORD }),
      env,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expectSecurityHeaders(response);
  });

  it('ログアウト時もsecurity headersを返す', async () => {
    const response = await worker.fetch(req('/blog-admin/api/logout', { method: 'POST' }), env);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expectSecurityHeaders(response);
  });

  it('未認証ページredirectもcache-control no-store付きのsecurity headersを返す', async () => {
    const response = await worker.fetch(req('/blog-admin/'), env);

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('/blog-admin/login');
    expectSecurityHeaders(response);
  });

  it('未認証API JSONもcache-control no-store付きのsecurity headersを返す', async () => {
    const response = await worker.fetch(jsonReq('/blog-admin/api/validate', {}), env);

    expect(response.status).toBe(401);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({ error: 'ログインが必要です' });
    expectSecurityHeaders(response);
  });
});
