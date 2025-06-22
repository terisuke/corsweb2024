import { describe, it, expect } from 'vitest';

// Test utility functions for blog
describe('Blog Utilities', () => {
  describe('calculateReadingTime', () => {
    it('should calculate reading time correctly', () => {
      // Assuming 200 words per minute
      const content = 'word '.repeat(200); // 200 words
      const readingTime = calculateReadingTime(content);
      expect(readingTime).toBe(1);
    });

    it('should handle empty content', () => {
      const readingTime = calculateReadingTime('');
      expect(readingTime).toBe(0);
    });

    it('should round up partial minutes', () => {
      const content = 'word '.repeat(300); // 300 words = 1.5 minutes
      const readingTime = calculateReadingTime(content);
      expect(readingTime).toBe(2);
    });
  });

  describe('formatSlug', () => {
    it('should remove language prefix from slug', () => {
      expect(formatSlug('ja/sample-post', 'ja')).toBe('sample-post');
      expect(formatSlug('en/sample-post', 'en')).toBe('sample-post');
    });

    it('should handle slug without language prefix', () => {
      expect(formatSlug('sample-post', 'ja')).toBe('sample-post');
    });
  });
});

// Helper functions to test
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  return Math.max(readingTime, content.trim() ? 1 : 0);
}

function formatSlug(slug: string, lang: string): string {
  const regex = new RegExp(`^${lang}/`);
  return slug.replace(regex, '');
}