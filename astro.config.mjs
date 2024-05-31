import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  experimental: {
    optimizeHoistedScript: true,
  },
  site: 'https://cor-jp.com',
  integrations: [tailwind(), compress(), sitemap()],
  vite: {
    resolve: {
      // 特定のモジュールへのパスエイリアスや依存関係の解決設定
    },
    optimizeDeps: {
      include: ['alpinejs', '@alpinejs/collapse']
    },
    build: {
      // ビルドプロセスに関する追加の設定
    },
    plugins: [
      // 必要に応じてViteプラグインを追加
    ],
    envPrefix: 'PUBLIC_'  // クライアントサイドで利用可能な環境変数のプレフィックス
  },
});