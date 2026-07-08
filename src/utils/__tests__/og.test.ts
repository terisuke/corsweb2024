import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { createPngResponse, renderOgPng } from '../og-png';
import { buildBlogOgSvg, buildPageOgSvg, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '../og-svg';

describe('OG image utilities', () => {
  it('escapes blog SVG text before embedding it in markup', () => {
    const svg = buildBlogOgSvg({
      title: 'Title <script>alert("x")</script>',
      description: 'Description & details',
      category: 'ai<ops>',
      author: 'A&B',
    });

    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
    expect(svg).toContain('Description &amp; details');
    expect(svg).toContain('AI&lt;OPS&gt;');
    expect(svg).toContain('A&amp;B');
  });

  it('keeps page SVG dimensions and escapes page copy', () => {
    const svg = buildPageOgSvg({
      slug: 'test',
      title: 'Page <Title>',
      subtitle: 'Subtitle & detail',
    });

    expect(svg).toContain(`width="${OG_IMAGE_WIDTH}"`);
    expect(svg).toContain(`height="${OG_IMAGE_HEIGHT}"`);
    expect(svg).toContain('Page &lt;Title&gt;');
    expect(svg).toContain('Subtitle &amp; detail');
  });

  it('renders SVG output to a nonblank 1200x630 PNG', async () => {
    const svg = buildPageOgSvg({
      slug: 'home',
      title: 'AIで、現場の課題を一緒に形にする。',
      subtitle: 'AI受託開発・DXコンサルティング・ローカルLLM',
    });
    const png = await renderOgPng(svg);
    const metadata = await sharp(png).metadata();
    const stats = await sharp(png).stats();

    expect(metadata.format).toBe('png');
    expect(metadata.width).toBe(OG_IMAGE_WIDTH);
    expect(metadata.height).toBe(OG_IMAGE_HEIGHT);
    expect(stats.channels.some((channel) => channel.stdev > 0)).toBe(true);
  });

  it('returns PNG response headers with cache metadata', async () => {
    const png = await renderOgPng(
      buildPageOgSvg({
        slug: 'home',
        title: 'Cor.inc',
        subtitle: 'cor-jp.com',
      }),
    );
    const response = createPngResponse(png);

    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
    expect(response.headers.get('Content-Length')).toBe(String(png.byteLength));
  });
});
