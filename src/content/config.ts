import { z, defineCollection } from 'astro:content';
import { getCategoryIds } from '../config/categories';
import { getNewsCategoryIds } from '../config/news-categories';

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Terisuke'),
    category: z.enum(getCategoryIds() as [string, ...string[]]),
    tags: z.array(z.string()).default([]),
    image: z.object({
      url: z.string(),
      alt: z.string()
    }).optional(),
    ogImage: z.string().optional(),
    isDraft: z.boolean().default(false),
    featured: z.boolean().default(false),
    lang: z.enum(['ja', 'en', 'zh', 'ko', 'es']).default('ja'),
    readingTime: z.number().optional(),
  }),
});

// 実績記事（ケーススタディ）コレクション。/works のカードから個別記事へリンクするための構造化記事。
// 本文（problem / approach / implementation / result）は markdown body に `## 課題` `## アプローチ`
// `## 実装` `## 成果` の見出しで執筆する（terisuke が自然に書けるように）。
// ファイルは blog と同じく `cases/{ja,en,zh,ko,es}/<slug>.md` に言語別ディレクトリで配置する
// （slug が `<lang>/<slug>` になるため、ルート側で lang フィルタ + 接頭辞の除去が必要）。
const caseCategories = [
  'grift',
  'confidential-ai',
  'local-llm',
  'ai-contract',
  'tech-culture',
] as const;

const casesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // CTA の出し分けを駆動するカテゴリ（step 3 参照）。
    category: z.enum(caseCategories),
    tags: z.array(z.string()).default([]),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    heroImage: z
      .object({
        url: z.string(),
        alt: z.string(),
      })
      .optional(),
    ogImage: z.string().optional(),
    // 1〜2行のリード文。hero に表示。
    summary: z.string(),
    // NDA案件用の注記。設定時は callout box に表示。
    securityNote: z.string().optional(),
    // CTA の種類。省略時は category にフォールバック（step 3）。
    ctaType: z.enum(caseCategories).optional(),
    relatedSlugs: z.array(z.string()).optional(),
    isDraft: z.boolean().default(false),
    featured: z.boolean().default(false),
    // 記事の言語。ディレクトリ名（cases/<lang>/）と一致させる。既定は ja。
    lang: z.enum(['ja', 'en', 'zh', 'ko', 'es']).default('ja'),
  }),
});

// ニュースコレクション。cases と同じく `news/{ja,en,zh,ko,es}/<slug>.md` に言語別配置する。
const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().default('Terisuke'),
    category: z.enum(getNewsCategoryIds() as [string, ...string[]]),
    tags: z.array(z.string()).default([]),
    externalUrl: z.string().url().optional(),
    source: z.string().optional(),
    ogImage: z.string().optional(),
    isDraft: z.boolean().default(false),
    featured: z.boolean().default(false),
    lang: z.enum(['ja', 'en', 'zh', 'ko', 'es']).default('ja'),
  }),
});

export const collections = {
  blog: blogCollection,
  cases: casesCollection,
  news: newsCollection,
};
