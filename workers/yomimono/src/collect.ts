import { callClaude, parseLastJsonBlock } from './anthropic';
import type { Env, TopicCandidate } from './types';

// ① 情報収集: 直近約27時間の AI/DX/ローカルLLM 等から候補テーマを 10〜15 件ランキングで返す。
export async function collectTopics(env: Env, recentTitles: string[]): Promise<TopicCandidate[]> {
  const system = `あなたは Cor.（コア株式会社／代表 寺田康佑）のブログ編集AIです。日本の中小企業の実務に効く読みものの「候補テーマ」を提案します。

# タスク
1. web_search で、直近およそ27時間以内の AI導入 / DX / 生成AIの社内活用 / ローカルLLM・セキュアAI / RAG / PoC・KPI / AI駆動開発 等の最新トピックを調べる。
2. 日本の中小企業の現場に「今」刺さるテーマを 10〜15 件、刺さり度の高い順（ランキング）に選ぶ。
3. 各テーマに、実在する一次情報の出典URLを1〜3件付ける（捏造禁止）。

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
      '直近約27時間のトピックを web_search で調べ、中小企業向け読みものの候補テーマを10〜15件、ランキングで提案してください。最後に指定のJSONのみを出力してください。',
    useWebSearch: true,
    maxTokens: 8000,
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
