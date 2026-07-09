import { describe, it, expect } from 'vitest';
import {
  assertSlug,
  normalizeArticle,
  normalizeCategory,
  normalizeCollection,
  safeImageName,
  sanitizeText,
  isHttpUrl,
  isValidCalendarDate,
  SLUG_RE,
  DATE_RE,
  VALID_CATEGORIES,
  NEWS_CATEGORIES,
  CASES_CATEGORIES,
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

describe('normalizeCategory — collection 別の category enum 検証', () => {
  it.each(NEWS_CATEGORIES)('news の正当カテゴリ(%s)はそのまま返す', (c) => {
    expect(normalizeCategory(c, 'news')).toBe(c);
  });
  it.each(CASES_CATEGORIES)('cases の正当カテゴリ(%s)はそのまま返す', (c) => {
    expect(normalizeCategory(c, 'cases')).toBe(c);
  });
  it('news: 未知カテゴリは info にフォールバック（blog の ai ではない＝反証可能）', () => {
    expect(normalizeCategory('malicious', 'news')).toBe('info');
    expect(normalizeCategory(undefined, 'news')).toBe('info');
    // blog の正当値 ai は news では不正 → info へ
    expect(normalizeCategory('ai', 'news')).toBe('info');
  });
  it('cases: 未知カテゴリは grift にフォールバック（blog の ai ではない＝反証可能）', () => {
    expect(normalizeCategory('malicious', 'cases')).toBe('grift');
    expect(normalizeCategory(undefined, 'cases')).toBe('grift');
    expect(normalizeCategory('ai', 'cases')).toBe('grift');
    expect(normalizeCategory('engineering', 'cases')).toBe('grift');
  });
  it('blog/cases/news の enum は互いに素（回帰防止）', () => {
    const blog = new Set<string>(VALID_CATEGORIES);
    const news = new Set<string>(NEWS_CATEGORIES);
    const cases = new Set<string>(CASES_CATEGORIES);
    for (const c of news) expect(blog.has(c)).toBe(false);
    for (const c of cases) expect(blog.has(c)).toBe(false);
    for (const c of cases) expect(news.has(c)).toBe(false);
  });
});

describe('normalizeCollection — collection 値の安全な正規化', () => {
  it.each(['news', 'cases', 'blog'] as const)('正当な collection(%s)はそのまま', (c) => {
    expect(normalizeCollection(c)).toBe(c);
  });
  it.each([undefined, null, '', 'malicious', 'NEWS', 'blog;', {}, 1])(
    '不正・未知の collection(%s)は blog にフォールバック',
    (raw) => {
      expect(normalizeCollection(raw)).toBe('blog');
    },
  );
});

describe('DATE_RE / publishedAt — 日付形式の検証', () => {
  it.each(['2026-07-08', '2026-01-01', '1999-12-31'])('正当な YYYY-MM-DD(%s)を受理', (d) => {
    expect(DATE_RE.test(d)).toBe(true);
  });
  it.each(['2026-7-8', '2026/07/08', '2026-07-08T00:00:00', 'not-a-date', ''])(
    '不正な日付形式(%s)を拒否（DATE_RE は書式のみ・暦の妥当性は見ない）',
    (d) => {
      expect(DATE_RE.test(d)).toBe(false);
    },
  );
  it('normalizeArticle: 不正な publishedAt は undefined に正規化（反証可能）', () => {
    const r = normalizeArticle({
      slug: 'valid-slug',
      title: 'タイトル',
      description: '説明',
      body: '本文',
      publishedAt: '2026/07/08',
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.article.publishedAt).toBeUndefined();
  });
  it('normalizeArticle: 正当な publishedAt は保持', () => {
    const r = normalizeArticle({
      slug: 'valid-slug',
      title: 'タイトル',
      description: '説明',
      body: '本文',
      publishedAt: '2026-07-08',
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.article.publishedAt).toBe('2026-07-08');
  });
});

describe('isValidCalendarDate — 暦日付の厳密検証（P3: DATE_RE 通過後のロールオーバー拒否）', () => {
  it.each(['2026-07-08', '2026-01-01', '2024-02-29', '2000-02-29'])(
    '正当な実在日付(%s)は true',
    (d) => {
      expect(isValidCalendarDate(d)).toBe(true);
    },
  );
  // DATE_RE は書式のみ検証するため、2026-99-99 は書式は通るが Date で NaN になる。
  it('2026-99-99 は DATE_RE を通るが Date で NaN → 拒否（反証可能: isValidCalendarDate 未導入なら受理してしまう）', () => {
    expect(DATE_RE.test('2026-99-99')).toBe(true);
    expect(isValidCalendarDate('2026-99-99')).toBe(false);
  });
  it.each(['2026-02-30', '2026-04-31', '2026-13-01', '2026-00-10', '2026-12-32', '2025-02-29'])(
    'ロールオーバー日付(%s)は拒否（実在しない暦日）',
    (d) => {
      expect(isValidCalendarDate(d)).toBe(false);
    },
  );
  it.each(['2026-7-8', '2026/07/08', 'not-a-date', ''])('書式不正(%s)は拒否', (d) => {
    expect(isValidCalendarDate(d)).toBe(false);
  });
});

describe('normalizeArticle — publishedAt 暦日付検証の反映（P3・反証可能）', () => {
  const base = {
    slug: 'valid-slug',
    title: 'タイトル',
    description: '説明',
    body: '本文',
  };
  it.each(['2026-99-99', '2026-02-30', '2026-04-31', '2026-13-01'])(
    '実在しない暦日付(%s)は undefined に正規化（反証可能: isValidCalendarDate未導入なら保持してしまう）',
    (d) => {
      const r = normalizeArticle({ ...base, publishedAt: d });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.article.publishedAt).toBeUndefined();
    },
  );
  it.each(['2026-07-08', '2024-02-29'])('実在日付(%s)は保持', (d) => {
    const r = normalizeArticle({ ...base, publishedAt: d });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.article.publishedAt).toBe(d);
  });
});

describe('normalizeArticle — news collection', () => {
  const newsBase = {
    slug: 'news-slug',
    title: 'ニュースタイトル',
    description: 'ニュース説明',
    category: 'info',
    tags: ['tag'],
    body: '## 本文',
    collection: 'news' as const,
  };

  it('news: externalUrl あり は body 不要で ok', () => {
    const r = normalizeArticle(
      { ...newsBase, body: undefined, externalUrl: 'https://example.com/article' },
      'news',
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.article.collection).toBe('news');
      expect(r.article.category).toBe('info');
      expect(r.article.externalUrl).toBe('https://example.com/article');
    }
  });

  it('news: externalUrl なし は body 必須（反証可能: body 不要化バグなら失敗）', () => {
    const r = normalizeArticle({ ...newsBase, body: undefined }, 'news');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.status).toBe(400);
      expect(r.error).toContain('body');
    }
  });

  it('news: externalUrl なし + body あり は ok', () => {
    const r = normalizeArticle({ ...newsBase }, 'news');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.article.body).toBe('## 本文');
  });

  it('news: source / featured / publishedAt / isDraft を正規化する', () => {
    const r = normalizeArticle(
      {
        ...newsBase,
        source: '```Example Media```',
        featured: true,
        publishedAt: '2026-07-08',
        isDraft: true,
      },
      'news',
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.article.source).toBe('Example Media');
      expect(r.article.featured).toBe(true);
      expect(r.article.publishedAt).toBe('2026-07-08');
      expect(r.article.isDraft).toBe(true);
    }
  });

  it('news: カテゴリ info/media/update/event/award のみ受理・それ以外は info へ', () => {
    const r = normalizeArticle({ ...newsBase, category: 'media' }, 'news');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.article.category).toBe('media');

    const fallback = normalizeArticle({ ...newsBase, category: 'evil' }, 'news');
    expect(fallback.ok).toBe(true);
    if (fallback.ok) expect(fallback.article.category).toBe('info');
  });

  it('news: slug/title/description 欠落は 400', () => {
    const r = normalizeArticle({ ...newsBase, slug: undefined }, 'news');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });
});

describe('isHttpUrl — http(s) URL のみ受理', () => {
  it.each([
    'https://example.com',
    'http://example.com/article',
    'HTTPS://COR-JP.COM/',
    'https://blog.cor-jp.com/posts/foo',
  ])('正当な http(s) URL(%s)は true', (u) => {
    expect(isHttpUrl(u)).toBe(true);
  });
  it.each([
    'not-a-url',
    '',
    'javascript:alert(1)',
    'data:text/html,<script>',
    'ftp://example.com',
    '//example.com',
    'mailto:foo@example.com',
  ])('不正URL(%s)は false', (u) => {
    expect(isHttpUrl(u)).toBe(false);
  });
});

describe('normalizeArticle — news externalUrl 検証（P2・反証可能）', () => {
  const newsBase = {
    slug: 'news-slug',
    title: 'ニュースタイトル',
    description: 'ニュース説明',
    category: 'info',
    tags: ['tag'],
    body: '## 本文',
  };

  it.each(['', '   ', 'not-a-url', 'javascript:alert(1)', 'ftp://example.com'])(
    '不正URL(%s)は externalUrl 無し扱い → body 必須（反証可能: 検証未導入なら body 無しで受理してしまう）',
    (badUrl) => {
      const r = normalizeArticle(
        { ...newsBase, body: undefined, externalUrl: badUrl },
        'news',
      );
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.status).toBe(400);
        expect(r.error).toContain('body');
      }
    },
  );

  it.each([
    'https://example.com/article',
    'http://example.com',
    'https://cor-jp.com/news/foo',
  ])('有効 http(s) URL(%s)は body 不要で受理', (goodUrl) => {
    const r = normalizeArticle(
      { ...newsBase, body: undefined, externalUrl: goodUrl },
      'news',
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.article.externalUrl).toBe(goodUrl);
  });

  it('不正URL + body あり は受理（externalUrl は undefined に正規化）', () => {
    const r = normalizeArticle(
      { ...newsBase, externalUrl: 'not-a-url' },
      'news',
    );
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.article.externalUrl).toBeUndefined();
  });

  it('sanitize（```除去）後も有効 http(s) URL なら body 不要で受理・コードフェンスは除去', () => {
    // sanitizeText は ``` を除去するので、``https://...`` のような入力が URL として生き残るか確認
    const r = normalizeArticle(
      { ...newsBase, body: undefined, externalUrl: '```https://example.com```' },
      'news',
    );
    // sanitize 後は "https://example.com" になるため有効 URL として受理するはず
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.article.externalUrl).toBe('https://example.com');
  });

  it('sanitize → http(s) 検証の順序: sanitize で空になったら body 必須（反証可能）', () => {
    // externalUrl がコードフェンスのみで構成される場合、sanitize 後に空になる → body 必須
    const r = normalizeArticle(
      { ...newsBase, body: undefined, externalUrl: '``````' },
      'news',
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('body');
  });
});

describe('normalizeArticle — cases collection', () => {
  const casesBase = {
    slug: 'cases-slug',
    title: 'ケースタイトル',
    description: 'ケース説明',
    category: 'grift',
    tags: ['tag'],
    body: '## 本文',
    summary: 'ケース要約',
    collection: 'cases' as const,
  };

  it('cases: summary あり は ok（反証可能: summary 必須を誤って削除すると失敗）', () => {
    const r = normalizeArticle({ ...casesBase }, 'cases');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.article.collection).toBe('cases');
      expect(r.article.category).toBe('grift');
      expect(r.article.summary).toBe('ケース要約');
    }
  });

  it('cases: summary 欠落は 400（反証可能）', () => {
    const r = normalizeArticle({ ...casesBase, summary: undefined }, 'cases');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.status).toBe(400);
      expect(r.error).toContain('summary');
    }
  });

  it('cases: カテゴリ grift/confidential-ai/local-llm/ai-contract/tech-culture のみ・それ以外は grift', () => {
    const r = normalizeArticle({ ...casesBase, category: 'local-llm' }, 'cases');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.article.category).toBe('local-llm');

    const fallback = normalizeArticle({ ...casesBase, category: 'ai' }, 'cases');
    expect(fallback.ok).toBe(true);
    if (fallback.ok) expect(fallback.article.category).toBe('grift');
  });

  it('cases: body 欠落は 400（news と違い externalUrl でも免除されない）', () => {
    const r = normalizeArticle(
      { ...casesBase, body: undefined, externalUrl: 'https://example.com' },
      'cases',
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('body');
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

describe('normalizeArticle — isDraft パススルー（非エンジニア向けUI改善・反証可能）', () => {
  const base = {
    slug: 'draft-test',
    title: '下書きテスト',
    description: '説明',
    body: '本文',
  };
  it('isDraft 省略時は false（従来の公開挙動は不変）', () => {
    const r = normalizeArticle(base);
    if (!r.ok) throw new Error('正規化失敗');
    expect(r.article.isDraft).toBe(false);
  });
  it('isDraft: true を通す（「下書きとして保存」で反映される）', () => {
    const r = normalizeArticle({ ...base, isDraft: true });
    if (!r.ok) throw new Error('正規化失敗');
    expect(r.article.isDraft).toBe(true);
  });
  it('isDraft に非真値は false に正規化（文字列 "true"・1 等を拒否）', () => {
    for (const v of ['true', 1, 'yes', {}, []]) {
      const r = normalizeArticle({ ...base, isDraft: v as unknown as boolean });
      if (!r.ok) throw new Error('正規化失敗');
      expect(r.article.isDraft).toBe(false);
    }
  });
  it('cases でも isDraft を通す', () => {
    const r = normalizeArticle(
      { ...base, summary: 'リード', isDraft: true },
      'cases',
    );
    if (!r.ok) throw new Error('正規化失敗');
    expect(r.article.isDraft).toBe(true);
  });
});

describe('normalizeArticle — blog pubDate', () => {
  const base = {
    slug: 'blog-slug',
    title: 'ブログ',
    description: '説明',
    category: 'ai',
    tags: [],
    body: '本文',
  };

  it('blog: pubDate は実在日付だけ正規化する', () => {
    const r = normalizeArticle({ ...base, pubDate: '2026-07-08' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.article.pubDate).toBe('2026-07-08');

    const invalid = normalizeArticle({ ...base, pubDate: '2026-02-30' });
    expect(invalid.ok).toBe(true);
    if (invalid.ok) expect(invalid.article.pubDate).toBeUndefined();
  });
});
