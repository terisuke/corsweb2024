// 通常ページ（ブログ以外）用の OG 画像（1200x630 SVG）を静的生成する。
// ブログの src/pages/og/[...slug].svg.ts と同じ SVG 方式に揃える。
// 注意: SVG の og:image は一部 SNS（X/Facebook 等）では表示されないため、
// Slack/Discord などで有効。確実に全 SNS で出すには PNG 化が必要（将来対応）。
// NOTE: returns raw SVG markup (no JSX).
// @ts-nocheck

interface OgPage {
  slug: string;
  title: string;
  subtitle: string;
}

// path → OG 内容。Layout 側の pathToOgSlug と slug を一致させること。
const OG_PAGES: OgPage[] = [
  { slug: 'home', title: 'AIで、現場の課題を一緒に形にする。', subtitle: 'AI受託開発・DXコンサルティング・ローカルLLM' },
  { slug: 'about', title: '会社概要', subtitle: '「きょうそう」を追い続ける' },
  { slug: 'works', title: '実績・事例', subtitle: 'AI受託開発・基幹DB移行・多言語AI受付・建築AI・Grift' },
  { slug: 'security', title: 'セキュリティ', subtitle: 'ローカルファースト・機密度ティア・ISMS整備中' },
  { slug: 'contact', title: 'お問い合わせ', subtitle: 'ご相談・お見積もりはお気軽に' },
  { slug: 'privacy', title: 'プライバシーポリシー', subtitle: '個人情報保護方針' },
];

const xmlEscape = (str: string) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export async function getStaticPaths() {
  return OG_PAGES.map((p) => ({ params: { slug: p.slug } }));
}

export async function GET({ params }: { params: { slug: string } }) {
  const page = OG_PAGES.find((p) => p.slug === params.slug);
  if (!page) {
    return new Response('Not found', { status: 404 });
  }

  const title = xmlEscape(page.title);
  const subtitle = xmlEscape(page.subtitle);

  // CJK を含むためフォントは日本語対応のスタックを指定（描画側の環境に依存）。
  const fontStack =
    "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', Meiryo, sans-serif";

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#6366F1"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="10" fill="url(#accent)"/>
  <text x="80" y="120" font-family="${fontStack}" font-size="34" font-weight="700" fill="#ffffff">Cor.inc</text>
  <text x="80" y="160" font-family="${fontStack}" font-size="20" fill="#94a3b8">cor-jp.com ・ 福岡発・全国対応</text>
  <text x="80" y="340" font-family="${fontStack}" font-size="64" font-weight="700" fill="#ffffff">${title}</text>
  <text x="80" y="420" font-family="${fontStack}" font-size="30" fill="#cbd5e1">${subtitle}</text>
  <rect x="80" y="500" width="120" height="6" rx="3" fill="url(#accent)"/>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
