import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../types';

const mocks = vi.hoisted(() => ({
  commitArticle: vi.fn(),
  listArticleSlugs: vi.fn(),
}));

vi.mock('../session', () => ({
  verifySession: vi.fn(async () => true),
  checkPassword: vi.fn(async () => true),
  createSessionCookie: vi.fn(async () => 'yomimono_session=test; HttpOnly'),
  clearSessionCookie: vi.fn(() => 'yomimono_session=; Max-Age=0'),
}));

vi.mock('../github', () => ({
  makeOctokit: vi.fn(() => ({ mocked: true })),
  getFileContent: vi.fn(),
  commitArticle: mocks.commitArticle,
  commitImage: vi.fn(),
  listArticleSlugs: mocks.listArticleSlugs,
}));

const worker = (await import('../index')).default;

const env: Env = {
  ANTHROPIC_API_KEY: 'test-key',
  GH_APP_PRIVATE_KEY: 'test-key',
  GH_OWNER: 'Cor-Incorporated',
  GH_REPO: 'corsweb2024',
  GH_APP_ID: '123',
  GH_INSTALLATION_ID: '456',
  BLOG_DIR: 'src/content/blog',
  NEWS_DIR: 'src/content/news',
  CASES_DIR: 'src/content/cases',
  PUBLISH_BRANCH: 'main',
  STYLE_GUIDE_PATH: 'docs/blog-style-guide.md',
  BASE_PATH: '/blog-admin',
  ACCESS_PASSWORD: 'x'.repeat(20),
  SESSION_SECRET: 'test-secret',
};

function req(path: string, init?: RequestInit): Request {
  return new Request('https://cor-jp.com' + path, init);
}

const caseArticle = {
  slug: 'new-case-study',
  title: '新しい実績記事',
  description: '実績記事の説明',
  category: 'local-llm',
  tags: ['AI', 'PoC'],
  summary: '実績記事のリード文',
  body: '## 課題\n\n本文\n\n## アプローチ\n\n本文\n\n## 実装\n\n本文\n\n## 成果\n\n本文',
  publishedAt: '2026-07-08',
  featured: true,
};

describe('yomimono Worker — cases CMS posting path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.commitArticle.mockResolvedValue({
      committed: true,
      path: 'src/content/cases/new-case-study.md',
      commitUrl: 'https://github.com/Cor-Incorporated/corsweb2024/commit/test',
    });
    mocks.listArticleSlugs.mockResolvedValue(['grift', 'local-llm-poc']);
  });

  it('GET /manual/cases は cases 投稿 UI を返し、collection 指定の publish/validate を含む', async () => {
    const res = await worker.fetch(req('/blog-admin/manual/cases'), env);
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(html).toContain('実績記事を公開する');
    expect(html).toContain('value="local-llm"');
    expect(html).toContain("api('/api/validate', { collection:'cases', article:a })");
    expect(html).toContain("api('/api/publish', { collection:'cases', article:a })");
  });

  it('GET /api/recent?collection=cases は cases の slug 一覧を返す', async () => {
    const res = await worker.fetch(req('/blog-admin/api/recent?collection=cases'), env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ slugs: ['grift', 'local-llm-poc'] });
    expect(mocks.listArticleSlugs).toHaveBeenCalledWith(env, { mocked: true }, 'cases');
  });

  it('POST /api/validate は cases article を cases markdown として検査する', async () => {
    const res = await worker.fetch(
      req('/blog-admin/api/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ collection: 'cases', article: caseArticle }),
      }),
      env,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ violations: [] });
  });

  it('POST /api/publish は cases ディレクトリ向けに commitArticle を呼ぶ', async () => {
    const res = await worker.fetch(
      req('/blog-admin/api/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ collection: 'cases', article: caseArticle }),
      }),
      env,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      committed: true,
      path: 'src/content/cases/new-case-study.md',
      commitUrl: 'https://github.com/Cor-Incorporated/corsweb2024/commit/test',
    });
    expect(mocks.commitArticle).toHaveBeenCalledTimes(1);
    const [calledEnv, _octokit, slug, markdown, editor, collection] = mocks.commitArticle.mock.calls[0];
    expect(calledEnv).toBe(env);
    expect(slug).toBe('new-case-study');
    expect(markdown).toContain('summary: "実績記事のリード文"');
    expect(markdown).toContain('category: "local-llm"');
    expect(editor).toBe('yomimono');
    expect(collection).toBe('cases');
  });

  it('news collection は M3 まで publish を拒否し続ける', async () => {
    const res = await worker.fetch(
      req('/blog-admin/api/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ collection: 'news', article: caseArticle }),
      }),
      env,
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: 'news collection は現在準備中です（blog/cases のみ利用可能）',
    });
    expect(mocks.commitArticle).not.toHaveBeenCalled();
  });
});
