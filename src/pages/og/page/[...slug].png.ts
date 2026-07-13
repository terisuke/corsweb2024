import { createPngResponse, renderOgPng } from '../../../utils/og-png';
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
  const png = await renderOgPng(svg);

  return createPngResponse(png);
}
