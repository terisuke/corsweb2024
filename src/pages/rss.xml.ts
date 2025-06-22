import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { allPosts } from '../utils/blog';

export async function GET(context: APIContext) {
  // Filter only Japanese posts and sort by date
  const japanesePosts = allPosts
    .filter(post => post.data.lang === 'ja')
    .sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());

  return rss({
    title: 'Cor.inc 技術ブログ',
    description: 'AI・機械学習、エンジニアリング、スタートアップ創業、技術革新に関する最新の技術ブログ。開発者・エンジニア向けの実践的な知識と洞察をお届けします。',
    site: context.site ?? 'https://cor-jp.com',
    items: japanesePosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      author: post.data.author,
      categories: [post.data.category, ...post.data.tags],
      link: `/blog/${post.slug}/`,
      guid: `https://cor-jp.com/blog/${post.slug}/`,
    })),
    customData: `
      <language>ja</language>
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
        <title>Cor.inc 技術ブログ</title>
        <link>https://cor-jp.com/blog</link>
        <width>400</width>
        <height>400</height>
      </image>
    `,
    stylesheet: '/rss-styles.xsl',
  });
}