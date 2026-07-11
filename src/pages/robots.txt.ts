import type { APIRoute } from 'astro';
import { isProductionSite } from '../config/site';

// Preview / develop チャネルは全クロール拒否（ADR-0010）。meta robots の noindex と二重化。
const previewRobotsTxt = `
User-agent: *
Disallow: /
`.trim();

const productionRobotsTxt = `
User-agent: *
Allow: /

# Allow all bots to access blog content
Allow: /blog/
Allow: /en/blog/

# Disallow admin / API / preview surfaces
Disallow: /admin/
Disallow: /blog-admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /preview/
Disallow: /_astro/
Disallow: /remark-link-card-plus/

# Crawl delay for better server performance
Crawl-delay: 1

# Sitemap locations
Sitemap: ${new URL('sitemap-index.xml', import.meta.env.SITE).href}
`.trim();

export const GET: APIRoute = () => {
  const robotsTxt = isProductionSite() ? productionRobotsTxt : previewRobotsTxt;
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};