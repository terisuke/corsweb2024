// 毎日のブログ「下書き」自動生成スクリプト（全部 Claude）。
// Claude が web_search で最新トピックと一次出典を調べ、社長の文体（docs/blog-style-guide.md）で
// 記事を1本生成 → ガードレール検査 → src/content/blog/ja/{slug}.md に isDraft:true で書き出す。
// 公開は人の承認（PRレビュー＋isDraft:false）で行う＝draft-review。
//
// 実行: ANTHROPIC_API_KEY=... node scripts/generate-blog-draft.mjs
// 出力: 作成したファイルパスを stdout 最終行に出す（GitHub Actions が拾う）

import 'dotenv/config'; // ローカル実行時に .env を読む（CIではSecrets→env、.env無しでも無害）
import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { scanForViolations } from './blog-guardrails.mjs';

const BLOG_DIR = 'src/content/blog/ja';
const STYLE_GUIDE_PATH = 'docs/blog-style-guide.md';
const MODEL = 'claude-opus-4-8';
const VALID_CATEGORIES = ['ai', 'engineering', 'founder', 'lab'];

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY が未設定です。GitHub Secrets か .env に設定してください。');
  process.exit(1);
}

const styleGuide = fs.readFileSync(STYLE_GUIDE_PATH, 'utf8');

// 既存記事の最近のタイトルを集めて「重複トピック回避」に使う
function recentTitles(limit = 50) {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const md = fs.readFileSync(path.join(BLOG_DIR, f), 'utf8');
      const title = (md.match(/^title:\s*["']?(.+?)["']?\s*$/m) || [])[1] || f.replace(/\.md$/, '');
      const date = (md.match(/^pubDate:\s*["']?(\d{4}-\d{2}-\d{2})/m) || [])[1] || '0000-00-00';
      return { title, date };
    })
    .sort((a, b) => b.date.localeCompare(a.date)) // 新しい順
    .slice(0, limit)
    .map((x) => x.title);
}

const avoidTopics = recentTitles();

const system = `${styleGuide}

# あなたのタスク
あなたは Cor.（コア株式会社／代表 寺田康佑）のブログ執筆AIです。上の「文体ガイド」に完全に従って、記事を1本書きます。

手順:
1. web_search を使って、AI導入 / DX / 生成AIの社内活用 / ローカルLLM・セキュアAI / RAG / PoC / AI駆動開発 等の領域から、日本の中小企業の実務に「今」刺さる具体テーマを1つ選ぶ。
2. そのテーマの最新情報・統計・一次情報を web_search で確認し、出典(実在URL)を控える。
3. 文体ガイドどおりに記事を書く。数値を出すなら必ず実在の出典を「## 参考」に併記。捏造は禁止。
4. ガードレール厳守（旧事業名・未取得認証の取得済み主張・断定/効果保証・プレビューURL/下書きキーは禁止）。

# 重複回避（これらと同じ/近すぎるテーマは避ける）
${avoidTopics.map((t) => `- ${t}`).join('\n')}

# 出力形式（最重要）
調査と思考が終わったら、最後に **次のJSONだけ** を \`\`\`json コードフェンスで出力してください（前後に説明文を付けない）:
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

const messages = [
  {
    role: 'user',
    content:
      '今日の中小企業向けブログ記事を1本、最新情報を web_search で調べたうえで、社長の文体で書いてください。最後に指定のJSONのみを出力してください。',
  },
];

const tools = [{ type: 'web_search_20260209', name: 'web_search' }];

const client = new Anthropic();
async function generate() {
  return client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system,
    tools,
    messages,
  });
}

// web_search はサーバーサイドツール。stop_reason: "pause_turn" が出たら継続再送する。
let response;
for (let i = 0; i < 8; i++) {
  response = await generate();
  if (response.stop_reason === 'pause_turn') {
    messages.push({ role: 'assistant', content: response.content });
    continue;
  }
  break;
}

if (response.stop_reason === 'refusal') {
  console.error('❌ モデルが安全上の理由でリクエストを拒否しました（stop_reason: refusal）。スキップします。');
  process.exit(1);
}
// 正常終了(end_turn)以外（pause_turn上限到達・max_tokens 等）は不完全な出力の可能性が高いので中止
if (response.stop_reason !== 'end_turn') {
  console.error(`❌ 生成が正常終了しませんでした（stop_reason: ${response.stop_reason}）。スキップします。`);
  process.exit(1);
}

// 最終テキストから最後の ```json ブロックを取り出す
const finalText = response.content
  .filter((b) => b.type === 'text')
  .map((b) => b.text)
  .join('\n');

const jsonBlocks = [...finalText.matchAll(/```json\s*([\s\S]*?)```/g)];
if (jsonBlocks.length === 0) {
  // 本文はそのまま出さない（ガードレール前にプレビューURL等が漏れるのを防ぐ）。診断情報のみ。
  console.error('❌ 出力からJSONブロックを取得できませんでした。');
  console.error(
    `   stop_reason=${response.stop_reason} finalText長=${finalText.length} blocks=[${response.content.map((b) => b.type).join(', ')}]`,
  );
  process.exit(1);
}

let article;
try {
  article = JSON.parse(jsonBlocks[jsonBlocks.length - 1][1].trim());
} catch (e) {
  console.error('❌ JSONのパースに失敗:', e.message);
  process.exit(1);
}

// バリデーション
const slug = String(article.slug || '').trim();
if (!/^[a-z0-9-]{3,80}$/.test(slug)) {
  console.error(`❌ slug が不正です: "${slug}"（英小文字/数字/ハイフンのみ）`);
  process.exit(1);
}
const category = VALID_CATEGORIES.includes(article.category) ? article.category : 'ai';
const title = String(article.title || '').trim();
const description = String(article.description || '').trim();
const tags = Array.isArray(article.tags) ? article.tags.map(String) : [];
const body = String(article.body || '').trim();
if (!title || !description || !body) {
  console.error('❌ title / description / body のいずれかが空です。');
  process.exit(1);
}

const outPath = path.join(BLOG_DIR, `${slug}.md`);
if (fs.existsSync(outPath)) {
  console.error(`❌ 同名の記事が既に存在します: ${outPath}（重複トピックの可能性）`);
  process.exit(1);
}

// JST基準の日付（cronは06:00 JST=21:00 UTC実行のため、UTCだと前日になる）
const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
const frontmatter = [
  '---',
  `title: ${JSON.stringify(title)}`,
  `description: ${JSON.stringify(description)}`,
  `pubDate: ${today}`,
  'author: "Terisuke"',
  `category: "${category}"`,
  `tags: ${JSON.stringify(tags)}`,
  'lang: "ja"',
  'isDraft: true',
  '---',
  '',
].join('\n');

const markdown = `${frontmatter}${body}\n`;

// ガードレール検査（違反があれば書き出さずに失敗）
const violations = scanForViolations(markdown);
if (violations.length > 0) {
  console.error(`❌ ガードレール違反 ${violations.length}件のため中止:`);
  for (const v of violations) console.error(`  L${v.line} [${v.name}] "${v.match}" — ${v.reason}`);
  process.exit(1);
}

fs.writeFileSync(outPath, markdown, 'utf8');
console.error(`✅ 下書きを生成しました: ${title}`);
console.error(`   category=${category} tags=${tags.join(', ')}`);
// 最終行にパスだけ出す（CIが拾う）
console.log(outPath);
