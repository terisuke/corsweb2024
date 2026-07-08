import type { Locale } from './i18n';
import { BLOG_CATEGORIES } from '../config/categories';

// カテゴリ別のSEOキーワード。BlogLayout から抽出（挙動維持）。
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  ai: ['AI', '人工知能', 'Artificial Intelligence', 'Machine Learning', 'Deep Learning'],
  engineering: ['エンジニアリング', 'Engineering', 'Software Development', '開発', 'プログラミング'],
  founder: ['起業', 'Startup', 'Entrepreneur', 'Business', 'スタートアップ'],
  lab: ['技術', 'Technology', 'Innovation', '革新', 'Research'],
};

// タグ + カテゴリ由来 + 共通キーワードから meta keywords 文字列を生成する（最大15語）。
export function generateKeywords(
  tags: string[],
  category: string,
  currentLocale: Locale
): string {
  const baseKeywords = tags.slice();

  const categoryConfig = BLOG_CATEGORIES.find(cat => cat.id === category);
  if (categoryConfig) {
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords) {
      baseKeywords.push(...keywords);
    }
  }

  baseKeywords.push(
    ...(currentLocale === 'ja'
      ? ['技術ブログ', 'テックブログ', 'エンジニア', '開発者', 'プログラマー', 'IT', 'Cor.inc']
      : ['tech blog', 'technology', 'developer', 'programming', 'software', 'engineering', 'Cor.inc'])
  );

  return baseKeywords.flat().slice(0, 15).join(', ');
}

// description の語数からの簡易読了時間（分）。BlogLayout から抽出（挙動維持）。
export function estimateReadingTime(description: string): number {
  return Math.max(1, Math.ceil(description.split(/\s+/).length / 50));
}

// JSON-LD を <script type="application/ld+json"> に set:html で埋め込む際の安全なシリアライズ。
// frontmatter (title/description/tags/author 等) に "</script><script>..." のような文字列が
// 含まれていても、</script> によるタグの早期終了を防ぐ。< は JSON文字列として正当な
// エスケープなので、JSON-LD を読むパーサー側では通常通り "<" として解釈される。
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
