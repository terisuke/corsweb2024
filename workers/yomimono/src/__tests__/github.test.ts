import { describe, it, expect } from 'vitest';
import { contentDir } from '../github';
import type { Env } from '../types';

describe('contentDir — コレクション別コンテンツディレクトリパス', () => {
  const mockEnv: Env = {
    BLOG_DIR: 'src/content/blog',
    NEWS_DIR: 'src/content/news',
    CASES_DIR: 'src/content/cases',
    GH_OWNER: 'test-owner',
    GH_REPO: 'test-repo',
    GH_APP_ID: '123',
    GH_INSTALLATION_ID: '456',
    GH_APP_PRIVATE_KEY: 'test-key',
    PUBLISH_BRANCH: 'main',
    STYLE_GUIDE_PATH: 'docs/blog-style-guide.md',
    ANTHROPIC_API_KEY: 'test-key',
    ACCESS_PASSWORD: 'x'.repeat(20),
    SESSION_SECRET: 'test-secret',
    BASE_PATH: '/',
  };

  it('blog: `${BLOG_DIR}/ja` を返す', () => {
    const dir = contentDir(mockEnv, 'blog');
    expect(dir).toBe('src/content/blog/ja');
  });

  it('news: NEWS_DIR を返す', () => {
    const dir = contentDir(mockEnv, 'news');
    expect(dir).toBe('src/content/news');
  });

  it('cases: CASES_DIR を返す', () => {
    const dir = contentDir(mockEnv, 'cases');
    expect(dir).toBe('src/content/cases');
  });

  it('既定値（省略時）: blog → `${BLOG_DIR}/ja`', () => {
    const dir = contentDir(mockEnv);
    expect(dir).toBe('src/content/blog/ja');
  });

  it('パス結合の形式を確認（スラッシュの重複なし）', () => {
    const blogDir = contentDir(mockEnv, 'blog');
    expect(blogDir).not.toContain('//');
    // src/content/blog/ja (4 segments)
    expect(blogDir).toMatch(/^[^/]+\/[^/]+\/[^/]+\/[^/]+$/);

    const newsDir = contentDir(mockEnv, 'news');
    expect(newsDir).not.toContain('//');
    expect(newsDir).toMatch(/^[^/]+\/[^/]+\/[^/]+$/);

    const casesDir = contentDir(mockEnv, 'cases');
    expect(casesDir).not.toContain('//');
    expect(casesDir).toMatch(/^[^/]+\/[^/]+\/[^/]+$/);
  });
});
