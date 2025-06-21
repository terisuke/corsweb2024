// Disable JSX for this file to avoid TypeScript errors
// @ts-nocheck

import { getCollection } from 'astro:content';

interface Props {
  params: { slug: string };
  request: Request;
}

export async function GET({ params }: Props) {
  const { slug } = params;
  
  // Get the blog post
  const posts = await getCollection('blog');
  const post = posts.find((p) => p.slug === slug);
  
  if (!post) {
    return new Response('Post not found', { status: 404 });
  }
  
  const { title, description, category, author } = post.data;
  
  // XML escape to prevent XSS
  const xmlEscape = (str: string) =>
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#39;');

  const safeTitle = xmlEscape(title);
  const safeDesc = description ? xmlEscape(description) : '';
  
  // Create a simple SVG-based OG image instead of using JSX
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .title { font: bold 48px Arial, sans-serif; fill: #1C1917; }
          .description { font: 24px Arial, sans-serif; fill: #57534E; }
          .author { font: 20px Arial, sans-serif; fill: #78716C; }
          .category { font: 16px Arial, sans-serif; fill: white; }
        </style>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="#F5F5F4"/>
      
      <!-- Header -->
      <rect x="0" y="0" width="1200" height="120" fill="#1C1917"/>
      
      <!-- Logo -->
      <rect x="60" y="36" width="48" height="48" rx="8" fill="#3B82F6"/>
      <text x="84" y="66" text-anchor="middle" class="category">C</text>
      
      <!-- Brand -->
      <text x="128" y="70" class="category" style="font-size: 28px;">Cor.inc</text>
      
      <!-- Category -->
      <rect x="1020" y="45" width="120" height="30" rx="15" fill="#3B82F6"/>
      <text x="1080" y="65" text-anchor="middle" class="category">${category.toUpperCase()}</text>
      
      <!-- Title -->
      <text x="60" y="220" class="title">${safeTitle.length > 50 ? safeTitle.substring(0, 50) + '...' : safeTitle}</text>
      
      <!-- Description -->
      <text x="60" y="280" class="description">${safeDesc.length > 100 ? safeDesc.substring(0, 100) + '...' : safeDesc}</text>
      
      <!-- Author -->
      <text x="60" y="520" class="author">By ${author} • cor-jp.com</text>
      
      <!-- Footer gradient -->
      <rect x="0" y="622" width="1200" height="8" fill="url(#gradient)"/>
      
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#3B82F6"/>
          <stop offset="100%" style="stop-color:#6366F1"/>
        </linearGradient>
      </defs>
    </svg>
  `;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.isDraft);
  
  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}