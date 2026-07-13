import { getCollection } from 'astro:content';
import { createPngResponse, renderOgPng } from '../../utils/og-png';
import { buildBlogOgSvg } from '../../utils/og-svg';

interface Props {
  params: { slug: string };
}

export async function GET({ params }: Props) {
  const { slug } = params;
  const posts = await getCollection('blog');
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return new Response('Post not found', { status: 404 });
  }

  const { title, description, category, author } = post.data;
  const svg = buildBlogOgSvg({ title, description, category, author });
  const png = await renderOgPng(svg);

  return createPngResponse(png);
}

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.isDraft);

  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}
