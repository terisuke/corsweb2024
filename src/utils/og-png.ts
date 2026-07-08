import sharp from 'sharp';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from './og-svg';

export async function renderOgPng(svg: string) {
  return sharp(new TextEncoder().encode(svg))
    .resize(OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT, { fit: 'fill' })
    .png()
    .toBuffer();
}

export function createPngResponse(png: BodyInit) {
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(png instanceof Uint8Array ? png.byteLength : 0),
    },
  });
}

export { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH };
