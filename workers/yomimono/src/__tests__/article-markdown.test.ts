import { describe, expect, it } from 'vitest';
import { parseBlogMarkdown, parseArticleMarkdown, rebuildBlogMarkdown, rebuildArticleMarkdown } from '../article-markdown';
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

describe('parseArticleMarkdown / rebuildArticleMarkdown — collection 別編集', () => {
  const news = `---
title: "旧ニュース"
description: "旧説明"
publishedAt: 2026-07-08
author: "Terisuke"
category: "media"
tags: ["掲載"]
lang: "ja"
externalUrl: "https://example.com/old"
source: "Example"
isDraft: false
featured: true
---

`;

  it('news frontmatter を externalUrl/source/featured 付きで編集フォーム用 article に変換する', () => {
    const parsed = parseArticleMarkdown('old-news', news, 'news');
    expect(parsed.article).toMatchObject({
      slug: 'old-news',
      title: '旧ニュース',
      category: 'media',
      publishedAt: '2026-07-08',
      externalUrl: 'https://example.com/old',
      source: 'Example',
      featured: true,
      body: '',
    });
  });

  it('news の optional externalUrl/source は空にしたら frontmatter から削除し、sha 更新用 markdown を再構築する', () => {
    const updated: NormalizedArticle = {
      slug: 'old-news',
      title: '更新ニュース',
      description: '更新説明',
      category: 'info',
      tags: ['更新'],
      body: '## 本文\n\n内部ニュースです。',
      collection: 'news',
      publishedAt: '2026-07-09',
      isDraft: true,
      featured: false,
    };
    const rebuilt = rebuildArticleMarkdown(news, updated);
    expect(rebuilt).toContain('title: "更新ニュース"');
    expect(rebuilt).toContain('publishedAt: 2026-07-09');
    expect(rebuilt).toContain('category: "info"');
    expect(rebuilt).toContain('isDraft: true');
    expect(rebuilt).toContain('featured: false');
    expect(rebuilt).not.toContain('externalUrl:');
    expect(rebuilt).not.toContain('source:');
    expect(rebuilt).toContain('author: "Terisuke"');
  });

  it('cases は summary/publishedAt/featured を差し替え、未知 frontmatter を保持する', () => {
    const originalCase = `---
title: "旧実績"
description: "旧説明"
publishedAt: 2026-07-01
category: "grift"
tags: ["AI"]
summary: "旧リード"
securityNote: "NDA"
isDraft: false
featured: false
---

旧本文
`;
    const updated: NormalizedArticle = {
      slug: 'case-slug',
      title: '新実績',
      description: '新説明',
      category: 'local-llm',
      tags: ['LLM'],
      body: '## 成果\n\n更新本文',
      collection: 'cases',
      publishedAt: '2026-07-09',
      summary: '新リード',
      featured: true,
      isDraft: false,
    };
    const rebuilt = rebuildArticleMarkdown(originalCase, updated);
    expect(rebuilt).toContain('summary: "新リード"');
    expect(rebuilt).toContain('publishedAt: 2026-07-09');
    expect(rebuilt).toContain('featured: true');
    expect(rebuilt).toContain('securityNote: "NDA"');
    expect(rebuilt).toContain('## 成果\n\n更新本文\n');
  });
});
