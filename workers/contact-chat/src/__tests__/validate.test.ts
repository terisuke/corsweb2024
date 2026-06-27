import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  MAX_MESSAGE_LEN,
  MAX_MESSAGES,
  normalizeInquiry,
  normalizeMessages,
  sanitizeLine,
  sanitizeMessage,
} from '../validate';

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
});
