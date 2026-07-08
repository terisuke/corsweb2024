import { describe, expect, it } from 'vitest';
import { normalizeArticle } from '../validate';

describe('normalizeArticle — 既存記事編集の下書き状態', () => {
  const base = {
    slug: 'valid-slug-123',
    title: 'タイトル',
    description: '説明',
    category: 'engineering',
    tags: ['a', 'b'],
    body: '## 本文\n\n内容',
  };

  it('isDraft は true のときだけ true に正規化する', () => {
    const draft = normalizeArticle({ ...base, isDraft: true });
    expect(draft.ok).toBe(true);
    if (draft.ok) expect(draft.article.isDraft).toBe(true);

    const published = normalizeArticle({ ...base, isDraft: false });
    expect(published.ok).toBe(true);
    if (published.ok) expect(published.article.isDraft).toBe(false);

    const omitted = normalizeArticle(base);
    expect(omitted.ok).toBe(true);
    if (omitted.ok) expect(omitted.article.isDraft).toBe(false);
  });
});
