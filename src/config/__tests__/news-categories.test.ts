import { describe, expect, it } from 'vitest';
import { getNewsCategoryConfig, getNewsCategoryIds, getNewsCategoryLabel } from '../news-categories';

describe('news categories', () => {
  it('keeps press as a CMS-compatible category with localized labels', () => {
    expect(getNewsCategoryIds()).toContain('press');
    expect(getNewsCategoryConfig('press')?.label.ja).toBe('プレスリリース');
    expect(getNewsCategoryLabel('press', 'en')).toBe('Press release');
  });
});
