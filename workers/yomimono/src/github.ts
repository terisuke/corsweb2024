import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';
import { assertSlug } from './validate';
import type { Env } from './types';

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

// 既存記事のスラッグ一覧（重複テーマ回避用）。BLOG_DIR/ja のファイル名から .md を除いたもの。
export async function listArticleSlugs(env: Env, octokit: Octokit): Promise<string[]> {
  try {
    const res = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: env.GH_OWNER,
      repo: env.GH_REPO,
      path: `${env.BLOG_DIR}/ja`,
      ref: env.PUBLISH_BRANCH,
    });
    const items = res.data as Array<{ name: string; type: string }>;
    return Array.isArray(items)
      ? items
          .filter((it) => it.type === 'file' && it.name.endsWith('.md'))
          .map((it) => it.name.replace(/\.md$/, ''))
      : [];
  } catch {
    return []; // 一覧取得失敗は致命的でない（重複回避が弱まるだけ）
  }
}

// 記事 .md を PUBLISH_BRANCH（既定 main）へコミット。
// content-bot はこのパス（記事のみ）にしか書かない＝コードには触れない。
export async function commitArticle(
  env: Env,
  octokit: Octokit,
  slug: string,
  markdown: string,
  authorEmail: string,
): Promise<{ committed: true; path: string; commitUrl: string }> {
  assertSlug(slug); // 多重防御: 呼び出し側でも検証済みだが、ここでもパストラバーサルを必ず弾く
  const path = `${env.BLOG_DIR}/ja/${slug}.md`;

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
  console.log('yomimono publish:', { slug, authorEmail });
  const res = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner: env.GH_OWNER,
    repo: env.GH_REPO,
    path,
    branch: env.PUBLISH_BRANCH,
    message: `post(yomimono): ${slug}（公開: ${author}）`,
    content: utf8ToBase64(markdown),
  });
  const data = res.data as { commit?: { html_url?: string } };
  return { committed: true, path, commitUrl: data.commit?.html_url ?? '' };
}
