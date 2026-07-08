import { describe, expect, it } from 'vitest';
import { parseBlogMarkdown, rebuildBlogMarkdown } from '../article-markdown';
import type { NormalizedArticle } from '../validate';

const original = `---
title: "旧タイトル"
description: "旧説明"
pubDate: 2026-07-01
author: "Terisuke"
category: "ai"
tags: ["生成AI","社内ルール"]
image:
  url: "/images/blog/sample.avif"
  alt: "サンプル"
lang: "ja"
featured: true
---

# 旧タイトル

本文です。
`;

describe('parseBlogMarkdown', () => {
  it('blog frontmatter と本文を編集フォーム用 article に変換する', () => {
    const parsed = parseBlogMarkdown('existing-post', original);
    expect(parsed.article).toMatchObject({
      slug: 'existing-post',
      title: '旧タイトル',
      description: '旧説明',
      category: 'ai',
      tags: ['生成AI', '社内ルール'],
      body: '# 旧タイトル\n\n本文です。',
      isDraft: false,
    });
    expect(parsed.frontmatter.pubDate).toBe('2026-07-01');
  });
});

describe('rebuildBlogMarkdown', () => {
  const updated: NormalizedArticle = {
    slug: 'existing-post',
    title: '新タイトル',
    description: '新説明',
    category: 'engineering',
    tags: ['更新', 'CMS'],
    body: '## 追記\n\n更新しました。',
    collection: 'blog',
    isDraft: true,
  };

  it('編集対象フィールドだけ差し替え、pubDate/image/featured を保持する', () => {
    const rebuilt = rebuildBlogMarkdown(original, updated);
    expect(rebuilt).toContain('title: "新タイトル"');
    expect(rebuilt).toContain('description: "新説明"');
    expect(rebuilt).toContain('category: "engineering"');
    expect(rebuilt).toContain('tags: ["更新","CMS"]');
    expect(rebuilt).toContain('isDraft: true');
    expect(rebuilt).toContain('pubDate: 2026-07-01');
    expect(rebuilt).toContain('image:\n  url: "/images/blog/sample.avif"\n  alt: "サンプル"');
    expect(rebuilt).toContain('featured: true');
    expect(rebuilt).toContain('## 追記\n\n更新しました。\n');
  });

  it('本文先頭の frontmatter 区切りだけ除去して保存する', () => {
    const rebuilt = rebuildBlogMarkdown(original, { ...updated, body: '---\n本文' });
    expect(rebuilt).toContain('\n---\n\n本文\n');
    expect(rebuilt).not.toContain('\n---\n\n---\n本文');
  });
});
