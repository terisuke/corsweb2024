---
title: "Complete Blog System Implementation in Astro 4.8 - A Comprehensive Approach Including AI Translation and E2E Testing"
description: "Record of implementing a high-performance blog system based on Astro Content Collections. This explanation covers the comprehensive development process, including AI automatic translation using the Google Gemini API, Playwright E2E testing, and rate limiting features."
pubDate: 2025-06-22
category: "engineering"
tags: ["Astro", "ブログシステム", "AI翻訳", "E2Eテスト", "TypeScript", "Google Gemini API", "Playwright", "レート制限"]
author: "Terisuke"
lang: "en"
featured: true
---
## Overview

In a recent development, we've implemented a comprehensive blog system based on Astro 4.8.7. This system goes beyond simple Markdown display, offering a modern technical blog platform with features like AI auto-translation, end-to-end testing, and functionalities geared towards full-scale operation.

## Technical Stack

### Core Technologies
- **Astro 4.8.7**: High-speed SSG with Island Architecture
- **TypeScript**: Type-safe development environment
- **Tailwind CSS**: Utility-first styling
- **Alpine.js 3.14.0**: Lightweight frontend JavaScript

### Blog-Specific Features
- **Content Collections**: Astro's type-safe content management
- **Google Gemini API**: AI auto-translation engine
- **Playwright**: E2E test automation
- **remark-link-card-plus**: Rich link card generation

## Core Implementation Architecture

### 1. Content Collections Design

We adopted Astro's `Content Collections` over traditional Markdown file management:

```typescript
// src/content/config.ts
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum(['ai', 'engineering', 'founder', 'lab']),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['ja', 'en']).default('ja'),
    featured: z.boolean().default(false),
  }),
});
```

**Advantages**:
- Prevents metadata errors through build-time type validation
- Real-time updates with Hot reloading
- Automatic schema validation

### 2. AI Translation System Design

We built an auto-translation system utilizing the Google Gemini API:

```javascript
// scripts/translate-blog.js
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite-preview-06-17" 
});

async function translateBlogPost(japaneseContent) {
  const prompt = `Translate the following Japanese blog post to English. 
  Translate technical terms appropriately and make it readable English:

${japaneseContent}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
```

**Features**:
- **Rate Limiting**: Conservative limit of 15 requests per minute
- **Error Handling**: Retry functionality with exponential backoff
- **YAML Safety**: Proper escaping for frontmatter

### 3. Rate Limiting System

Rate limiting features for stable API operations:

```javascript
// scripts/rate-limiter.js
class RateLimiter {
  constructor({ requestsPerMinute = 15, maxRetries = 3 }) {
    this.requestsPerMinute = requestsPerMinute;
    this.maxRetries = maxRetries;
    this.requestTimes = [];
  }

  async executeWithRetry(operation, description) {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        await this.checkRateLimit();
        return await operation();
      } catch (error) {
        if (attempt === this.maxRetries) throw error;
        await this.backoff(attempt);
      }
    }
  }
}
```

### 4. E2E Test Implementation

Comprehensive testing of blog functionalities using Playwright:

```typescript
// e2e/blog.spec.ts
test.describe('Blog functionality', () => {
  test('should navigate to Japanese blog', async ({ page }) => {
    await page.goto('/blog/');
    await expect(page.locator('h1')).toContainText('技術ブログ');
  });

  test('should display OGP image for blog posts', async ({ page }) => {
    await page.goto('/blog/');
    const firstPost = page.locator('[data-testid="blog-post"]').first();
    await firstPost.click();
    
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /\/og\/.*\.svg/);
  });
});
```

## Performance Optimization

### Compression and Optimization Settings

```javascript
// astro.config.mjs
integrations: [
  compress({
    CSS: true,
    HTML: {
      'remove-comments': true,
      'minify-js': true,
      'minify-css': true
    },
    JavaScript: true,
    SVG: true
  }),
  compressor({
    gzip: true,
    brotli: true
  })
]
```

### Image Optimization
- Image delivery in AVIF format
- WebP fallback
- Responsive image sizes (480w, 800w)

## Challenges and Solutions

### 1. YAML Frontmatter Escaping Issue

**Challenge**: YAML parse errors when translated titles or descriptions contain special characters.

**Solution**:
```javascript
function escapeYAMLString(str) {
  return str
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/"/g, '\\"');   // Escape double quotes
}
```

### 2. API Rate Limit Handling

**Challenge**: Request failures due to Gemini API limitations.

**Solution**: Exponential backoff and intelligent rate limiting
- 1-second base delay
- Gradual delays up to 60 seconds
- Proactive limiting by tracking request times

### 3. E2E Test Stability

**Challenge**: Test instability due to dynamic content.

**Solution**: Reliable element identification using `data-testid` attributes.

## Operational Flow

### New Article Posting Process

1. **Create Japanese Article**: Create a Markdown file in `/src/content/blog/ja/`
2. **AI Translation**: `npm run translate src/content/blog/ja/article-name.md`
3. **Run Tests**: `npm run test:e2e`
4. **Build**: `npm run build`
5. **Deploy**: Automatic deployment to Firebase Hosting

### Quality Assurance

- **Type Checking**: Compile-time checks with TypeScript
- **Schema Validation**: Content validation with Zod
- **E2E Tests**: Functional testing with Playwright

## Lessons Learned

### 1. The Power of Content Collections

Compared to traditional file-based management, type safety and developer experience have dramatically improved. In particular, the clear impact scope during schema changes enables safer refactoring.

### 2. Practicality of AI Translation

The translation quality from Google Gemini API is exceptionally high for technical articles, minimizing the need for manual fine-tuning. However, consistency in specialized terminology requires ongoing improvement.

### 3. Importance of E2E Testing

We've realized that for complex functionalities like routing and metadata generation, even in static site generators, E2E testing is indispensable.

## Performance Results

- **First Contentful Paint**: 0.8 seconds
- **Largest Contentful Paint**: 1.2 seconds
- **Cumulative Layout Shift**: 0.05
- **Total Bundle Size**: 45KB (after gzip compression)

## Conclusion

Through the implementation of this blog system, we've confirmed the importance of the following in a modern JAMstack architecture:

1. **Type Safety**: Preventing design-time errors with Content Collections
2. **Automation**: Improving operational efficiency with AI translation and E2E tests
3. **Performance**: Speed improvements through proactive optimization
4. **Maintainability**: Sustainable development through a clear architecture

As a technical blog platform, we've achieved complete automation from article writing to publication, creating an environment where developers can focus on essential content creation.