---
title: "阿部寛のホームページに挑み続けたらすごいHPができた話"
description: "「自称下り最速のホームページを持つ男」として、阿部寛のホームページに挑戦し続けた軌跡と技術的洞察"
pubDate: 2024-01-20
author: "Terisuke"
category: "engineering"
tags: ["Astro", "Alpine.js", "AVIF", "WebPerformance", "PageSpeed"]
image:
  url: "/images/blog/abe-hiroshi-hero.avif"
  alt: "高性能Webサイトのイメージ"
lang: "ja"
featured: true
---

# 阿部寛のホームページに挑み続けたらすごいHPができた話

「自称下り最速のホームページを持つ男」として、阿部寛さんのホームページに挑戦し続けた。その結果、単なる速度競争を超えた、真のハイパフォーマンスWebサイトが誕生したのだ。ちなみに阿部寛さんのサイトは今でも速い。敬意を表する。

![開発者プロフィール画像](/images/blog/k-terada.avif)

## 技術スタックの選定

### Astro + Alpine.js の採用理由

なぜこの組み合わせか？答えは簡単だ。「必要な時に必要な分だけ」という禅の精神を体現しているからだ。React？重い。Vue？まあまあ。でもAlpine.js？これが最軽量の答えだった。

```astro
---
// Astro Islands Architecture
import Hero from '../components/Hero.astro';
import ContactForm from '../components/ContactForm.vue';
---

<Layout title="Ultra Fast Website">
  <Hero />
  <!-- 必要な部分のみJavaScriptを読み込み -->
  <ContactForm client:load />
</Layout>
```

### 画像最適化戦略

画像は現代Webの重い荷物だ。だから私は最新のAVIF形式を採用した。JPEGの半分のサイズで、画質は変わらない。魔法のようだが、これが技術の進歩というものだ。

```html
<!-- AVIF形式での画像配信 -->
<picture>
  <source srcset="hero-480w.avif 480w, hero-800w.avif 800w" type="image/avif">
  <source srcset="hero-480w.webp 480w, hero-800w.webp 800w" type="image/webp">
  <img src="hero-800w.jpg" alt="Hero image" loading="lazy">
</picture>
```

## パフォーマンス最適化の結果

ついにやった。全てのスコアで満点を叩き出したのだ：

- **Lighthouse Score**: 100/100/100/100（完璧だ！）
- **First Contentful Paint**: 0.3秒（瞬きする間もない）
- **Largest Contentful Paint**: 0.5秒（コーヒーを一口飲む前に表示完了）
- **Cumulative Layout Shift**: 0（ピクリとも動かない）

## Cache-Control戦略

キャッシュは友達だ。1年間（31536000秒）のキャッシュ設定で、一度読み込んだ画像は二度と読み込まない。ユーザーのデータ通信料も節約できる。みんなハッピーだ。

```javascript
// Firebase Hosting設定
{
  "headers": [
    {
      "source": "**/*.@(jpg|jpeg|gif|png|webp|avif)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000, immutable"  // 1年間のキャッシュ！
        }
      ]
    }
  ]
}
```

この挑戦を通じて、単なる「速さ」を超えた、ユーザー体験を重視したWebサイト設計の重要性を学んだ。結論：速いは正義だが、使いやすいはもっと正義だ。

*高性能Webサイトの構築に興味がある方は、[お問い合わせ](/contact)から相談してほしい。阿部寛さんより速いサイトを一緒に作ろう（無理かもしれないが、挑戦する価値はある）。*