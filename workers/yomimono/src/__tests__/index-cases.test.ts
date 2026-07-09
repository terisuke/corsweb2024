import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Env } from '../types';

const mocks = vi.hoisted(() => ({
  commitArticle: vi.fn(),
  listArticleSlugs: vi.fn(),
  listBlogArticles: vi.fn(),
  readBlogArticle: vi.fn(),
  updateBlogArticle: vi.fn(),
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
  listBlogArticles: mocks.listBlogArticles,
  readBlogArticle: mocks.readBlogArticle,
  updateBlogArticle: mocks.updateBlogArticle,
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

const newsArticle = {
  slug: 'external-news',
  title: '外部掲載ニュース',
  description: '外部掲載の説明',
  category: 'media',
  tags: ['news'],
  body: '',
  publishedAt: '2026-07-08',
  externalUrl: 'https://example.com/article',
  source: 'Example Media',
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
    mocks.listBlogArticles.mockResolvedValue([
      {
        collection: 'news',
        slug: 'external-news',
        title: '外部掲載ニュース',
        description: '外部掲載の説明',
        category: 'media',
        isDraft: false,
        pubDate: '2026-07-08',
        publishedAt: '2026-07-08',
        featured: true,
      },
    ]);
    mocks.readBlogArticle.mockResolvedValue({
      collection: 'news',
      slug: 'external-news',
      title: '外部掲載ニュース',
      description: '外部掲載の説明',
      category: 'media',
      isDraft: false,
      pubDate: '2026-07-08',
      publishedAt: '2026-07-08',
      featured: true,
      article: newsArticle,
      sha: 'news-sha',
      path: 'src/content/news/external-news.md',
      markdown:
        '---\n' +
        'title: "外部掲載ニュース"\n' +
        'description: "外部掲載の説明"\n' +
        'publishedAt: 2026-07-08\n' +
        'author: "Terisuke"\n' +
        'category: "media"\n' +
        'tags: ["news"]\n' +
        'lang: "ja"\n' +
        'isDraft: false\n' +
        'externalUrl: "https://example.com/article"\n' +
        'source: "Example Media"\n' +
        'featured: true\n' +
        '---\n' +
        '\n',
    });
    mocks.updateBlogArticle.mockResolvedValue({
      updated: true,
      path: 'src/content/news/external-news.md',
      commitUrl: 'https://github.com/Cor-Incorporated/corsweb2024/commit/update-news',
    });
  });

  it('GET /manual/cases は cases 投稿 UI を返し、collection 指定の publish/validate を含む', async () => {
    const res = await worker.fetch(req('/blog-admin/manual/cases'), env);
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(html).toContain('実績記事を公開する');
    expect(html).toContain('value="local-llm"');
    expect(html).toContain('id="m_draftBar"');
    expect(html).toContain('data-md="quote"');
    expect(html).toContain('data-md="hr"');
    expect(html).toContain('URLを編集する（上級者向け）');
    expect(html).toContain("titleToSlug($('m_title').value)");
    expect(html).toContain("var DRAFT_KEY = 'draft:cases:new'");
    expect(html).toContain('var IMG_CACHE_MAX = 20');
    expect(html).toContain("out.push('<blockquote>')");
    expect(html).toContain("out.push('<hr>')");
    expect(html).toContain("api('/api/validate', { collection:'cases', article:a })");
    expect(html).toContain("api('/api/publish', { collection:'cases', article:a })");
  });

  it('GET /manual/news は news 投稿 UI を返し、本文なし外部URL投稿の説明を含む', async () => {
    const res = await worker.fetch(req('/blog-admin/manual/news'), env);
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(html).toContain('ニュースを保存する');
    expect(html).toContain('value="media"');
    expect(html).toContain("var DRAFT_KEY = 'draft:news:new'");
    expect(html).toContain("api('/api/validate', { collection:'news', article:a })");
    expect(html).toContain("api('/api/publish', { collection:'news', article:a })");
    expect(html).toContain('外部URLがないニュースは本文を入力してください');
  });

  it('GET /api/recent?collection=cases は cases の slug 一覧を返す', async () => {
    const res = await worker.fetch(req('/blog-admin/api/recent?collection=cases'), env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ slugs: ['grift', 'local-llm-poc'] });
    expect(mocks.listArticleSlugs).toHaveBeenCalledWith(env, { mocked: true }, 'cases');
  });

  it('GET /api/articles?collection=news は news 一覧を返す', async () => {
    const res = await worker.fetch(req('/blog-admin/api/articles?collection=news'), env);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      articles: [
        {
          collection: 'news',
          slug: 'external-news',
          title: '外部掲載ニュース',
          description: '外部掲載の説明',
          category: 'media',
          isDraft: false,
          pubDate: '2026-07-08',
          publishedAt: '2026-07-08',
          featured: true,
        },
      ],
    });
    expect(mocks.listBlogArticles).toHaveBeenCalledWith(env, { mocked: true }, 'news');
  });

  it('GET /api/article?collection=news は sha 付きで news 記事を返す', async () => {
    const res = await worker.fetch(req('/blog-admin/api/article?collection=news&slug=external-news'), env);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      sha: 'news-sha',
      path: 'src/content/news/external-news.md',
      article: {
        slug: 'external-news',
        externalUrl: 'https://example.com/article',
        source: 'Example Media',
      },
    });
    expect(mocks.readBlogArticle).toHaveBeenCalledWith(env, { mocked: true }, 'external-news', 'news');
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

  it('POST /api/publish は news externalUrl ありなら本文なしで commitArticle を呼ぶ', async () => {
    mocks.commitArticle.mockResolvedValueOnce({
      committed: true,
      path: 'src/content/news/external-news.md',
      commitUrl: 'https://github.com/Cor-Incorporated/corsweb2024/commit/news',
    });
    const res = await worker.fetch(
      req('/blog-admin/api/publish', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ collection: 'news', article: newsArticle }),
      }),
      env,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      committed: true,
      path: 'src/content/news/external-news.md',
      commitUrl: 'https://github.com/Cor-Incorporated/corsweb2024/commit/news',
    });
    const [_env, _octokit, slug, markdown, _editor, collection] = mocks.commitArticle.mock.calls[0];
    expect(slug).toBe('external-news');
    expect(markdown).toContain('externalUrl: "https://example.com/article"');
    expect(markdown).toContain('source: "Example Media"');
    expect(markdown).toContain('featured: true');
    expect(collection).toBe('news');
  });

  it('POST /api/update は news を sha 付きで同じ slug に更新する', async () => {
    const res = await worker.fetch(
      req('/blog-admin/api/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          collection: 'news',
          originalSlug: 'external-news',
          sha: 'news-sha',
          article: { ...newsArticle, title: '更新ニュース', isDraft: true },
        }),
      }),
      env,
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      updated: true,
      path: 'src/content/news/external-news.md',
      commitUrl: 'https://github.com/Cor-Incorporated/corsweb2024/commit/update-news',
    });
    const [_env, _octokit, slug, markdown, sha, _editor, collection] = mocks.updateBlogArticle.mock.calls[0];
    expect(slug).toBe('external-news');
    expect(markdown).toContain('title: "更新ニュース"');
    expect(markdown).toContain('isDraft: true');
    expect(markdown).toContain('source: "Example Media"');
    expect(sha).toBe('news-sha');
    expect(collection).toBe('news');
  });

  it('POST /api/update は originalSlug と article.slug の差異を拒否する', async () => {
    const res = await worker.fetch(
      req('/blog-admin/api/update', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          collection: 'news',
          originalSlug: 'external-news',
          sha: 'news-sha',
          article: { ...newsArticle, slug: 'changed-news' },
        }),
      }),
      env,
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'slug は変更できません。記事を開き直してください' });
    expect(mocks.updateBlogArticle).not.toHaveBeenCalled();
  });
});
