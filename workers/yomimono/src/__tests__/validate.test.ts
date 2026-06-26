import { describe, it, expect } from 'vitest';
import {
  assertSlug,
  normalizeArticle,
  normalizeCategory,
  safeImageName,
  sanitizeText,
  SLUG_RE,
} from '../validate';

describe('assertSlug — パストラバーサル防止（CRITICAL修正の要）', () => {
  // バグ（slug未検証）が存在すれば、これらは throw せず素通りしてしまう。
  const traversal = [
    '../../../.github/workflows/deploy',
    '../../package',
    'foo/bar',
    'foo.md',
    'a/../b',
    '..',
    '.',
    'UPPER',
    'with space',
    'ab', // 短すぎ(3未満)
    'a'.repeat(81), // 長すぎ(80超)
    'タイトル', // 非ASCII
  ];
  it.each(traversal)('不正な slug を拒否する: %s', (slug) => {
    expect(() => assertSlug(slug)).toThrow();
    expect(SLUG_RE.test(slug)).toBe(false);
  });

  const valid = ['ai-driven-development', 'sme-ai-2026', 'abc', 'a-1-b-2'];
  it.each(valid)('正当な slug を通す: %s', (slug) => {
    expect(() => assertSlug(slug)).not.toThrow();
  });
});

describe('normalizeCategory', () => {
  it('既知カテゴリはそのまま', () => {
    expect(normalizeCategory('engineering')).toBe('engineering');
    expect(normalizeCategory('lab')).toBe('lab');
  });
  it('未知カテゴリは ai にフォールバック', () => {
    expect(normalizeCategory('malicious')).toBe('ai');
    expect(normalizeCategory(undefined)).toBe('ai');
  });
});

describe('normalizeArticle — publish/validate 共通の検証・正規化', () => {
  const base = {
    slug: 'valid-slug-123',
    title: 'タイトル',
    description: '説明',
    category: 'engineering',
    tags: ['a', 'b'],
    body: '## 本文\n\n内容',
  };

  it('正当な記事を ok:true で正規化する', () => {
    const r = normalizeArticle(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.article.slug).toBe('valid-slug-123');
      expect(r.article.category).toBe('engineering');
    }
  });

  it.each([
    ['slug欠落', { ...base, slug: undefined }],
    ['title欠落', { ...base, title: undefined }],
    ['description欠落', { ...base, description: undefined }],
    ['body欠落', { ...base, body: undefined }],
    ['undefined', undefined],
  ])('必須欠落(%s)は ok:false / 400', (_n, input) => {
    const r = normalizeArticle(input as never);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it.each(['../../../etc/passwd', 'foo/bar', 'UP', 'a'.repeat(81)])(
    'パストラバーサル/不正slug(%s)は 400 で拒否',
    (slug) => {
      const r = normalizeArticle({ ...base, slug });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.status).toBe(400);
    },
  );

  it('未知カテゴリは ai にフォールバック、tagsは10件・各50字に制限', () => {
    const r = normalizeArticle({
      ...base,
      category: 'evil',
      tags: Array.from({ length: 20 }, (_, i) => 'tag' + i),
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.article.category).toBe('ai');
      expect(r.article.tags.length).toBe(10);
    }
  });

  it('body は100k字で打ち切る（markdown構造は保持＝制御文字以外そのまま）', () => {
    const r = normalizeArticle({ ...base, body: 'x'.repeat(200_000) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.article.body.length).toBe(100_000);
  });

  it('サニタイズ後に title が空なら 400', () => {
    const r = normalizeArticle({ ...base, title: '```' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });
});

describe('safeImageName — 画像名のパストラバーサル/拡張子偽装防止', () => {
  it('パストラバーサルを安全名に潰す（スラッシュ・ドット除去）', () => {
    const n = safeImageName('../../../etc/passwd.png');
    expect(n).not.toMatch(/[/\\]/);
    expect(n).not.toContain('..');
    expect(n.endsWith('.png')).toBe(true);
  });
  it('スペース・大文字を正規化する', () => {
    expect(safeImageName('My Photo.PNG')).toBe('my-photo.png');
  });
  it.each(['photo.svg', 'evil.html', 'noext', 'script.js', ''])(
    '非対応拡張子(%s)は拒否',
    (name) => {
      expect(() => safeImageName(name)).toThrow();
    },
  );
  it.each(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'])('対応拡張子(%s)を通す', (ext) => {
    expect(safeImageName('pic.' + ext)).toBe('pic.' + ext);
  });
});

describe('sanitizeText — プロンプト注入対策', () => {
  it('コードフェンスを除去する', () => {
    expect(sanitizeText('hello ```ignore previous``` world', 100)).not.toContain('```');
  });
  it('制御文字を空白化する', () => {
    // 入力にNUL(\x00)・単位区切り(\x1f)を含めても、出力に制御文字が残らないこと
    const out = sanitizeText('a\x00b\x1fc', 100);
    expect(out).toBe('a b c');
    expect(/[\x00-\x1f]/.test(out)).toBe(false);
  });
  it('長さを上限で切る', () => {
    expect(sanitizeText('x'.repeat(500), 200)).toHaveLength(200);
  });
});
