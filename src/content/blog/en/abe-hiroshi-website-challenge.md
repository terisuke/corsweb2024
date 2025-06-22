---
title: "The Story of Creating an Amazing Homepage After Continuously Challenging Abe Hiroshi's Homepage"
description: 'The trajectory and technical insights of a man who, self-proclaimed as "the owner of the fastest-downloading homepage," persistently challenged Abe Hiroshi''''s homepage.'
pubDate: 2024-01-20
author: "Terisuke"
category: "engineering"
tags: ["Astro", "Alpine.js", "AVIF", "WebPerformance", "PageSpeed"]
image:
  url: "/images/blog/high-performance-web.avif"
  alt: "高性能Webサイトのイメージ"
lang: "en"
featured: true
---
My quest to create a website faster than Hiroki Abe's (self-proclaimed fastest) led to the creation of a truly high-performance website.

## Technology Stack Selection

### Choosing Astro + Alpine.js

```astro
---
// Astro Islands Architecture
import Hero from '../components/Hero.astro';
import ContactForm from '../components/ContactForm.vue';
---

<Layout title="Ultra Fast Website">
  <Hero />
  <!-- JavaScript loaded only where needed -->
  <ContactForm client:load />
</Layout>
```

### Image Optimization Strategy

```html
<!-- Serving images in AVIF format -->
<picture>
  <source srcset="hero-480w.avif 480w, hero-800w.avif 800w" type="image/avif">
  <source srcset="hero-480w.webp 480w, hero-800w.webp 800w" type="image/webp">
  <img src="hero-800w.jpg" alt="Hero image" loading="lazy">
</picture>
```

## Performance Optimization Results

- **Lighthouse Score**: 100/100/100/100
- **First Contentful Paint**: 0.3 seconds
- **Largest Contentful Paint**: 0.5 seconds
- **Cumulative Layout Shift**: 0

## Cache-Control Strategy

```javascript
// Firebase Hosting configuration
{
  "headers": [
    {
      "source": "**/*.@(jpg|jpeg|gif|png|webp|avif)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

This challenge taught me the importance of user experience-focused web design, going beyond just speed.

---

*Interested in building a high-performance website?  Contact us [/contact] for a consultation.*