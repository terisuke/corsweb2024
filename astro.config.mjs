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
  markdown: {
    remarkPlugins: [
      'remark-gfm',
      'remark-math',
      ['remark-link-card-plus', { 
        cache: true,
        shortenUrl: true,
        showImage: true,
        imagePosition: 'right'
      }],
    ],
    rehypePlugins: [
      'rehype-slug',
      ['rehype-autolink-headings', { behavior: 'append', properties: { class: 'heading-link' } }],
      'rehype-katex',
    ],
    shikiConfig: {
      theme: 'dracula',
      langs: [],
      wrap: true,
    },
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
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      i18n: {
        defaultLocale: 'ja',
        locales: {
          ja: 'ja',
          en: 'en'
        }
      },
      customPages: [
        'https://cor-jp.com/blog',
        'https://cor-jp.com/en/blog',
        'https://cor-jp.com/blog/category/ai',
        'https://cor-jp.com/blog/category/engineering',
        'https://cor-jp.com/blog/category/founder',
        'https://cor-jp.com/blog/category/lab',
      ],
      filter: (page) => {
        // Exclude API routes and unnecessary pages
        if (page.includes('/api/') || 
            page.includes('/_astro/') || 
            page.includes('/remark-link-card-plus/')) {
          return false;
        }
        return true;
      }
    }), 
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
      exclude: []
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
