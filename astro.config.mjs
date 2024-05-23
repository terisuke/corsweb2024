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
  integrations: [tailwind(), compress(), sitemap(),],
  // Viteのカスタム設定を追加
  vite: {
    // Viteの設定をここに記述
    resolve: {
      // 特定のモジュールへのパスエイリアスや依存関係の解決設定
    },
    optimizeDeps: {
      // 依存関係の事前バンドルに関する設定
      include: ['alpinejs', '@alpinejs/collapse']
    },
    build: {
      // ビルドプロセスに関する追加の設定
    },
    plugins: [
      // 必要に応じてViteプラグインを追加
    ]
  },
});
