import { describe, it, expect, vi } from 'vitest';
import {
  contentDir,
  deleteBlogArticle,
  listArticleSlugsDetailed,
  readBlogArticle,
  updateBlogArticle,
} from '../github';
import type { Env } from '../types';

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

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

describe('readBlogArticle / updateBlogArticle — 既存記事編集', () => {
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

  const markdown = `---
title: "編集対象"
description: "説明"
pubDate: 2026-07-08
author: "Terisuke"
category: "ai"
tags: ["a","b"]
lang: "ja"
isDraft: false
---

本文
`;

  it('readBlogArticle は blog/ja/<slug>.md を読み、sha と article を返す', async () => {
    const request = vi.fn(async () => ({
      data: {
        content: utf8ToBase64(markdown),
        sha: 'file-sha',
      },
    }));
    const article = await readBlogArticle(mockEnv, { request } as never, 'edit-target');
    expect(request).toHaveBeenCalledWith('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: 'test-owner',
      repo: 'test-repo',
      path: 'src/content/blog/ja/edit-target.md',
      ref: 'main',
    });
    expect(article.sha).toBe('file-sha');
    expect(article.article.title).toBe('編集対象');
    expect(article.article.slug).toBe('edit-target');
  });

  it('readBlogArticle は env.PUBLISH_BRANCH を ref として使う', async () => {
    const envDevelop = { ...mockEnv, PUBLISH_BRANCH: 'develop' };
    const request = vi.fn(async () => ({
      data: {
        content: utf8ToBase64(markdown),
        sha: 'file-sha',
      },
    }));
    await readBlogArticle(envDevelop, { request } as never, 'edit-target');

    expect(request).toHaveBeenCalledWith('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: 'test-owner',
      repo: 'test-repo',
      path: 'src/content/blog/ja/edit-target.md',
      ref: 'develop',
    });
  });

  it('updateBlogArticle は sha 付き PUT で同じ slug を更新する', async () => {
    const request = vi.fn(async () => ({
      data: { commit: { html_url: 'https://github.com/test/commit/1' } },
    }));
    const result = await updateBlogArticle(
      mockEnv,
      { request } as never,
      'edit-target',
      markdown,
      'file-sha',
      'editor@example.com',
    );
    expect(result).toEqual({
      updated: true,
      path: 'src/content/blog/ja/edit-target.md',
      commitUrl: 'https://github.com/test/commit/1',
    });
    expect(request).toHaveBeenCalledWith('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: 'test-owner',
      repo: 'test-repo',
      path: 'src/content/blog/ja/edit-target.md',
      branch: 'main',
      message: 'post(yomimono): edit-target（更新: editor）',
      content: utf8ToBase64(markdown),
      sha: 'file-sha',
    });
  });

  it('updateBlogArticle は env.PUBLISH_BRANCH を branch として使う', async () => {
    const envDevelop = { ...mockEnv, PUBLISH_BRANCH: 'develop' };
    const request = vi.fn(async () => ({
      data: { commit: { html_url: 'https://github.com/test/commit/2' } },
    }));
    await updateBlogArticle(envDevelop, { request } as never, 'edit-target', markdown, 'file-sha', 'editor@example.com');

    expect(request).toHaveBeenCalledWith('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: 'test-owner',
      repo: 'test-repo',
      path: 'src/content/blog/ja/edit-target.md',
      branch: 'develop',
      message: 'post(yomimono): edit-target（更新: editor）',
      content: utf8ToBase64(markdown),
      sha: 'file-sha',
    });
  });

  it('listArticleSlugsDetailed は対象ディレクトリ404を source/warning 付きで返す', async () => {
    const envDevelop = { ...mockEnv, PUBLISH_BRANCH: 'develop' };
    const request = vi.fn(async () => {
      const error = new Error('Not Found') as Error & { status?: number };
      error.status = 404;
      throw error;
    });

    const result = await listArticleSlugsDetailed(envDevelop, { request } as never, 'news');

    expect(result).toEqual({
      slugs: [],
      source: {
        collection: 'news',
        branch: 'develop',
        dir: 'src/content/news',
      },
      warning: '管理対象 branch "develop" に src/content/news が見つかりません',
    });
  });

  it('deleteBlogArticle は sha 付き DELETE で対象collectionのMarkdownだけを削除する', async () => {
    const request = vi.fn(async () => ({
      data: { commit: { html_url: 'https://github.com/test/commit/delete' } },
    }));
    const result = await deleteBlogArticle(
      mockEnv,
      { request } as never,
      'news-target',
      'news-sha',
      'editor@example.com',
      'news',
    );

    expect(result).toEqual({
      deleted: true,
      path: 'src/content/news/news-target.md',
      commitUrl: 'https://github.com/test/commit/delete',
    });
    expect(request).toHaveBeenCalledWith('DELETE /repos/{owner}/{repo}/contents/{path}', {
      owner: 'test-owner',
      repo: 'test-repo',
      path: 'src/content/news/news-target.md',
      branch: 'main',
      message: 'news(yomimono): news-target（削除: editor）',
      sha: 'news-sha',
    });
  });

  it('deleteBlogArticle は GitHub 409 を同時編集エラーに変換する', async () => {
    const request = vi.fn(async () => {
      const error = new Error('Conflict') as Error & { status?: number };
      error.status = 409;
      throw error;
    });

    await expect(
      deleteBlogArticle(mockEnv, { request } as never, 'edit-target', 'stale-sha', 'editor@example.com'),
    ).rejects.toThrow('記事が別の編集で更新されています。開き直してから削除してください');
  });
});
