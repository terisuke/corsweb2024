import { afterEach, describe, it, expect, vi } from 'vitest';
import { buildBody, buildSubject, getEmailProvider, sendInquiryEmail } from '../email';
import type { Env, NormalizedInquiry } from '../types';

afterEach(() => vi.restoreAllMocks());

const inquiry: NormalizedInquiry = {
  name: '山田太郎',
  email: 'taro@example.com',
  company: 'Example Inc',
  message: '新規Webアプリを作りたいです',
  conversationSummary: 'プロジェクト種別: 新規開発 / 目標: 受発注の効率化',
  classification: 'genuine',
};

describe('buildSubject', () => {
  it('分類タグと名前を含む', () => {
    expect(buildSubject(inquiry)).toBe('[genuine] お問い合わせ: 山田太郎');
  });
  it('未分類なら分類タグなし', () => {
    expect(buildSubject({ ...inquiry, classification: '' })).toBe('お問い合わせ: 山田太郎');
  });
});

describe('buildBody — 構造化本文（PIIはここにのみ載る）', () => {
  const body = buildBody(inquiry);
  it('PII（name/email/company/message）を含む', () => {
    expect(body).toContain('山田太郎');
    expect(body).toContain('taro@example.com');
    expect(body).toContain('Example Inc');
    expect(body).toContain('新規Webアプリを作りたいです');
  });
  it('会話サマリと分類メモを含む', () => {
    expect(body).toContain('AIチャットの会話サマリ');
    expect(body).toContain('受発注の効率化');
    expect(body).toContain('genuine');
  });
  it('company 未記入なら (未記入) と表示', () => {
    expect(buildBody({ ...inquiry, company: '' })).toContain('(未記入)');
  });
  it('会話サマリが無ければサマリ節を出さない', () => {
    expect(buildBody({ ...inquiry, conversationSummary: '' })).not.toContain('会話サマリ');
  });
});

describe('getEmailProvider — fail closed', () => {
  it('RESEND_API_KEY 未設定なら 503（握り潰さない）', () => {
    const r = getEmailProvider({ RESEND_API_KEY: '' } as unknown as Env);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(503);
  });
  it('RESEND_API_KEY ありなら provider を返す', () => {
    const r = getEmailProvider({ RESEND_API_KEY: 're_test' } as unknown as Env);
    expect(r.ok).toBe(true);
  });
});

describe('sendInquiryEmail — Resend 呼び出し（fetchモック）', () => {
  const env = {
    RESEND_API_KEY: 're_test',
    CONTACT_TO_EMAIL: 'info@cor-jp.com',
    CONTACT_FROM_EMAIL: 'noreply@cor-jp.com',
  } as unknown as Env;

  it('to/from と本文を正しく送る', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const r = getEmailProvider(env);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    await sendInquiryEmail(env, r.provider, inquiry);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const payload = JSON.parse(init.body as string);
    expect(payload.to).toBe('info@cor-jp.com');
    expect(payload.from).toBe('noreply@cor-jp.com');
    expect(payload.text).toContain('taro@example.com');
    // reply_to に問い合わせ者のメールが入る（担当者の返信が顧客へ届く）
    expect(payload.reply_to).toBe('taro@example.com');
    // セキュリティ: html は絶対に送らない（staff webmail の stored-XSS 防止）。text のみ。
    expect(payload.html).toBeUndefined();
    expect('html' in payload).toBe(false);
    expect(typeof payload.text).toBe('string');
    // Authorization に鍵が載るが、レスポンス/ログには出さない設計（ここでは送信ヘッダのみ確認）
    expect((init.headers as Record<string, string>).authorization).toContain('re_test');
  });

  it('Resend が非2xxなら例外（status のみ・鍵を漏らさない）', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('err', { status: 500 })));
    const r = getEmailProvider(env);
    if (!r.ok) throw new Error('provider should be ok');
    await expect(sendInquiryEmail(env, r.provider, inquiry)).rejects.toThrow(/500/);
  });
});
