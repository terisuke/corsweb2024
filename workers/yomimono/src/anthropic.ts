import Anthropic from '@anthropic-ai/sdk';
import type { Env } from './types';

export const MODEL_HEAVY = 'claude-opus-4-8'; // 記事生成（品質重視）
export const MODEL_LIGHT = 'claude-sonnet-4-6'; // 情報収集（web_search→整形, コスト重視）
const MAX_PAUSE_TURNS = 8;

interface CallOptions {
  system: string;
  userText: string;
  model?: string;
  maxTokens?: number;
  useWebSearch?: boolean;
  maxWebUses?: number; // web検索の最大回数（少ないほど速い）
}

// web_search はサーバーサイドツール。stop_reason: "pause_turn" が出たら継続再送する。
// 重要: messages.stream() で逐次受信する。web検索は1回の応答が長くなりがちで、
// Cloudflare Workers のサブリクエスト上限(~100s)を超えると 524 になるため、
// ストリーミングで接続を保ち続ける。max_uses で検索回数も抑える。
export async function callClaude(env: Env, opts: CallOptions): Promise<string> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const tools: Anthropic.ToolUnion[] | undefined = opts.useWebSearch
    ? [{ type: 'web_search_20260209', name: 'web_search', max_uses: opts.maxWebUses ?? 5 }]
    : undefined;

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: opts.userText }];

  let response: Anthropic.Message | undefined;
  for (let i = 0; i < MAX_PAUSE_TURNS; i++) {
    response = await client.messages
      .stream({
        model: opts.model ?? MODEL_HEAVY,
        max_tokens: opts.maxTokens ?? 16000,
        thinking: { type: 'adaptive' },
        system: opts.system,
        tools,
        messages,
      })
      .finalMessage();
    if (response.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: response.content });
      continue;
    }
    break;
  }

  if (!response) throw new Error('Claude からの応答がありません');
  if (response.stop_reason === 'pause_turn') {
    throw new Error(`web_search の継続上限（${MAX_PAUSE_TURNS}回）に達しました。テーマを絞って再試行してください`);
  }
  if (response.stop_reason === 'refusal') {
    throw new Error('モデルが安全上の理由でリクエストを拒否しました（refusal）');
  }
  if (response.stop_reason !== 'end_turn') {
    throw new Error(`生成が正常終了しませんでした（stop_reason: ${response.stop_reason}）`);
  }

  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
}

// 最後の ```json ブロックを取り出して JSON.parse する。
export function parseLastJsonBlock<T>(text: string): T {
  const blocks = [...text.matchAll(/```json\s*([\s\S]*?)```/g)];
  if (blocks.length === 0) {
    throw new Error('出力からJSONブロックを取得できませんでした');
  }
  try {
    return JSON.parse(blocks[blocks.length - 1][1].trim()) as T;
  } catch {
    throw new Error('モデル出力のJSON解析に失敗しました（出力が途中で切れた可能性があります）');
  }
}
