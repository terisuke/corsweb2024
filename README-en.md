# Cor.inc Corporate Website

A corporate website with extreme loading speed optimization. Achieves loading speeds equal to or faster than Hiroshi Abe's homepage. Features an integrated AI-driven blog system with automated Japanese-English translation.

## 🚀 Demo

- Production: <https://corweb.co.jp/>
- Staging: <https://cor-jp.com/>

## 📊 Performance Metrics

- **First Contentful Paint (FCP)**: < 0.5s
- **Largest Contentful Paint (LCP)**: < 1.0s
- **Total Blocking Time (TBT)**: 0ms
- **Cumulative Layout Shift (CLS)**: 0
- **Speed Index**: < 1.0s

## 🏗️ Tech Stack

- **Framework**: Astro 4.8.7 (Islands Architecture)
- **Interactivity**: Alpine.js 3.14.0 (CDN delivery)
- **Styling**: Tailwind CSS + @tailwindcss/typography
- **Hosting**: Firebase Hosting
- **Language**: TypeScript
- **i18n**: Japanese/English support
- **AI Translation**: Google Generative AI (Gemini 1.5 Flash)
- **Content Management**: Astro Content Collections with Zod

## 🤖 New Feature: AI-Driven Blog System

### Automated Translation
- **Japanese → English**: High-quality automated translation using Gemini API
- **Batch Processing**: Support for bulk translation of all articles
- **Metadata Preservation**: Complete preservation of frontmatter and markdown structure

### Blog Features
- **Content Collections**: Type-safe content management
- **SEO Optimization**: Auto-generated OGP images, structured data
- **Rich Markdown**: Math equations (KaTeX), code highlighting, automatic link cards
- **Interactive Features**: Table of contents, share buttons, tip functionality
- **Tip System**: Secure tip functionality via Stripe Payment Link (flexible amount)

### Translation Commands

```bash
# Translate single article
node scripts/translate-blog.js src/content/blog/ja/your-post.md

# Bulk translate all articles
node scripts/translate-all-blog.js

# Environment variable required
# Set GEMINI_API_KEY in .env file
```

## ⚡ Performance Optimization Details

### 1. Image Optimization
- **AVIF Format**: Adopted AVIF format with even higher compression than WebP
- **Responsive Images**: Multiple sizes prepared (e.g., hero-480w.avif, hero-800w.avif)
- **Lazy Loading**: Images outside viewport are lazy loaded
- **Image Compression**: Additional compression with astro-compress (60% average reduction)

### 2. Asset Delivery Optimization
- **CDN Delivery**: Alpine.js delivered from CDN (utilizing browser cache)
- **DNS Prefetch**: Pre-resolve DNS for external resources
  ```html
  <link rel="preconnect" href="https://esm.sh" crossorigin>
  <link rel="dns-prefetch" href="https://ssgform.com">
  ```
- **Long-term Cache**: Static assets cached for 1 year in Firebase configuration

### 3. JavaScript Optimization
- **Islands Architecture**: Astro's partial hydration
- **Deferred Execution**: Alpine.js loaded with defer attribute
- **Inline Initialization**: Dark mode settings execute inline immediately (prevents flicker)
- **Minimal Bundle**: Lightweight implementation with only necessary features

### 4. CSS Optimization
- **Critical CSS**: Essential CSS for initial display is inlined
- **Font Display**: `font-display: optional` prevents font loading from blocking
- **System Fonts**: Initial display uses system fonts, switches after Inter loads
- **Tailwind CSS**: Only used classes extracted at build time

### 5. HTML/Content Optimization
- **HTML Compression**: Remove unnecessary whitespace with astro-compress (10% average reduction)
- **Gzip/Brotli Compression**: All assets compressed with astro-compressor
- **View Transitions API**: Smooth page transitions with prefetching

### 6. Build-time Optimization
- **Static Site Generation**: All pages pre-built
- **TypeScript Type Checking**: Type safety guaranteed at build time
- **Bundle Analysis**: Detect and remove unnecessary code with bundle-analyzer.js

### 7. SEO Optimization
- **Structured Data**: Provide company information with JSON-LD (including company name variations)
- **Meta Tag Optimization**: Open Graph, Twitter Card support
- **Automatic Sitemap Generation**: Search engine optimization with @astrojs/sitemap
- **Multilingual Support**: SEO optimization for both Japanese and English
- **Blog SEO**: Automatic OGP images, hreflang tags, breadcrumb lists

## 🛠️ Development Environment

```bash
# Start development server
npm run dev

# Build (including type checking)
npm run build

# Production preview
npm run preview

# Bundle analysis
node bundle-analyzer.js

# Blog translation
node scripts/translate-blog.js src/content/blog/ja/your-post.md
node scripts/translate-all-blog.js
```

### Environment Variable Configuration

```bash
# Set the following in .env file
GEMINI_API_KEY=your_gemini_api_key_here              # Gemini API key (for blog auto-translation)
PUBLIC_STRIPE_PAYMENT_LINK=your_stripe_payment_link_here  # Stripe Payment Link URL (for tip functionality)
```

## 📁 Project Structure

```
src/
├── components/       # Page and feature-specific components
│   ├── blog/        # Blog-specific components
│   ├── home/        # Homepage components
│   ├── layout/      # Shared layouts
│   └── performance/ # Performance monitoring
├── content/         # Content collections
│   └── blog/
│       ├── ja/      # Japanese blog posts
│       └── en/      # English blog posts (auto-translated)
├── i18n/           # Internationalization files
├── layouts/        # Layout components
├── pages/          # Routing pages
├── utils/          # Utility functions
└── types/          # TypeScript type definitions

scripts/            # Automation scripts
├── translate-blog.js      # Single article translation
└── translate-all-blog.js  # Bulk article translation
```

## 📝 Blog Posting Workflow

1. **Create Japanese Article**: Create Markdown file in `/src/content/blog/ja/`
2. **Utilize Rich Content**: Use link cards, math equations, code highlighting
3. **Run Auto-translation**: Generate English version with `node scripts/translate-blog.js`
4. **Review Content**: Check and adjust translated English article
5. **Deploy**: Auto-deploy to Firebase Hosting

## ✨ Supported Markdown Features

### Basic Syntax
- **GitHub Flavored Markdown**: Tables, strikethrough, task lists
- **Code Highlighting**: 30+ languages supported (Dracula theme)
- **Math Display**: LaTeX notation support via KaTeX

### Rich Link Cards
```markdown
https://cor-jp.com/
https://github.com
```
- **Auto-fetch Metadata**: Automatically fetches title, description, OG images
- **Cache Feature**: Locally saved to `/public/remark-link-card-plus/`
- **Responsive Design**: Supports both desktop and mobile
- **Dark Mode Support**: Automatically follows theme switching

### Advanced Features
- **Automatic Table of Contents**: Auto-generated from heading structure
- **Anchor Links**: Automatically adds link anchors to headings
- **Structured Data**: Auto-generates JSON-LD for SEO
- **OGP Images**: Dynamic SVG image generation per article

## 🎯 Future Improvements

- Service Worker for offline support
- Additional optimization of Resource Hints
- Improved image Lazy Loading strategy
- Enhanced Web Vitals monitoring
- Further improvement of translation accuracy
- Blog management UI/CMS implementation
- Tip history management feature
- Special content for tip supporters

## 📚 References

- [Astro Documentation](https://astro.build/)
- [Alpine.js Documentation](https://alpinejs.dev/)
- [Firebase Hosting](https://firebase.google.com/)
- [Web.dev Performance](https://web.dev/performance/)
- [Google Generative AI](https://ai.google.dev/)
- [Hiroshi Abe's Homepage](http://abehiroshi.la.coocan.jp/)

## 📝 License

MIT License