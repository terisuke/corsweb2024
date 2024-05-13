import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  experimental: {
    optimizeHoistedScript: true,
  },
  site: 'https://cor-jp.com',
  integrations: [tailwind(), compress(), sitemap()],
});
