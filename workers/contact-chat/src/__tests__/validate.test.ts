import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  MAX_MESSAGE_LEN,
  MAX_MESSAGES,
  normalizeInquiry,
  normalizeConversationSummary,
  normalizeIntent,
  maskMessagesForLlm,
  maskSensitiveContent,
  normalizeMessages,
  normalizeSource,
  normalizeStructuredLead,
  normalizeUtm,
  sanitizeLine,
  sanitizeMessage,
} from '../validate';
import { CONTACT_INTENTS } from '../types';

describe('sanitizeMessage — チャット入力サニタイズ（プロンプト注入対策）', () => {
  it('NUL/制御文字を空白化する（改行は残す）', () => {
    const out = sanitizeMessage('a\x00b\x1fc\nd', 100);
    expect(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(out)).toBe(false);
    expect(out).toContain('\n'); // 改行は会話文として保持
    expect(out).toContain('a b c');
  });
  it('長さを上限で切る', () => {
    expect(sanitizeMessage('x'.repeat(5000), 2000)).toHaveLength(2000);
  });
  it('CRLF を LF に正規化する', () => {
    expect(sanitizeMessage('a\r\nb', 100)).toBe('a\nb');
  });
});

describe('sanitizeLine — 単一行サニタイズ（name/email/company）', () => {
  it('改行を含む全制御文字を空白化し連続空白を畳む', () => {
    const out = sanitizeLine('john\ndoe\t\x00here', 100);
    expect(/[\x00-\x1F\x7F]/.test(out)).toBe(false);
    expect(out).toBe('john doe here');
  });
});

describe('normalizeMessages — /chat メッセージ検証', () => {
  it('正当な会話を ok:true で返す', () => {
    const r = normalizeMessages([
      { role: 'user', content: 'こんにちは' },
      { role: 'assistant', content: 'どんなご相談ですか？' },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.messages).toHaveLength(2);
  });

  it.each([
    ['空配列', []],
    ['配列でない', { role: 'user', content: 'x' }],
    ['null', null],
  ])('不正な入力(%s)は 400', (_n, input) => {
    const r = normalizeMessages(input as never);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('上限件数を超えると 400', () => {
    const many = Array.from({ length: MAX_MESSAGES + 1 }, () => ({ role: 'user', content: 'x' }));
    const r = normalizeMessages(many);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it.each([
    ['system ロール', { role: 'system', content: 'x' }],
    ['未知ロール', { role: 'tool', content: 'x' }],
  ])('user/assistant 以外のロール(%s)は 400', (_n, msg) => {
    const r = normalizeMessages([msg]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('content が文字列でないと 400', () => {
    const r = normalizeMessages([{ role: 'user', content: 123 }]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('サニタイズ後に空になるメッセージは 400', () => {
    const r = normalizeMessages([{ role: 'user', content: '\x00\x01\x02' }]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('各メッセージを上限長で切る', () => {
    const r = normalizeMessages([{ role: 'user', content: 'x'.repeat(MAX_MESSAGE_LEN + 500) }]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.messages[0].content).toHaveLength(MAX_MESSAGE_LEN);
  });
});

describe('Vertex直前PIIマスキング', () => {
  it('メール・電話・郵便番号・OTPを伏せ字にする', () => {
    const masked = maskSensitiveContent('mail me at user@example.com, 090-1234-5678, 〒100-0001, OTP 123456');
    expect(masked).not.toContain('user@example.com');
    expect(masked).not.toContain('090-1234-5678');
    expect(masked).not.toContain('100-0001');
    expect(masked).not.toContain('123456');
  });
  it('メッセージのroleを維持して本文だけをマスクする', () => {
    expect(maskMessagesForLlm([{ role: 'user', content: 'user@example.com' }])).toEqual([
      { role: 'user', content: '[redacted-email]' },
    ]);
  });
});

describe('isValidEmail', () => {
  it.each(['a@b.co', 'john.doe@example.com', 'user+tag@cor-jp.com'])('有効: %s', (e) => {
    expect(isValidEmail(e)).toBe(true);
  });
  it.each(['', 'noat', 'a@b', 'a@@b.com', 'a b@c.com', 'a@ b.com'])('無効: %s', (e) => {
    expect(isValidEmail(e)).toBe(false);
  });
  it('長すぎるアドレスを拒否', () => {
    expect(isValidEmail('a'.repeat(250) + '@example.com')).toBe(false);
  });
});

describe('normalizeInquiry — /submit 検証＋ハニーポット', () => {
  const base = {
    name: '山田太郎',
    email: 'taro@example.com',
    company: 'Example Inc',
    message: '新規Webアプリの相談です',
    conversationSummary: 'AIチャットの要約',
    classification: 'genuine',
  };

  it('正当な問い合わせを ok:true で正規化する', () => {
    const r = normalizeInquiry(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.inquiry.name).toBe('山田太郎');
      expect(r.inquiry.email).toBe('taro@example.com');
      expect(r.inquiry.classification).toBe('genuine');
    }
  });

  it('ハニーポット(website)が埋まっていれば honeypot:true / status 200', () => {
    const r = normalizeInquiry({ ...base, website: 'http://spam.example' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.honeypot).toBe(true);
      expect(r.status).toBe(200);
    }
  });

  it.each([
    ['name欠落', { ...base, name: '' }],
    ['message欠落', { ...base, message: '' }],
  ])('必須欠落(%s)は 400', (_n, input) => {
    const r = normalizeInquiry(input);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('不正なメールは 400', () => {
    const r = normalizeInquiry({ ...base, email: 'not-an-email' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('未知の classification は空文字に正規化（メール本文で(未分類)扱い）', () => {
    const r = normalizeInquiry({ ...base, classification: 'evil' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.inquiry.classification).toBe('');
  });

  it('company は任意（空でも ok）', () => {
    const r = normalizeInquiry({ ...base, company: '' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.inquiry.company).toBe('');
  });

  it('version 1 summary envelopeを検証してtextだけを保存値にする', () => {
    const r = normalizeInquiry({
      ...base,
      conversationSummary: {
        version: 1,
        locale: 'ja',
        intent: 'contract-dev',
        classification: 'genuine',
        readyForContact: true,
        stage: 'ready',
        structuredLead: { purpose: '業務改善' },
        text: '目的と時期を確認済み',
      },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.inquiry.conversationSummary).toBe('目的と時期を確認済み');
  });

  it('summaryText が旧conversationSummaryより優先される', () => {
    const r = normalizeInquiry({
      ...base,
      summaryText: {
        version: 1,
        locale: 'ja',
        intent: 'contract-dev',
        classification: 'genuine',
        readyForContact: false,
        stage: 'qualifying',
        structuredLead: {},
        text: '正本化された要約',
      },
      conversationSummary: '旧トランスクリプト',
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.inquiry.summaryText).toBe('正本化された要約');
  });
  it('version 1 summaryの不正enumは400', () => {
    const r = normalizeConversationSummary({ version: 1, locale: 'ja', intent: 'unknown', text: 'x' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });
  it('version 1 summaryのtext非文字列は400', () => {
    const r = normalizeConversationSummary({ version: 1, locale: 'ja', text: 123 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it('生トランスクリプトのroleラベルをsummaryTextへ持ち込まない', () => {
    const r = normalizeConversationSummary('user: メールは user@example.com\nassistant: 受付します');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.text).toBe('');
  });

  it('要約欠落時はPIIを含まない決定的fallbackを保存する', () => {
    const r = normalizeInquiry({ ...base, conversationSummary: undefined, message: '秘密の相談本文' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.inquiry.summaryText).toContain('分類: genuine');
      expect(r.inquiry.summaryText).not.toContain('秘密の相談本文');
      expect(r.inquiry.conversationSummary).toBe(r.inquiry.summaryText);
    }
  });
  it('構造化リードに混入したPIIも決定的fallbackへ再出力しない', () => {
    const r = normalizeInquiry({
      ...base,
      conversationSummary: undefined,
      structuredLead: { purpose: 'user@example.comへ連絡' },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.inquiry.summaryText).not.toContain('user@example.com');
  });
  it('既知のUIロールラベル付き全文は要約本文から除外する', () => {
    const r = normalizeConversationSummary('You: hello\nAI assistant: hi\n目的: 業務改善');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.text).toBe('目的: 業務改善');
  });
  it('生トランスクリプトは要約として採用しない', () => {
    const r = normalizeConversationSummary('Cloudia: こんにちは\nUser: 機密ではない相談です\n続きの本文');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.text).toBe('');
  });
});

describe('normalizeIntent / structuredLead / utm (#250)', () => {
  it('7 キーすべてを受理する', () => {
    for (const key of CONTACT_INTENTS) {
      expect(normalizeIntent(key)).toBe(key);
    }
  });
  it('未知キーは空文字にフォールバック（400 にしない）', () => {
    expect(normalizeIntent('evil-intent')).toBe('');
    expect(normalizeIntent(null)).toBe('');
    expect(normalizeIntent(123)).toBe('');
  });
  it('source を単一行サニタイズする', () => {
    expect(normalizeSource('header\nai-dev')).toBe('header ai-dev');
  });
  it('structuredLead の非文字列/未知キーを落とす', () => {
    const lead = normalizeStructuredLead({
      purpose: '受託開発',
      evil: 'x',
      industryRole: '製造',
      dataSensitivity: 'confidential',
    });
    expect(lead).toEqual({
      purpose: '受託開発',
      industryRole: '製造',
      dataSensitivity: 'confidential',
    });
  });
  it('utm は utm_ プレフィックスのみ受理', () => {
    const utm = normalizeUtm({ utm_source: 'cor', foo: 'bar', utm_campaign: 'p0' });
    expect(utm).toEqual({ utm_source: 'cor', utm_campaign: 'p0' });
  });
  it('submit で intent/source/lead を正規化する', () => {
    const r = normalizeInquiry({
      name: '山田太郎',
      email: 'taro@example.com',
      message: '相談です',
      intent: 'contract-dev',
      source: 'header-ai-dev',
      structuredLead: { purpose: '受託' },
      utm: { utm_source: 'nav' },
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.inquiry.intent).toBe('contract-dev');
      expect(r.inquiry.source).toBe('header-ai-dev');
      expect(r.inquiry.structuredLead.purpose).toBe('受託');
      expect(r.inquiry.utm.utm_source).toBe('nav');
    }
  });
  it('未知 intent でも submit は成功し intent は空', () => {
    const r = normalizeInquiry({
      name: '山田太郎',
      email: 'taro@example.com',
      message: '相談です',
      intent: 'not-a-real-key',
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.inquiry.intent).toBe('');
  });
});
