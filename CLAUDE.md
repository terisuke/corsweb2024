# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a high-performance corporate website for Cor.inc built with Astro 4.8.7, focusing on extreme loading speed optimization. The site features bilingual (Japanese/English) content and showcases services in Python data analysis, web/mobile development, and machine learning solutions. The project includes an integrated blog system with AI-powered automated translation capabilities.

## Development Commands
```bash
npm run dev      # Start development server on localhost:4321
npm run build    # Type check and build for production
npm run preview  # Preview production build locally
```

## Architecture & Key Patterns

### Tech Stack
- **Framework**: Astro 4.8.7 with Islands Architecture (selective hydration)
- **Interactivity**: Alpine.js 3.14.0 loaded from CDN
- **Styling**: Tailwind CSS with stone color palette as primary, @tailwindcss/typography for blog content
- **TypeScript**: Custom Alpine.js type definitions in `/types/types.d.ts`
- **AI Translation**: Google Generative AI (Gemini 1.5 Flash) for automated blog translation
- **Content Management**: Astro Content Collections with Zod schema validation

### Component Structure
Components are organized by feature under `/src/components/`:
- `home/`, `about/`, `contact/`, `products/` - Page-specific components
- `layout/` - Shared Header and Footer components
- `blog/` - Blog-specific components (CategoryBadge, PostCard, ShareButtons, TableOfContents, TagList, TipButton)
- `performance/` - WebVitals monitoring component

Pages use a consistent pattern:
1. Import Layout.astro wrapper
2. Import page-specific components
3. Use Alpine.js for interactivity via x-data directives

### Performance Optimizations
- All images use AVIF format with WebP fallbacks
- Multiple responsive image sizes (e.g., hero-480w.avif, hero-800w.avif)
- Aggressive compression via astro-compress and astro-compressor plugins
- Firebase hosting with 1-year cache headers for assets
- View Transitions API enabled for smooth navigation
- Web Vitals monitoring and performance tracking
- Critical CSS inlining for above-the-fold content
- Font optimization with font-display: optional

### Alpine.js Integration
Alpine.js is loaded from CDN with custom TypeScript support:
```typescript
// Global stores accessible via Alpine.store()
Alpine.store('theme', { isDark: boolean, toggle: function })
Alpine.store('lang', { current: string, toggle: function })
// Components use x-data for local state
// Dark mode and language toggle integrated in Header component
```

## Blog System

### Overview
Comprehensive blog functionality with AI-powered translation, featuring:
- **Content Collections**: Astro's built-in content management using Zod schemas
- **Bilingual Support**: Japanese and English blog posts with separate routing
- **AI Translation**: Automated translation from Japanese to English using Google Gemini API
- **Rich Markdown**: GitHub Flavored Markdown, math equations (KaTeX), syntax highlighting, link cards
- **SEO Optimization**: Auto-generated OGP images, structured data, meta tags, breadcrumbs
- **Interactive Features**: Category filtering, related posts, table of contents, share buttons
- **Monetization**: Stripe-powered tip/support functionality
- **Performance**: Optimized with same caching strategies as main site

### Content Structure
```
src/content/
├── blog/
│   ├── ja/          # Japanese blog posts (source)
│   │   ├── post-1.md
│   │   └── post-2.md
│   └── en/          # English blog posts (auto-translated)
│       ├── post-1.md
│       └── post-2.md
├── config.ts        # Content collection schemas
└── content_backup/  # Backup of old content (can be removed)
```

### Blog Schema (Zod)
```typescript
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Terisuke'),
    category: z.enum([
      'ai-driven-futures',
      'high-performance-engineering', 
      'founders-journey',
      'tech-lab-creativity'
    ]),
    tags: z.array(z.string()).default([]),
    image: z.object({
      url: z.string(),
      alt: z.string()
    }).optional(),
    ogImage: z.string().optional(),
    isDraft: z.boolean().default(false),
    featured: z.boolean().default(false),
    lang: z.enum(['ja', 'en']).default('ja'),
    readingTime: z.number().optional(),
  }),
});
```

### AI Translation System

#### Translation Scripts
Two Node.js scripts handle automated translation:

**1. Individual Post Translation** (`scripts/translate-blog.js`)
```bash
node scripts/translate-blog.js src/content/blog/ja/your-post.md
```
- Translates a single Japanese blog post to English
- Uses Google Generative AI (Gemini 1.5 Flash) with GEMINI_API_KEY
- Preserves frontmatter structure and metadata
- Handles YAML parsing/formatting with proper escaping
- Updates language metadata (lang: 'en', author: 'Terisuke')
- Outputs to `/src/content/blog/en/` with same filename

**2. Batch Translation** (`scripts/translate-all-blog.js`)
```bash
node scripts/translate-all-blog.js
```
- Automatically translates all Japanese posts in `/src/content/blog/ja/`
- Includes rate limiting (1-second delay between requests)
- Provides progress reporting and error handling
- Creates English directory structure if needed

#### Translation Features
- **Smart Parsing**: Robust frontmatter parsing that handles complex YAML structures
- **Content Preservation**: Maintains markdown formatting, code blocks, and special syntax
- **Metadata Translation**: Translates title and description while preserving other metadata
- **YAML Safety**: Proper escaping and quoting for YAML compatibility
- **Error Handling**: Comprehensive error reporting and recovery
- **Rate Limiting**: Built-in delays to respect API rate limits

#### Environment Setup
Create `.env` file in project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Blog Routing & Pages

#### Japanese Blog
- **List Page**: `/blog/` → `src/pages/blog/[...page].astro`
- **Post Page**: `/blog/[slug]` → `src/pages/blog/[...slug].astro`
- **Category Pages**: `/blog/category/[category]/` → `src/pages/blog/category/[category]/[...page].astro`

#### English Blog
- **List Page**: `/en/blog/` → `src/pages/en/blog/[...page].astro`
- **Post Page**: `/en/blog/[slug]` → `src/pages/en/blog/[...slug].astro`

#### Blog Layout
- **Shared Layout**: `src/layouts/BlogLayout.astro`
  - Enhanced SEO with structured data (Article, BreadcrumbList)
  - Auto-generated OGP images at `/og/[slug].svg`
  - Bilingual hreflang tags
  - KaTeX CSS for math rendering
  - Performance optimizations (critical CSS, Web Vitals)

### Blog Components

- **CategoryBadge.astro**: Displays category with color coding
- **PostCard.astro**: Blog post preview cards for lists
- **ShareButtons.astro**: Social media sharing (Twitter, Facebook, LinkedIn)
- **TableOfContents.astro**: Auto-generated TOC for long posts
- **TagList.astro**: Tag display and filtering
- **TipButton.astro**: Stripe-powered support/tip functionality

### SEO & Performance Features

- **Auto-generated OGP Images**: Dynamic SVG generation at `/og/[slug].svg.ts`
- **Structured Data**: JSON-LD for Article and BreadcrumbList schemas
- **Bilingual SEO**: Proper hreflang tags and canonical URLs
- **Meta Tags**: Comprehensive OpenGraph and Twitter Card support
- **Sitemap**: Auto-generated with @astrojs/sitemap
- **Performance**: Web Vitals tracking, critical CSS, font optimization

### Writing New Blog Posts

1. **Create Japanese Post**: Write markdown file in `/src/content/blog/ja/`
2. **Use Proper Frontmatter**:
   ```yaml
   ---
   title: "Your Post Title"
   description: "Brief description"
   pubDate: 2024-01-01
   category: "ai-driven-futures"
   tags: ["ai", "development"]
   author: "Terisuke"
   lang: "ja"
   ---
   ```
3. **Auto-translate**: Run `node scripts/translate-blog.js src/content/blog/ja/your-post.md`
4. **Review & Publish**: Check both versions before deployment

### Firebase Deployment
The site deploys to Firebase Hosting with specific caching rules defined in `firebase.json`. Production builds are optimized for long-term caching of assets while keeping HTML fresh. Blog OGP images (SVG) are cached with immutable headers.

## Important Notes
- No test framework is configured - verify changes manually
- Always optimize images to AVIF format for consistency
- Maintain bilingual content structure when adding new features
- The goal is to match or exceed the loading speed of Hiroshi Abe's website
- Store GEMINI_API_KEY securely in environment variables for translation features
- Review auto-translated content for accuracy before publishing