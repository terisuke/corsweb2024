import { afterEach, describe, it, expect, vi } from 'vitest';
import worker, { extractJsonObject, parseChatResult } from '../index';
import { resetRateLimits } from '../security';
import type { Env } from '../types';

afterEach(() => {
  resetRateLimits();
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// parseChatResult — 反証可能テスト。
// 旧実装（フェンス正規表現のみ → 失敗時に raw blob を reply にする）に対して
// 「unfenced prose-wrapped JSON」「reply に ``` を含む」ケースは FAIL するはず。
// それを assert することで、新しい balanced-brace 抽出が効いていることを保証する。
// ─────────────────────────────────────────────────────────────────────────────
describe('extractJsonObject — 文字列リテラルを尊重した {} 抽出', () => {
  it('純粋なオブジェクトを抽出', () => {
    expect(extractJsonObject('{"a":1}')).toBe('{"a":1}');
  });
  it('散文に包まれても最初のトップレベルオブジェクトを抽出', () => {
    expect(extractJsonObject('Sure!\n{"a":1}\nthanks')).toBe('{"a":1}');
  });
  it('文字列リテラル内の } に惑わされない', () => {
    expect(extractJsonObject('{"reply":"a } b","x":1}')).toBe('{"reply":"a } b","x":1}');
  });
  it('エスケープされた引用符を正しく扱う', () => {
    expect(extractJsonObject('{"reply":"say \\"hi\\"","x":1}')).toBe(
      '{"reply":"say \\"hi\\"","x":1}',
    );
  });
  it('{ が無ければ null', () => {
    expect(extractJsonObject('no json here')).toBeNull();
  });
});

describe('parseChatResult', () => {
  it('クリーンなJSONをパースする', () => {
    const r = parseChatResult('{"reply":"こんにちは","classification":"genuine","readyForContact":false}');
    expect(r.reply).toBe('こんにちは');
    expect(r.classification).toBe('genuine');
    expect(r.readyForContact).toBe(false);
  });

  it('```json フェンスをパースする', () => {
    const r = parseChatResult('```json\n{"reply":"hi","classification":"sales","readyForContact":true}\n```');
    expect(r.reply).toBe('hi');
    expect(r.classification).toBe('sales');
    expect(r.readyForContact).toBe(true);
  });

  it('言語指定なしの ``` フェンスをパースする', () => {
    const r = parseChatResult('```\n{"reply":"hey","classification":"genuine","readyForContact":false}\n```');
    expect(r.reply).toBe('hey');
  });

  // ▼ 反証コア①: 散文に包まれた JSON。旧実装は parse 失敗で raw 全体を reply にするため
  //   reply に '{' が混入する。新実装は extractJsonObject で JSON を取り出すので混入しない。
  it('散文に包まれたJSON: reply に { を含まない（旧regex実装ではFAIL）', () => {
    const r = parseChatResult('Sure!\n{"reply":"承知しました","classification":"genuine","readyForContact":true}');
    expect(r.reply).toBe('承知しました');
    expect(r.reply).not.toContain('{');
    expect(r.readyForContact).toBe(true);
  });

  // ▼ 反証コア②: reply 値そのものに ``` を含む。旧フェンス正規表現は ``` を境界と誤認し
  //   JSON.parse が壊れ、raw blob を返す。新実装は構造化された reply を取り出す。
  it('reply 値に ``` を含む: 構造化 reply を取り出す（生 blob を返さない）（旧regex実装ではFAIL）', () => {
    const raw = '{"reply":"コードは ```js x``` です","classification":"genuine","readyForContact":false}';
    const r = parseChatResult(raw);
    expect(r.reply).toBe('コードは ```js x``` です');
    // 生の JSON blob（"classification" キー文字列）が reply に漏れていないこと
    expect(r.reply).not.toContain('"classification"');
  });

  it('プレーンな散文（JSONなし）はそのまま reply にフォールバック', () => {
    const r = parseChatResult('ただのテキストです');
    expect(r.reply).toBe('ただのテキストです');
    expect(r.classification).toBe('genuine');
    expect(r.readyForContact).toBe(false);
  });

  it('壊れたJSONはフォールバック（生テキスト）', () => {
    const r = parseChatResult('{"reply":"x", broken');
    expect(r.reply).toBe('{"reply":"x", broken');
    expect(r.classification).toBe('genuine');
  });

  it.each([
    ['null', 'null'],
    ['配列', '[1,2,3]'],
    ['数値', '42'],
  ])('object でない JSON(%s)はフォールバック扱い', (_n, raw) => {
    const r = parseChatResult(raw);
    // object でないので構造化されず、生テキストが reply になる
    expect(r.reply).toBe(raw);
    expect(r.classification).toBe('genuine');
  });

  it('空白のみ → 日本語フォールバック文言', () => {
    const r = parseChatResult('   ');
    expect(r.reply).toContain('もう一度');
  });

  it('無効な classification は genuine に正規化', () => {
    const r = parseChatResult('{"reply":"x","classification":"evil","readyForContact":false}');
    expect(r.classification).toBe('genuine');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ハンドラレベル（worker.fetch）
// ─────────────────────────────────────────────────────────────────────────────
const ENV = {
  LLM_PROVIDER: 'anthropic',
  ANTHROPIC_API_KEY: '',
  RESEND_API_KEY: '',
  TURNSTILE_SECRET: '',
  CONTACT_TO_EMAIL: 'info@cor-jp.com',
  CONTACT_FROM_EMAIL: 'noreply@cor-jp.com',
} as unknown as Env;

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://cor-jp.com' + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

describe('worker.fetch — ハンドラレベル', () => {
  it('health は 200', async () => {
    const res = await worker.fetch(
      new Request('https://cor-jp.com/api/contact/health'),
      ENV,
    );
    expect(res.status).toBe(200);
  });

  it('JSON でない content-type は 400', async () => {
    const req = new Request('https://cor-jp.com/api/contact/chat', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: 'hello',
    });
    const res = await worker.fetch(req, ENV);
    expect(res.status).toBe(400);
  });

  it('過大ボディは 400（バイト基準）', async () => {
    // 64KB 超のJSON文字列（CJKでなくても確実に超えるサイズ）
    const big = JSON.stringify({ messages: [{ role: 'user', content: 'x'.repeat(70000) }] });
    const res = await worker.fetch(post('/api/contact/chat', big), ENV);
    expect(res.status).toBe(400);
  });

  it('クロスオリジンの Origin は 403', async () => {
    // undici/vitest 環境は Request 構築時に Origin を禁止ヘッダとして落とすため、
    // ヘッダを確実に持たせる最小モックで渡す（yomimono の Cookie モックと同方針）。
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      origin: 'https://evil.example',
    };
    const req = {
      method: 'POST',
      url: 'https://cor-jp.com/api/contact/chat',
      headers: { get: (n: string) => headers[n.toLowerCase()] ?? null },
      text: async () => JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
    } as unknown as Request;
    const res = await worker.fetch(req, ENV);
    expect(res.status).toBe(403);
  });

  it('未知メソッド/パスは 404', async () => {
    const res = await worker.fetch(
      new Request('https://cor-jp.com/api/contact/unknown', { method: 'GET' }),
      ENV,
    );
    expect(res.status).toBe(404);
  });

  it('chat レート制限超過で 429', async () => {
    const ip = '203.0.113.7';
    const mk = () =>
      post('/api/contact/chat', { messages: [{ role: 'user', content: 'hi' }] }, {
        'cf-connecting-ip': ip,
      });
    // ANTHROPIC_API_KEY 未設定なので各回 503 になるが、レート制限はその手前で評価される。
    // 上限(20)+1 回叩いて最後が 429 になることを確認。
    let last = 200;
    for (let i = 0; i < 21; i++) {
      const res = await worker.fetch(mk(), ENV);
      last = res.status;
    }
    expect(last).toBe(429);
  });

  it('LLM 未設定（ANTHROPIC_API_KEY 空）は 503 fail closed', async () => {
    const res = await worker.fetch(
      post('/api/contact/chat', { messages: [{ role: 'user', content: 'hi' }] }, {
        'cf-connecting-ip': '198.51.100.9',
      }),
      ENV,
    );
    expect(res.status).toBe(503);
  });

  it('chat: TURNSTILE_SECRET 設定済みでもトークン無しで 403 にならない（Turnstileは/chatでは検証しない）', async () => {
    // Turnstile トークンは単回使用のため /chat では検証しない（複数ターン会話が壊れるのを防ぐ）。
    // TURNSTILE_SECRET を設定しても、トークン無しの /chat が 403 にならないことを保証する。
    // siteverify が呼ばれていないことも確認する（fetch をスパイ）。
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const envWithTurnstile = { ...ENV, TURNSTILE_SECRET: 'secret' } as unknown as Env;
    const res = await worker.fetch(
      post('/api/contact/chat', { messages: [{ role: 'user', content: 'hi' }] }, {
        'cf-connecting-ip': '198.51.100.20',
      }),
      envWithTurnstile,
    );
    // ANTHROPIC_API_KEY 未設定なので 503（fail closed）になるが、重要なのは 403 でないこと。
    expect(res.status).not.toBe(403);
    expect(res.status).toBe(503);
    // siteverify(Turnstile) が呼ばれていないこと（/chat では検証しない）。
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('submit: RESEND_API_KEY 未設定は 503 fail closed', async () => {
    const res = await worker.fetch(
      post(
        '/api/contact/submit',
        { name: '太郎', email: 'taro@example.com', message: '相談です' },
        { 'cf-connecting-ip': '198.51.100.10' },
      ),
      ENV,
    );
    expect(res.status).toBe(503);
  });

  it('submit: ハニーポット命中はサイレント 200（送信せず）', async () => {
    const res = await worker.fetch(
      post(
        '/api/contact/submit',
        {
          name: '太郎',
          email: 'taro@example.com',
          message: '相談です',
          website: 'http://spam.example',
        },
        { 'cf-connecting-ip': '198.51.100.11' },
      ),
      ENV,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok?: boolean };
    expect(body.ok).toBe(true);
  });
});
