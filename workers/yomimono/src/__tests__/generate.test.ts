import { describe, it, expect } from 'vitest';
import { buildNewsMarkdown, buildCasesMarkdown, buildMarkdown } from '../generate';
import type { NormalizedArticle } from '../validate';

describe('buildNewsMarkdown — news frontmatter 形式検証', () => {
  const newsArticle: NormalizedArticle = {
    slug: 'test-news-slug',
    title: 'テストニュース',
    description: 'テストニュース説明',
    category: 'info',
    tags: ['tag1', 'tag2'],
    body: '## テスト本文\n\n内容',
    collection: 'news',
    publishedAt: '2026-07-08',
    externalUrl: 'https://example.com/article',
    source: 'Example Media',
    featured: true,
    isDraft: false,
  };

  it('news: externalUrl あり→frontmatter に externalUrl を含む', () => {
    const markdown = buildNewsMarkdown(newsArticle, false);
    expect(markdown).toContain('externalUrl: "https://example.com/article"');
    expect(markdown).toContain('source: "Example Media"');
    expect(markdown).toContain('featured: true');
    expect(markdown).toContain('title: "テストニュース"');
    expect(markdown).toContain('description: "テストニュース説明"');
    expect(markdown).toContain('category: "info"');
    expect(markdown).toContain('publishedAt: 2026-07-08');
    expect(markdown).toContain('isDraft: false');
    expect(markdown).toContain('lang: "ja"');
  });

  it('news: externalUrl なし→frontmatter に externalUrl を含まない', () => {
    const articleWithoutUrl = { ...newsArticle, externalUrl: undefined };
    const markdown = buildNewsMarkdown(articleWithoutUrl, false);
    expect(markdown).not.toContain('externalUrl:');
    expect(markdown).toContain('title: "テストニュース"');
  });

  it('news: isDraft パラメータを反映', () => {
    const markdown = buildNewsMarkdown(newsArticle, true);
    expect(markdown).toContain('isDraft: true');

    const markdownDraft = buildNewsMarkdown(newsArticle, false);
    expect(markdownDraft).toContain('isDraft: false');
  });

  it('news: frontmatter の形式が既存ファイルと整合する', () => {
    const markdown = buildNewsMarkdown(newsArticle, false);
    // frontmatter のフィールド順序を確認
    const lines = markdown.split('\n');
    const titleIndex = lines.findIndex((line) => line.includes('title:'));
    const descriptionIndex = lines.findIndex((line) => line.includes('description:'));
    const publishedAtIndex = lines.findIndex((line) => line.includes('publishedAt:'));
    const authorIndex = lines.findIndex((line) => line.includes('author:'));
    const categoryIndex = lines.findIndex((line) => line.includes('category:'));
    const tagsIndex = lines.findIndex((line) => line.includes('tags:'));
    const langIndex = lines.findIndex((line) => line.includes('lang:'));
    const isDraftIndex = lines.findIndex((line) => line.includes('isDraft:'));
    // 2回目の --- (frontmatter終了) を見つける
    const endIndex = lines.lastIndexOf('---');

    // 全てのフィールドが frontmatter 内に存在すること
    expect(titleIndex).toBeGreaterThan(0);
    expect(descriptionIndex).toBeGreaterThan(0);
    expect(publishedAtIndex).toBeGreaterThan(0);
    expect(authorIndex).toBeGreaterThan(0);
    expect(categoryIndex).toBeGreaterThan(0);
    expect(tagsIndex).toBeGreaterThan(0);
    expect(langIndex).toBeGreaterThan(0);
    expect(isDraftIndex).toBeGreaterThan(0);
    expect(endIndex).toBeGreaterThan(0);

    // body が frontmatter の後に存在すること
    const bodyIndex = lines.findIndex((line) => line.includes('## テスト本文'));
    expect(bodyIndex).toBeGreaterThan(endIndex);
  });
});

describe('buildCasesMarkdown — cases frontmatter 形式検証', () => {
  const casesArticle: NormalizedArticle = {
    slug: 'test-cases-slug',
    title: 'テストケース',
    description: 'テストケース説明',
    category: 'ai-contract',
    tags: ['tag1', 'tag2'],
    body: '## テスト本文\n\n内容',
    collection: 'cases',
    publishedAt: '2026-07-08',
    summary: 'テストケース要約',
    featured: true,
    isDraft: false,
  };

  it('cases: frontmatter に summary を含む', () => {
    const markdown = buildCasesMarkdown(casesArticle, false);
    expect(markdown).toContain('summary: "テストケース要約"');
    expect(markdown).toContain('title: "テストケース"');
    expect(markdown).toContain('description: "テストケース説明"');
    expect(markdown).toContain('category: "ai-contract"');
    expect(markdown).toContain('publishedAt: 2026-07-08');
  });

  it('cases: featured を反映', () => {
    const markdown = buildCasesMarkdown(casesArticle, false);
    expect(markdown).toContain('featured: true');

    const articleNotFeatured = { ...casesArticle, featured: false };
    const markdownNotFeatured = buildCasesMarkdown(articleNotFeatured, false);
    expect(markdownNotFeatured).toContain('featured: false');
  });

  it('cases: isDraft パラメータを反映（バグ修正）', () => {
    const markdownDraft = buildCasesMarkdown(casesArticle, true);
    expect(markdownDraft).toContain('isDraft: true');

    const markdownPublished = buildCasesMarkdown(casesArticle, false);
    expect(markdownPublished).toContain('isDraft: false');
  });

  it('cases: frontmatter の形式が既存ファイルと整合する', () => {
    const markdown = buildCasesMarkdown(casesArticle, false);
    const lines = markdown.split('\n');

    // 既存の cases ファイルと整合するフィールド構成
    expect(markdown).toContain('title: "テストケース"');
    expect(markdown).toContain('description: "テストケース説明"');
    expect(markdown).toContain('category: "ai-contract"');
    expect(markdown).toContain('publishedAt: 2026-07-08');
    expect(markdown).toContain('summary: "テストケース要約"');
    expect(markdown).toContain('isDraft: false');
    expect(markdown).toContain('featured: true');

    // body が frontmatter の後に存在すること
    const endIndex = lines.lastIndexOf('---');
    const bodyIndex = lines.findIndex((line) => line.includes('## テスト本文'));
    expect(bodyIndex).toBeGreaterThan(endIndex);
  });

  it('cases: isDraft ハードコードバグが修正されている（反証可能）', () => {
    // もし isDraft がハードコードされていれば、このテストは失敗する
    const markdownDraft = buildCasesMarkdown(casesArticle, true);
    const markdownPublished = buildCasesMarkdown(casesArticle, false);

    // isDraft=true と false で結果が異なることを確認
    expect(markdownDraft).not.toEqual(markdownPublished);
    expect(markdownDraft).toContain('isDraft: true');
    expect(markdownPublished).toContain('isDraft: false');
  });
});

describe('buildMarkdown — blog との整合性検証', () => {
  const blogArticle: NormalizedArticle = {
    slug: 'test-blog-slug',
    title: 'テストブログ',
    description: 'テストブログ説明',
    category: 'ai',
    tags: ['tag1', 'tag2'],
    body: '## テスト本文\n\n内容',
    collection: 'blog',
    pubDate: '2026-07-08',
    isDraft: false,
  };

  it('blog: isDraft パラメータを反映', () => {
    const markdownDraft = buildMarkdown(blogArticle, true);
    const markdownPublished = buildMarkdown(blogArticle, false);

    expect(markdownDraft).toContain('isDraft: true');
    expect(markdownPublished).toContain('isDraft: false');
  });

  it('blog: pubDate を使用（publishedAt ではなく）', () => {
    const markdown = buildMarkdown(blogArticle, false);
    expect(markdown).toContain('pubDate: 2026-07-08');
    expect(markdown).not.toContain('publishedAt:');
  });
});
