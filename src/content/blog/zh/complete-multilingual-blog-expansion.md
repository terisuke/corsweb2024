---
title: "【全五语种支持】从仅日英到支持中韩西的3小时激战记"
description: "原以为支持五语种，实则只有两种的震撼事实。与 Claude Code 一起，飞速实现中文、韩文、西班牙语支持的全记录。"
pubDate: 2025-09-25
author: "Terisuke"
category: "engineering"
tags: ["多言語化", "i18n", "Astro", "Claude Code", "自動化", "Gemini API"]
image:
  url: "/images/blog/ko-404.avif"
  alt: "韓国語ブログ404ページ"
lang: "zh"
featured: true
isDraft: false
---

# 【完全五语支持】日英博客拓展至中韩西的史诗级三小时战记

“不是写着五语支持吗！”

周四午后，我随意地查看了一下网站的开发分支的实现情况。正如 Cursor Agent 所说，语言切换按钮确实并列着五面国旗。然而，当我用中文打开博客页面时……

![404错误显示的中文博客页面](/images/blog/404.avif)

**404 Not Found。**

调查后，我发现了一个令人震惊的事实。

## 名为五语支持的二语支持

```typescript
// utils/i18n.ts 中确实有五种语言的翻译……
export type Locale = 'ja' | 'en' | 'zh' | 'ko' | 'es';
```

从 i18n 的设置来看，确实支持五种语言。首页、公司介绍，所有内容都得到了妥善翻译。然而……

```bash
$ ls src/pages/*/blog/
src/pages/en/blog/:
[...page].astro  [...slug].astro

src/pages/zh/blog/:
ls: src/pages/zh/blog/: No such file or directory

src/pages/ko/blog/:
ls: src/pages/ko/blog/: No such file or directory

src/pages/es/blog/:
ls: src/pages/es/blog/: No such file or directory
```

**只有博客支持日英。**

![确认目录结构](/images/blog/keyboardclasher.avif)

## 与 Claude Code 开启高速实现

事已至此，只能实现剩下的三种语言了。幸运的是，有 Claude Code。我立即开始了实现。

### 步骤一：复制和修改博客页面

首先，复制英語版博客页面，并针对每种语言进行修改。

```bash
# 创建中文、韩文、西班牙文的目录
for lang in zh ko es; do
  mkdir -p src/pages/$lang/blog/
  cp -r src/pages/en/blog/* src/pages/$lang/blog/
done
```

但是，仅仅这样做还不够。还需要修改每个文件中的语言过滤器。

```typescript
// 修改前（所有文件通用）
const allPosts = await getCollection('blog', ({ data }) => {
  return data.lang === 'en' && !data.isDraft;
});

// 修改后（示例：中文版）
const allPosts = await getCollection('blog', ({ data }) => {
  return data.lang === 'zh' && !data.isDraft;
});
```

### 步骤二：创建最强的翻译脚本

手动翻译八篇日文文章是不现实的。于是，我创建了一个使用 Gemini API 的自动翻译脚本。

```javascript
// scripts/translate-blog-all-languages.js
const LANGUAGES = {
  en: { name: 'English', author: 'Terisuke' },
  zh: { name: 'Chinese', author: 'Terisuke' },
  ko: { name: 'Korean', author: 'Terisuke' },
  es: { name: 'Spanish', author: 'Terisuke' }
};

async function translateToLanguage(inputFile, targetLang, body, frontmatter) {
  console.log(`📝 Translating to ${LANGUAGES[targetLang].name}...`);

  // 翻译标题和description
  const titleAndDescription = `Title: ${frontmatter.title}\nDescription: ${frontmatter.description}`;
  const translatedTitleDesc = await translateWithGemini(titleAndDescription, targetLang);

  // 翻译正文
  const translatedBody = await translateWithGemini(body, targetLang);

  // 保存文件
  saveTranslatedFile(targetLang, translatedContent);
}
```

https://github.com/Cor-Incorporated/corsweb2024/blob/develop/scripts/translate-blog-all-languages.js

### 步骤三：与错误殊死搏斗

运行翻译脚本，兴致勃勃地检查网站后……

```bash
$ npm run build
✘ [ERROR] Expected "}" but found "."
  script:/ProductsTable.astro:3:33:
    3 │   buttonTexts: {t.buttonTexts},
      ╵                ^
```

**构建错误频发。**

![堆积如山的错误日志](/images/blog/naniittenda.avif)

## 连续修复 Bug

### 问题一：ProductsTable.astro 中神秘的调试代码

```javascript
// 不知为何混入的神秘调试代码
<script>
  console.log('Button text debug:', {
    buttonTexts: {t.buttonTexts},  // ← 这里是语法错误
    goTo: {t.buttonTexts?.goTo},
    itemName: {item.name}
  });
</script>
```

删除这段调试代码后解决。

### 问题二：CategoryBadge 遗漏语言支持

```typescript
// 修改前
const categoryLabels = {
  ja: { 'ai': 'AI', 'engineering': 'エンジニアリング', ... },
  en: { 'ai': 'AI', 'engineering': 'Engineering', ... },
  // zh, ko, es 不存在！
};

// 修改后
const categoryLabels = {
  ja: { ... },
  en: { ... },
  zh: { 'ai': '人工智能', 'engineering': '工程', ... },
  ko: { 'ai': 'AI', 'engineering': '엔지니어링', ... },
  es: { 'ai': 'IA', 'engineering': 'Ingeniería', ... },
};
```

### 问题三：PostCard 的链接全部跳转到英文

```typescript
// 修改前
const postUrl = currentLocale === 'ja'
  ? `/blog/${cleanSlug}`
  : `/en/blog/${cleanSlug}`;  // 其他语言也跳转到 /en/ 了！

// 修改后
const postUrl = currentLocale === 'ja'
  ? `/blog/${cleanSlug}`
  : `/${currentLocale}/blog/${cleanSlug}`;
```

### 问题四：翻译了但标题仍然是日文

这是最棘手的问题。翻译脚本本应正常运行，但 frontmatter 的 title 和 description 却仍然是日文……

```yaml
# 明明是中文文章……
---
title: "【爆速15分】MCP服务器でMCPサーバーを作る！"  # 日文！
description: "LT中止の絶望から生まれた奇跡..."  # 日文！
lang: "zh"
---

# 【闪电15分钟】用MCP服务器构建MCP服务器！  # 正文是中文
```

经过调查，发现翻译脚本的解析处理存在 bug。我另外创建了一个修复脚本来解决这个问题。

```javascript
// scripts/fix-translated-frontmatter.cjs
function extractTitleFromBody(body) {
  const lines = body.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.substring(2).trim();  // 从正文的第一个标题提取
    }
  }
  return null;
}
```

## 史诗级三小时的成果

从发现第一个错误开始，大约三小时后，我终于解决了所有问题。

### 已实现的功能列表

- ✅ 创建中文、韩文、西班牙文的博客页面
- ✅ 分类页面支持五种语言
- ✅ 标签页面支持五种语言
- ✅ RSS Feed 支持五种语言
- ✅ 支付成功/取消页面支持五种语言
- ✅ 现有8篇文章 × 3种语言 = 24篇文章的自动翻译
- ✅ 解决所有 TypeScript 错误
- ✅ 构建成功（317个页面）

![完成的中文博客](/images/blog/zh.avif)
![完成的韩文博客](/images/blog/ko.avif)
![完成的西班牙文博客](/images/blog/es.avif)


### 翻译质量

Gemini API 的翻译质量远超我的想象。

```text
日文: 「いい感じにアレしとくアプリ」開発秘話
中文: "随心所欲处理应用"开发秘辛
韩文: '적당히 알아서 해주는 앱' 개발 비화
西班牙文: La historia detrás de la aplicación 'Hazlo bien y ya'
```

翻译准确地捕捉了各种语言的细微差别，非常自然。

## 学到的东西

### 1. “支持”的定义模糊不清

即使网站写着“五语支持”，实际支持到什么程度，需要实际去查验。像这次一样，首页支持但博客不支持的情况，可能比想象中更常见。

### 2. Claude Code 协作的威力

能在三小时内完成五种语言 × 8篇文章的实现，Claude Code 的存在功不可没。特别是在以下方面提供了帮助：

- 从错误信息中即时定位问题根源
- 学习修正模式并批量应用同类修正
- 高效实现翻译脚本的逻辑

### 3. 自动化脚本是正义

如果手动翻译24篇文章，可能需要一周时间。即使花一个小时编写自动化脚本，其回报也远超于此。

### 4. 错误是宝藏

这次遇到的各种错误，是发现系统潜在问题的好机会。特别是 CategoryBadge 的语言支持遗漏，迟早会成为一个问题。

## 总结：迈向真正的多语言支持

当初以为“已支持五语”的网站，实际上是“假五语支持”。但是，通过与 Claude Code 并肩作战的三小时，我们实现了真正的五语支持。

现在，无论是中文、韩文还是西班牙文，博客文章都能正常显示。404错误不再出现。

这才是真正的多语言支持。

---

*实现的开源代码已在 GitHub 上公开。翻译脚本应该也能用于其他 Astro 项目。*

https://github.com/Cor-Incorporated/corsweb2024

*与 Claude Code 并肩作战的三小时，是一段跌宕起伏却又充实的时间。*