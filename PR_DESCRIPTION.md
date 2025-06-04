# Performance Optimization for Cor.inc Website

## Overview
This PR implements comprehensive performance optimizations for the Astro-based Cor.inc website to achieve faster page loading and improved Core Web Vitals metrics.

## Changes Made

### 🔧 Build & TypeScript Fixes
- Fixed duplicate TypeScript declarations in `src/env.d.ts` and `types/types.d.ts`
- Added `is:inline` directive to scripts as recommended by Astro
- Resolved Alpine.js type definition conflicts

### 🖼️ Image Optimization
- Added `loading="lazy"` to all below-the-fold images
- Implemented WebP fallbacks for better browser compatibility
- Enhanced responsive image delivery with proper `<picture>` elements
- Maintained eager loading for above-the-fold hero image

### 🎨 Font & CSS Optimization
- Added `font-display: swap` for Inter font family
- Implemented critical CSS extraction for above-the-fold content
- Inlined critical styles for header, hero, and primary buttons

### 🚀 Resource Loading Optimization
- Added strategic resource hints (`preconnect`, `dns-prefetch`)
- Moved Alpine.js from CDN to local bundle
- Conditional reCAPTCHA loading (only on contact page)
- Removed unnecessary script loading from homepage

### 📊 Performance Monitoring
- Added Web Vitals measurement component
- Implemented performance tracking for LCP, FID, CLS, FCP, TTFB
- Created bundle analysis tooling for ongoing optimization

## Performance Impact
These optimizations target the following improvements:
- **Reduced initial bundle size** through conditional loading
- **Faster font rendering** with font-display: swap
- **Improved LCP** through image lazy loading and critical CSS
- **Better CLS** with proper image dimensions
- **Enhanced FID** through optimized JavaScript loading

## Testing
- ✅ Build process completes successfully
- ✅ All TypeScript errors resolved
- ✅ Images load correctly with lazy loading
- ✅ Web Vitals monitoring active
- ✅ reCAPTCHA only loads on contact page

## Files Modified
- `src/layouts/Layout.astro` - Critical CSS, resource hints, Web Vitals
- `src/components/home/Hero.astro` - Enhanced image formats
- `src/components/about/Mission.astro` - Lazy loading
- `src/components/about/Team.astro` - Lazy loading
- `src/components/home/Testimonials.astro` - Lazy loading
- `src/components/pricing/PricingTable.astro` - Lazy loading
- `src/components/layout/Header.astro` - Lazy loading
- `src/components/layout/Footer.astro` - Lazy loading
- `src/pages/contact.astro` - Conditional reCAPTCHA
- `src/pages/index.astro` - Removed unnecessary scripts
- `src/env.d.ts` - Fixed TypeScript declarations
- `types/types.d.ts` - Cleaned up duplicate declarations

## New Files
- `src/components/performance/WebVitals.astro` - Performance monitoring
- `bundle-analyzer.js` - Bundle analysis tooling

---

**Link to Devin run:** https://app.devin.ai/sessions/3750748f7f5a4906808cb24332d1e162  
**Requested by:** Terada Kousuke (company@cor-jp.com)
