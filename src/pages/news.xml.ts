import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getNewsCategoryLabel } from '../config/news-categories';

export async function GET(context: APIContext) {
  const news = await getCollection('news', ({ data }) => !data.isDraft);
  const sortedNews = news.sort(
    (a, b) => new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime(),
  );

  return rss({
    title: 'Cor.株式会社 ニュース',
    description: 'Cor.株式会社からのお知らせ、サービス更新、外部掲載、イベント情報をお届けします。',
    site: context.site ?? 'https://cor-jp.com',
    items: sortedNews.map((entry) => {
      const link = entry.data.externalUrl || `/news/${entry.slug}/`;
      return {
        title: entry.data.title,
        description: entry.data.description,
        pubDate: entry.data.publishedAt,
        author: entry.data.author,
        categories: [getNewsCategoryLabel(entry.data.category, 'ja'), ...entry.data.tags],
        link,
        guid: entry.data.externalUrl || `https://cor-jp.com/news/${entry.slug}/`,
      };
    }),
    customData: `
      <language>ja</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <generator>Astro</generator>
      <webMaster>contact@cor-jp.com (Cor.株式会社)</webMaster>
      <managingEditor>contact@cor-jp.com (Cor.株式会社)</managingEditor>
      <copyright>Copyright ${new Date().getFullYear()} Cor.株式会社</copyright>
      <category>News</category>
      <ttl>60</ttl>
      <image>
        <url>https://cor-jp.com/logo.png</url>
        <title>Cor.株式会社 ニュース</title>
        <link>https://cor-jp.com/news</link>
        <width>400</width>
        <height>400</height>
      </image>
    `,
  });
}
