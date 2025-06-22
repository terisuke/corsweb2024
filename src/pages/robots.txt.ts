import type { APIRoute } from 'astro';

const robotsTxt = `
User-agent: *
Allow: /

# Allow all bots to access blog content
Allow: /blog/
Allow: /en/blog/

# Disallow unnecessary paths
Disallow: /api/
Disallow: /_astro/
Disallow: /remark-link-card-plus/

# Crawl delay for better server performance
Crawl-delay: 1

# Sitemap locations
Sitemap: ${new URL('sitemap-index.xml', import.meta.env.SITE).href}
`.trim();

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};