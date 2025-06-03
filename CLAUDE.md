# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a high-performance corporate website for Cor.inc built with Astro 4.8.7, focusing on extreme loading speed optimization. The site features bilingual (Japanese/English) content and showcases services in Python data analysis, web/mobile development, and machine learning solutions.

## Development Commands
```bash
npm run dev      # Start development server on localhost:4321
npm run build    # Type check and build for production
npm run preview  # Preview production build locally
```

## Architecture & Key Patterns

### Tech Stack
- **Framework**: Astro with Islands Architecture (selective hydration)
- **Interactivity**: Alpine.js 3.14.0 loaded from CDN
- **Styling**: Tailwind CSS with stone color palette as primary
- **TypeScript**: Custom Alpine.js type definitions in `/types/types.d.ts`

### Component Structure
Components are organized by page under `/src/components/`:
- `home/`, `about/`, `contact/`, `pricing/` - Page-specific components
- `layout/` - Shared Header and Footer components

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

### Alpine.js Integration
Alpine.js is loaded from CDN with custom TypeScript support:
```typescript
// Global store accessible via Alpine.store('darkMode')
// Components use x-data for local state
// Dark mode toggle integrated in Header component
```

### Firebase Deployment
The site deploys to Firebase Hosting with specific caching rules defined in `firebase.json`. Production builds are optimized for long-term caching of assets while keeping HTML fresh.

## Important Notes
- No test framework is configured - verify changes manually
- Always optimize images to AVIF format for consistency
- Maintain bilingual content structure when adding new features
- The goal is to match or exceed the loading speed of Hiroshi Abe's website