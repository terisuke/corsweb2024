import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';
import { assertSlug, safeImageName } from './validate';
import type { Collection, Env } from './types';
import { parseArticleMarkdown } from './article-markdown';

export interface BlogArticleSummary {
  collection: Collection;
  slug: string;
  title: string;
  description: string;
  category: string;
  isDraft: boolean;
  pubDate: string;
  publishedAt?: string;
  featured?: boolean;
}

export interface BlogArticleFile extends BlogArticleSummary {
  article: ReturnType<typeof parseArticleMarkdown>['article'];
  markdown: string;
  sha: string;
  path: string;
}

export interface CollectionSource {
  collection: Collection;
  branch: string;
  dir: string;
}

export interface ArticleListResult {
  articles: BlogArticleSummary[];
  source: CollectionSource;
  warning?: string;
}

export function makeOctokit(env: Env): Octokit {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: Number(env.GH_APP_ID),
      privateKey: env.GH_APP_PRIVATE_KEY,
      installationId: Number(env.GH_INSTALLATION_ID),
    },
  });
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToUtf8(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// コレクションに応じたコンテンツディレクトリを返す。
export function contentDir(env: Env, collection: Collection = 'blog'): string {
  if (collection === 'news') return env.NEWS_DIR;
  if (collection === 'cases') return env.CASES_DIR;
  return `${env.BLOG_DIR}/ja`;
}

export function collectionSource(env: Env, collection: Collection = 'blog'): CollectionSource {
  return {
    collection,
    branch: env.PUBLISH_BRANCH,
    dir: contentDir(env, collection),
  };
}

// リポジトリのファイル内容を取得（文体ガイド等）。
export async function getFileContent(env: Env, octokit: Octokit, path: string): Promise<string> {
  const res = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: env.GH_OWNER,
    repo: env.GH_REPO,
    path,
    ref: env.PUBLISH_BRANCH,
  });
  const data = res.data as { content?: string };
  if (!data.content) throw new Error(`ファイルを取得できません: ${path}`);
  return base64ToUtf8(data.content);
}

// 既存記事のスラッグ一覧（重複テーマ回避用）。コレクションディレクトリのファイル名から .md を除いたもの。
export async function listArticleSlugs(
  env: Env,
  octokit: Octokit,
  collection: Collection = 'blog',
): Promise<string[]> {
  try {
    const result = await listArticleSlugsDetailed(env, octokit, collection);
    return result.slugs;
  } catch {
    return []; // 一覧取得失敗は致命的でない（重複回避が弱まるだけ）
  }
}

export async function listArticleSlugsDetailed(
  env: Env,
  octokit: Octokit,
  collection: Collection = 'blog',
): Promise<{ slugs: string[]; source: CollectionSource; warning?: string }> {
  const source = collectionSource(env, collection);
  try {
    const res = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: env.GH_OWNER,
      repo: env.GH_REPO,
      path: source.dir,
      ref: env.PUBLISH_BRANCH,
    });
    const items = res.data as Array<{ name: string; type: string }>;
    const slugs = Array.isArray(items)
      ? items
          .filter((it) => it.type === 'file' && it.name.endsWith('.md'))
          .map((it) => it.name.replace(/\.md$/, ''))
      : [];
    return { slugs, source };
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 404) {
      return {
        slugs: [],
        source,
        warning: `管理対象 branch "${source.branch}" に ${source.dir} が見つかりません`,
      };
    }
    throw e;
  }
}

function blogArticlePath(env: Env, slug: string, collection: Collection = 'blog'): string {
  assertSlug(slug);
  return `${contentDir(env, collection)}/${slug}.md`;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export async function readBlogArticle(
  env: Env,
  octokit: Octokit,
  slug: string,
  collection: Collection = 'blog',
): Promise<BlogArticleFile> {
  const path = blogArticlePath(env, slug, collection);
  const res = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner: env.GH_OWNER,
    repo: env.GH_REPO,
    path,
    ref: env.PUBLISH_BRANCH,
  });
  const data = res.data as { content?: string; sha?: string };
  if (!data.content || !data.sha) throw new Error(`記事を取得できません: ${path}`);
  const markdown = base64ToUtf8(data.content);
  const parsed = parseArticleMarkdown(slug, markdown, collection);
  const pubDate = asString(parsed.frontmatter.pubDate);
  const publishedAt = asString(parsed.frontmatter.publishedAt);
  return {
    collection,
    slug,
    title: asString(parsed.frontmatter.title),
    description: asString(parsed.frontmatter.description),
    category: asString(parsed.frontmatter.category),
    isDraft: parsed.frontmatter.isDraft === true,
    pubDate: collection === 'blog' ? pubDate : publishedAt,
    publishedAt,
    featured: parsed.frontmatter.featured === true,
    article: parsed.article,
    markdown,
    sha: data.sha,
    path,
  };
}

export async function listBlogArticles(
  env: Env,
  octokit: Octokit,
  collection: Collection = 'blog',
): Promise<BlogArticleSummary[]> {
  const { slugs } = await listArticleSlugsDetailed(env, octokit, collection);
  return readArticleSummaries(env, octokit, collection, slugs);
}

export async function listBlogArticlesWithSource(
  env: Env,
  octokit: Octokit,
  collection: Collection = 'blog',
): Promise<ArticleListResult> {
  const { slugs, source, warning } = await listArticleSlugsDetailed(env, octokit, collection);
  const articles = await readArticleSummaries(env, octokit, collection, slugs);
  return { articles, source, ...(warning ? { warning } : {}) };
}

async function readArticleSummaries(
  env: Env,
  octokit: Octokit,
  collection: Collection,
  slugs: string[],
): Promise<BlogArticleSummary[]> {
  const articles: BlogArticleSummary[] = [];
  for (const slug of slugs) {
    try {
      const article = await readBlogArticle(env, octokit, slug, collection);
      articles.push({
        collection,
        slug: article.slug,
        title: article.title || slug,
        description: article.description,
        category: article.category,
        isDraft: article.isDraft,
        pubDate: article.pubDate,
        publishedAt: article.publishedAt,
        featured: article.featured,
      });
    } catch {
      // 一覧では壊れた単一記事で画面全体を落とさない。
    }
  }
  return articles.sort((a, b) => b.pubDate.localeCompare(a.pubDate) || a.slug.localeCompare(b.slug));
}

export async function updateBlogArticle(
  env: Env,
  octokit: Octokit,
  slug: string,
  markdown: string,
  sha: string,
  authorEmail: string,
  collection: Collection = 'blog',
): Promise<{ updated: true; path: string; commitUrl: string }> {
  const path = blogArticlePath(env, slug, collection);
  if (!sha) throw new Error('更新元の記事情報が不足しています。記事を開き直してください');

  const author = authorEmail.split('@')[0];
  const prefix = collection === 'news' ? 'news' : collection === 'cases' ? 'case' : 'post';
  try {
    const res = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: env.GH_OWNER,
      repo: env.GH_REPO,
      path,
      branch: env.PUBLISH_BRANCH,
      message: `${prefix}(yomimono): ${slug}（更新: ${author}）`,
      content: utf8ToBase64(markdown),
      sha,
    });
    const data = res.data as { commit?: { html_url?: string } };
    return { updated: true, path, commitUrl: data.commit?.html_url ?? '' };
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 409) {
      throw new Error('記事が別の編集で更新されています。開き直してから保存してください');
    }
    throw e;
  }
}

export async function deleteBlogArticle(
  env: Env,
  octokit: Octokit,
  slug: string,
  sha: string,
  authorEmail: string,
  collection: Collection = 'blog',
): Promise<{ deleted: true; path: string; commitUrl: string }> {
  const path = blogArticlePath(env, slug, collection);
  if (!sha) throw new Error('削除元の記事情報が不足しています。記事を開き直してください');

  const author = authorEmail.split('@')[0];
  const prefix = collection === 'news' ? 'news' : collection === 'cases' ? 'case' : 'post';
  try {
    const res = await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
      owner: env.GH_OWNER,
      repo: env.GH_REPO,
      path,
      branch: env.PUBLISH_BRANCH,
      message: `${prefix}(yomimono): ${slug}（削除: ${author}）`,
      sha,
    });
    const data = res.data as { commit?: { html_url?: string } };
    return { deleted: true, path, commitUrl: data.commit?.html_url ?? '' };
  } catch (e: unknown) {
    if ((e as { status?: number }).status === 409) {
      throw new Error('記事が別の編集で更新されています。開き直してから削除してください');
    }
    if ((e as { status?: number }).status === 404) {
      throw new Error('記事が見つかりません。すでに削除されている可能性があります');
    }
    throw e;
  }
}

// 記事 .md を PUBLISH_BRANCH（develop/main をCIまたはdeploy時に指定）へコミット。
// content-bot はこのパス（記事のみ）にしか書かない＝コードには触れない。
export async function commitArticle(
  env: Env,
  octokit: Octokit,
  slug: string,
  markdown: string,
  authorEmail: string,
  collection: Collection = 'blog',
): Promise<{ committed: true; path: string; commitUrl: string }> {
  assertSlug(slug); // 多重防御: 呼び出し側でも検証済みだが、ここでもパストラバーサルを必ず弾く
  const dir = contentDir(env, collection);
  const path = `${dir}/${slug}.md`;

  // 重複 slug チェック（既存なら拒否）
  try {
    await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: env.GH_OWNER,
      repo: env.GH_REPO,
      path,
      ref: env.PUBLISH_BRANCH,
    });
    throw new Error(`同名の記事が既に存在します: ${path}`);
  } catch (e: unknown) {
    const status = (e as { status?: number }).status;
    if (status !== 404) throw e; // 404 = 未存在＝新規でOK。それ以外は本物のエラー
  }

  // 公開コミットは public 履歴に残るため、メールアドレス全体は埋め込まない（収集対策）。
  // ローカル部のみ記録し、完全なメールはサーバー側ログにのみ残す。
  const author = authorEmail.split('@')[0];
  const prefix = collection === 'news' ? 'news' : collection === 'cases' ? 'case' : 'post';
  console.log(`yomimono publish (${collection}):`, { slug, authorEmail });
  const res = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: env.GH_OWNER,
    repo: env.GH_REPO,
    path,
    branch: env.PUBLISH_BRANCH,
    message: `${prefix}(yomimono): ${slug}（公開: ${author}）`,
    content: utf8ToBase64(markdown),
  });
  const data = res.data as { commit?: { html_url?: string } };
  return { committed: true, path, commitUrl: data.commit?.html_url ?? '' };
}

// 手動エディタからの画像を public/images/blog/uploads/ へコミットし、公開URLを返す。
// content-bot はここ（画像）と記事 .md にしか書かない。
export async function commitImage(
  env: Env,
  octokit: Octokit,
  filename: string,
  base64: string,
  uploaderEmail: string,
): Promise<{ url: string; path: string; commitUrl: string }> {
  const name = safeImageName(filename); // 拡張子検証＋パストラバーサル防止
  const content = base64.replace(/\s/g, '');
  if (!content || !/^[A-Za-z0-9+/]+={0,2}$/.test(content)) {
    throw new Error('画像データ（base64）が不正です');
  }
  const full = `${Date.now()}-${name}`;
  const path = `public/images/blog/uploads/${full}`;
  const author = uploaderEmail.split('@')[0];
  console.log('yomimono image upload:', { path, uploaderEmail });
  const res = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: env.GH_OWNER,
    repo: env.GH_REPO,
    path,
    branch: env.PUBLISH_BRANCH,
    message: `img(yomimono): ${full}（${author}）`,
    content, // GitHub Contents API は base64 を期待。画像はクライアントが base64 化済み。
  });
  const data = res.data as { commit?: { html_url?: string } };
  return { url: `/images/blog/uploads/${full}`, path, commitUrl: data.commit?.html_url ?? '' };
}
