import { callClaude, parseLastJsonBlock, MODEL_LIGHT } from './anthropic';
import type { Env, TopicCandidate } from './types';

// ① 情報収集: 直近約27時間の AI/DX/ローカルLLM 等から候補テーマを 10〜15 件ランキングで返す。
export async function collectTopics(env: Env, recentTitles: string[]): Promise<TopicCandidate[]> {
  const system = `あなたは Cor.（コア株式会社／代表 寺田康佑）のブログ編集AIです。日本の中小企業の実務に効く読みものの「候補テーマ」を提案します。

# タスク（スピード優先：web_searchは2〜3回まで。深追いせず手早く）
1. web_search を **2〜3回まで**で、直近およそ27時間以内の AI導入 / DX / 生成AIの社内活用 / ローカルLLM・セキュアAI / RAG / PoC・KPI / AI駆動開発 等の最新トピックをざっと調べる。検索を繰り返しすぎないこと。
2. 日本の中小企業の現場に「今」刺さるテーマを 10〜12 件、刺さり度の高い順（ランキング）に選ぶ。
3. 各テーマに、検索で見つけた実在の出典URLを1〜2件付ける（捏造禁止。見つからなければ sources は空配列でよい）。

# 重複回避（これらと同じ/近すぎるテーマは避ける）
${recentTitles.map((t) => `- ${t}`).join('\n')}

# 出力形式（最重要）
最後に **次のJSONだけ** を \`\`\`json コードフェンスで出力（前後に説明を付けない）:
\`\`\`json
{
  "candidates": [
    {
      "title": "テーマの日本語タイトル（記事見出し候補）",
      "summary": "1〜2文で、なぜ中小企業に今刺さるか",
      "sources": ["https://実在URL1", "https://実在URL2"],
      "freshnessHours": 6
    }
  ]
}
\`\`\``;

  const text = await callClaude(env, {
    system,
    userText:
      '直近約27時間のトピックを web_search で2〜3回ざっと調べ、中小企業向け読みものの候補テーマを10〜12件、ランキングで提案してください。検索は深追いせず、手早く。最後に指定のJSONのみを出力してください。',
    model: MODEL_LIGHT, // 収集は Sonnet で十分（コスト約40〜50%削減）
    useWebSearch: true,
    maxWebUses: 3, // 検索を3回に制限して高速化
    maxTokens: 6000,
  });

  const parsed = parseLastJsonBlock<{ candidates: TopicCandidate[] }>(text);
  if (!Array.isArray(parsed.candidates) || parsed.candidates.length === 0) {
    throw new Error('候補テーマを取得できませんでした');
  }
  // 形を最低限整える
  return parsed.candidates.slice(0, 15).map((c) => ({
    title: String(c.title ?? '').trim(),
    summary: String(c.summary ?? '').trim(),
    sources: Array.isArray(c.sources) ? c.sources.map(String) : [],
    freshnessHours: Number.isFinite(c.freshnessHours) ? c.freshnessHours : 0,
  }));
}
