import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  // Hardcoded English posts for now (matching the current blog structure)
  const englishPosts = [
    {
      slug: "ai-driven-development-workflow",
      data: {
        title: "7x Productivity Boost with AI-Driven Development: My Experience",
        description: "A practical case study demonstrating a 7x increase in development speed using a workflow incorporating cutting-edge AI tools.",
        pubDate: new Date("2024-01-15"),
        author: "Terisuke",
        category: "ai",
        tags: ["AI", "DevEfficiency", "Cursor", "CodeRabbit", "GitHub Copilot"],
        lang: "en",
        featured: true
      }
    },
    {
      slug: "abe-hiroshi-website-challenge",
      data: {
        title: "The Story of Creating an Amazing Homepage After Continuously Challenging Abe Hiroshi's Homepage",
        description: "The trajectory and technical insights of a man who, self-proclaimed as \"the owner of the fastest-downloading homepage,\" persistently challenged Abe Hiroshi's homepage.",
        pubDate: new Date("2024-01-20"),
        author: "Terisuke",
        category: "engineering",
        tags: ["Astro", "Alpine.js", "AVIF", "WebPerformance", "PageSpeed"],
        lang: "en",
        featured: true
      }
    },
    {
      slug: "weekly-lt-challenge-journey",
      data: {
        title: "My Life Transformed After a Year of Weekly Lightning Talks",
        description: "The growth, learning, and life changes experienced by a struggling, inexperienced engineer and CEO through a weekly lightning talk challenge.",
        pubDate: new Date("2024-01-25"),
        author: "Terisuke",
        category: "founder",
        tags: ["LT", "Growth", "Community", "Startup", "Engineer"],
        lang: "en",
        featured: true
      }
    },
    {
      slug: "zundamon-lt-project",
      data: {
        title: "[Marp×VOICEVOX×VTubeStudio] Zundamon Gave an LT Presentation",
        description: "Creative use of technology! An experimental project building an automated LT presentation system using Zundamon with a combination of Marp, VOICEVOX, and VTubeStudio.",
        pubDate: new Date("2024-01-30"),
        author: "Terisuke",
        category: "lab",
        tags: ["Marp", "VOICEVOX", "VTubeStudio", "Automation", "CreativeProject"],
        lang: "en"
      }
    },
    {
      slug: "complete-markdown-guide",
      data: {
        title: "The Complete Markdown Guide: Everything for Blog Post Creation",
        description: "A complete guide to Markdown syntax and rich content features usable on the Cor.inc blog. Covers all features for creating beautiful articles, including link cards, equations, code highlighting, and more.",
        pubDate: new Date("2025-01-21"),
        author: "Terisuke",
        category: "lab",
        tags: ["Markdown", "Blog", "Writing", "Technical Documentation", "Guide"],
        lang: "en",
        featured: true
      }
    }
  ].sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());

  return rss({
    title: 'Cor.inc Tech Blog',
    description: 'Latest tech blog covering AI/Machine Learning, software engineering, startup journey, and innovation. Practical insights and knowledge for developers and engineers.',
    site: context.site ?? 'https://cor-jp.com',
    items: englishPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      author: post.data.author,
      categories: [post.data.category, ...post.data.tags],
      link: `/en/blog/${post.slug}/`,
      guid: `https://cor-jp.com/en/blog/${post.slug}/`,
    })),
    customData: `
      <language>en</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <generator>Astro v4.8.7</generator>
      <webMaster>contact@cor-jp.com (Terisuke)</webMaster>
      <managingEditor>contact@cor-jp.com (Terisuke)</managingEditor>
      <copyright>Copyright ${new Date().getFullYear()} Cor.inc</copyright>
      <category>Technology</category>
      <category>AI</category>
      <category>Engineering</category>
      <category>Startup</category>
      <ttl>60</ttl>
      <image>
        <url>https://cor-jp.com/logo.png</url>
        <title>Cor.inc Tech Blog</title>
        <link>https://cor-jp.com/en/blog</link>
        <width>400</width>
        <height>400</height>
      </image>
    `,
    stylesheet: '/rss-styles.xsl',
  });
}