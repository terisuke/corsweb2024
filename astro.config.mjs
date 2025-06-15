import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';
import sitemap from '@astrojs/sitemap';
import compressor from "astro-compressor";

export default defineConfig({
  site: 'https://cor-jp.com',
  i18n: {
    locales: ["ja", "en"],
    defaultLocale: "ja",
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [
    tailwind(), 
    compress({
      CSS: true,
      HTML: {
        'remove-comments': true,
        'remove-tags': ['script[type="application/ld+json"]'],
        'minify-js': true,
        'minify-css': true
      },
      Image: false,
      JavaScript: true,
      SVG: true
    }), 
    sitemap(), 
    compressor({
      gzip: true,
      brotli: true
    })
  ],
  vite: {
    resolve: {
      // 特定のモジュールへのパスエイリアスや依存関係の解決設定
    },
    optimizeDeps: {
      exclude: ['astro:*']
    },
    build: {
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: undefined,
          entryFileNames: '_astro/[name].[hash].js',
          chunkFileNames: '_astro/[name].[hash].js',
          assetFileNames: '_astro/[name].[hash].[ext]'
        }
      }
    },
    plugins: [
      // 必要に応じてViteプラグインを追加
    ],
    envPrefix: 'PUBLIC_',  // クライアントサイドで利用可能な環境変数のプレフィックス
    json: {
      stringify: false
    }
  },
});
