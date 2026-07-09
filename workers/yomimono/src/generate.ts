import { callClaude, parseLastJsonBlock } from './anthropic';
import { scanForViolations } from './guardrails';
import { assertSlug, normalizeCategory, type NormalizedArticle } from './validate';
import type { Collection, Env, Article, Violation, TopicCandidate } from './types';

// ④ 記事生成: 社長の文体メモリ（blog-style-guide.md）で1本書く。
// 戻り値に guardrail 検査結果を含め、⑤レビューで人が確認できるようにする。
export async function generateArticle(
  env: Env,
  theme: TopicCandidate,
  recentTitles: string[],
  styleGuide: string,
): Promise<{ article: Article; markdown: string; violations: Violation[] }> {
  const system = `${styleGuide}

# あなたのタスク
あなたは Cor.（コア株式会社／代表 寺田康佑）のブログ執筆AIです。上の「文体ガイド」に完全に従って、記事を1本書きます。

# 今回のテーマ
タイトル候補: ${theme.title}
要点: ${theme.summary}
参考の出典（必要に応じ web_search で裏取り・追加）: ${theme.sources.join(', ')}

手順:
1. web_search でテーマの最新情報・統計・一次情報を確認し、出典(実在URL)を控える。
2. 文体ガイドどおりに記事を書く。数値を出すなら必ず実在の出典を「## 参考」に併記。捏造禁止。
3. ガードレール厳守（旧事業名・未取得認証の取得済み主張・断定/効果保証・プレビューURL/下書きキーは禁止）。

# 重複回避（これらと同じ/近すぎる内容は避ける）
${recentTitles.map((t) => `- ${t}`).join('\n')}

# 出力形式（最重要）
調査と思考が終わったら、最後に **次のJSONだけ** を \`\`\`json コードフェンスで出力（前後に説明文を付けない）:
\`\`\`json
{
  "slug": "ascii-kebab-case-slug（英小文字/数字/ハイフンのみ、3〜80字、内容を表す）",
  "title": "日本語の記事タイトル",
  "description": "1〜2文の説明（カード・OGP用）",
  "category": "ai / engineering / founder / lab のいずれか（AI/DX系は通常 ai）",
  "tags": ["タグ1", "タグ2", "タグ3"],
  "body": "記事本文のmarkdown（## 見出しから始める。先頭にh1は付けない。末尾に ## 参考 として実在の出典URLを列挙）"
}
\`\`\``;

  const text = await callClaude(env, {
    system,
    userText:
      '指定テーマの記事を1本、最新情報を web_search で3〜4回ざっと調べたうえで、社長の文体で書いてください。検索は深追いせず手早く。最後に指定のJSONのみを出力してください。',
    useWebSearch: true,
    maxWebUses: 4, // 記事の裏取りは4回まで（速度のため）
    maxTokens: 12000,
  });

  const raw = parseLastJsonBlock<Partial<Article>>(text);

  const slug = String(raw.slug ?? '').trim();
  assertSlug(slug);
  const category = normalizeCategory(raw.category);
  const title = String(raw.title ?? '').trim();
  const description = String(raw.description ?? '').trim();
  const tags = Array.isArray(raw.tags) ? raw.tags.map(String) : [];
  const body = String(raw.body ?? '').trim();
  if (!title || !description || !body) {
    throw new Error('title / description / body のいずれかが空です');
  }

  const article: Article = { slug, title, description, category, tags, body };
  const markdown = buildMarkdown(article);
  const violations = scanForViolations(markdown);
  return { article, markdown, violations };
}

// JST基準の日付で frontmatter を組む（公開時はこの markdown をそのままコミット）。
export function buildMarkdown(article: NormalizedArticle | Article, isDraft = false): string {
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const pubDate = 'pubDate' in article && article.pubDate ? article.pubDate : today;
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(article.title)}`,
    `description: ${JSON.stringify(article.description)}`,
    `pubDate: ${pubDate}`,
    'author: "Terisuke"',
    `category: "${article.category}"`,
    `tags: ${JSON.stringify(article.tags)}`,
    'lang: "ja"',
    `isDraft: ${isDraft}`,
    '---',
    '',
  ].join('\n');
  // body 先頭が `---` だと frontmatter 区切りと紛らわしいので、先頭の区切り行のみ除去する。
  const body = article.body.replace(/^(?:\s*\n)*-{3,}[ \t]*(?:\n|$)/, '');
  return `${frontmatter}${body}\n`;
}

// news コレクション用の markdown を生成する。
export function buildNewsMarkdown(article: NormalizedArticle, isDraft = false): string {
  const publishedAt = article.publishedAt || new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(article.title)}`,
    `description: ${JSON.stringify(article.description)}`,
    `publishedAt: ${publishedAt}`,
    'author: "Terisuke"',
    `category: "${article.category}"`,
    `tags: ${JSON.stringify(article.tags)}`,
    'lang: "ja"',
    `isDraft: ${isDraft}`,
  ];
  if (article.externalUrl) {
    frontmatter.push(`externalUrl: ${JSON.stringify(article.externalUrl)}`);
  }
  if (article.source) {
    frontmatter.push(`source: ${JSON.stringify(article.source)}`);
  }
  frontmatter.push(`featured: ${article.featured || false}`);
  frontmatter.push('---', '');
  const body = article.body.replace(/^(?:\s*\n)*-{3,}[ \t]*(?:\n|$)/, '');
  return `${frontmatter.join('\n')}${body}\n`;
}

// cases コレクション用の markdown を生成する。
export function buildCasesMarkdown(article: NormalizedArticle, isDraft = false): string {
  const publishedAt = article.publishedAt || new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(article.title)}`,
    `description: ${JSON.stringify(article.description)}`,
    `category: "${article.category}"`,
    `tags: ${JSON.stringify(article.tags)}`,
    `publishedAt: ${publishedAt}`,
    `summary: ${JSON.stringify(article.summary || '')}`,
    `isDraft: ${isDraft}`,
    `featured: ${article.featured || false}`,
    '---',
    '',
  ];
  const body = article.body.replace(/^(?:\s*\n)*-{3,}[ \t]*(?:\n|$)/, '');
  return `${frontmatter.join('\n')}${body}\n`;
}
