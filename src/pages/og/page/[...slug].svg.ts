// 通常ページ（ブログ以外）用の OG SVG を静的生成する。
// SNS 向け PNG は同じ SVG builder を使う src/pages/og/page/[...slug].png.ts で生成する。
import { buildPageOgSvg, OG_PAGES } from '../../../utils/og-svg';

export async function getStaticPaths() {
  return OG_PAGES.map((p) => ({ params: { slug: p.slug } }));
}

export async function GET({ params }: { params: { slug: string } }) {
  const page = OG_PAGES.find((p) => p.slug === params.slug);
  if (!page) {
    return new Response('Not found', { status: 404 });
  }

  const svg = buildPageOgSvg(page);
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
