---
title: "完全マークダウンガイド：ブログ記事作成のすべて"
description: "Cor.incブログで使用できるマークダウン記法とリッチコンテンツ機能の完全ガイド。リンクカード、数式、コードハイライトなど、美しい記事を作成するためのすべての機能を網羅"
pubDate: 2025-01-21
author: "Terisuke"
category: "lab"
tags: ["Markdown", "ブログ", "執筆", "技術文書", "ガイド"]
lang: "ja"
featured: true
---

# 完全マークダウンガイド：ブログ記事作成のすべて

このガイドでは、Cor.incブログで利用できるマークダウン記法とリッチコンテンツ機能をすべて紹介します。美しく読みやすい記事を作成するためのテクニックを習得しましょう。

## 基本的なマークダウン記法

### 見出し

```markdown
# 見出し1 (H1)
## 見出し2 (H2)
### 見出し3 (H3)
#### 見出し4 (H4)
```

### テキスト装飾

```markdown
**太字テキスト**
*斜体テキスト*
~~取り消し線~~
`インラインコード`
```

**太字テキスト**
*斜体テキスト*
~~取り消し線~~
`インラインコード`

### リスト

#### 順序なしリスト

```markdown
- 項目1
- 項目2
  - サブ項目2.1
  - サブ項目2.2
- 項目3
```

- 項目1
- 項目2
  - サブ項目2.1
  - サブ項目2.2
- 項目3

#### 順序付きリスト

```markdown
1. 最初の項目
2. 二番目の項目
3. 三番目の項目
```

1. 最初の項目
2. 二番目の項目
3. 三番目の項目

#### タスクリスト

```markdown
- [x] 完了したタスク
- [ ] 未完了のタスク
- [ ] 別の未完了タスク
```

- [x] 完了したタスク
- [ ] 未完了のタスク
- [ ] 別の未完了タスク

## コードブロック

### 基本的なコードブロック

```markdown
\`\`\`javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('World');
\`\`\`
```

### 実際の表示例

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('World');
```

### 対応言語

- JavaScript/TypeScript
- Python
- HTML/CSS
- Bash/Shell
- JSON/YAML
- Markdown
- その他多数

```python
# Python例
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

print(calculate_fibonacci(10))
```

```bash
# Bash例
#!/bin/bash
npm run build
npm run deploy
```

## 表（テーブル）

```markdown
| 項目 | 説明 | 価格 |
|------|------|------|
| 商品A | 高品質な商品 | ¥1,000 |
| 商品B | お手頃価格 | ¥500 |
| 商品C | プレミアム | ¥2,000 |
```

| 項目 | 説明 | 価格 |
|------|------|------|
| 商品A | 高品質な商品 | ¥1,000 |
| 商品B | お手頃価格 | ¥500 |
| 商品C | プレミアム | ¥2,000 |

### 表の整列

```markdown
| 左寄せ | 中央揃え | 右寄せ |
|:-------|:--------:|-------:|
| Left | Center | Right |
| L | C | R |
```

| 左寄せ | 中央揃え | 右寄せ |
|:-------|:--------:|-------:|
| Left | Center | Right |
| L | C | R |

## 引用

```markdown
> これは引用文です。
> 複数行にわたって
> 引用することができます。

> **重要な引用**
> 
> 引用の中で**マークダウン記法**も使用できます。
```

> これは引用文です。
> 複数行にわたって
> 引用することができます。

> **重要な引用**
> 
> 引用の中で**マークダウン記法**も使用できます。

## リンクと画像

### 基本的なリンク

```markdown
[Cor.inc公式サイト](https://cor-jp.com)
[お問い合わせ](/contact)
```

[Cor.inc公式サイト](https://cor-jp.com)
[お問い合わせ](/contact)

### 画像

```markdown
![Alt text](/images/example.jpg)
![説明文](/images/example.jpg "タイトル")
```

## 数式（KaTeX）

### インライン数式

```markdown
円の面積は $A = \pi r^2$ で計算できます。
```

円の面積は $A = \pi r^2$ で計算できます。

### ブロック数式

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

### 複雑な数式例

```markdown
$$
\begin{aligned}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &= \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} &= 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} &= \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{aligned}
$$
```

$$
\begin{aligned}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &= \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} &= 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} &= \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{aligned}
$$

## リッチリンクカード

### 使用方法

URLを単体で記述するだけで、自動的にリッチなプレビューカードが生成されます：

```markdown
https://cor-jp.com/

https://github.com

https://docs.astro.build
```

### 表示例

https://cor-jp.com/

https://github.com

https://docs.astro.build

### 機能

- **自動メタデータ取得**: タイトル、説明文、ファビコンを自動取得
- **OG画像表示**: ウェブサイトのサムネイル画像を表示
- **キャッシュ機能**: 一度取得した情報はローカルにキャッシュ
- **レスポンシブ**: デスクトップ・モバイル両対応
- **ダークモード**: テーマに応じて自動調整

## 水平線

```markdown
---
```

---

## エスケープ文字

マークダウン記法として解釈されたくない文字は、バックスラッシュでエスケープします：

```markdown
\*これは斜体になりません\*
\`これはコードになりません\`
\# これは見出しになりません
```

\*これは斜体になりません\*
\`これはコードになりません\`
\# これは見出しになりません

## フロントマター

記事の冒頭には、メタデータを設定するフロントマターを記述します：

```yaml
---
title: "記事のタイトル"
description: "記事の説明文"
pubDate: 2025-01-21
author: "Terisuke"
category: "lab"
tags: ["tag1", "tag2", "tag3"]
image:
  url: "/images/blog/example.avif"
  alt: "画像の説明"
lang: "ja"
featured: true
---
```

### カテゴリ一覧

- `ai-driven-futures`: AI駆動の未来
- `high-performance-engineering`: 高性能エンジニアリング
- `founders-journey`: 創業者の軌跡
- `tech-lab-creativity`: テックラボの創造性

## ベストプラクティス

### 1. 構造化された見出し

```markdown
# メインタイトル (H1は自動生成)

## 大きなセクション (H2)

### サブセクション (H3)

#### 詳細項目 (H4)
```

### 2. 読みやすいコード

- コードブロックには適切な言語指定を行う
- 長いコードは論理的な単位で分割する
- コメントで説明を追加する

### 3. 効果的なリンクカード

- 関連性の高いURLのみリンクカード化
- 記事の最後に参考リンクセクションを設ける
- 外部リンクは信頼できるソースを選ぶ

### 4. 視覚的な要素

- 表を使って情報を整理する
- 引用で重要なポイントを強調する
- 水平線でセクションを区切る

## トラブルシューティング

### よくある問題

1. **リンクカードが表示されない**
   - URLが単独行にあることを確認
   - HTTPSで始まることを確認
   - ウェブサイトがアクセス可能か確認

2. **数式が表示されない**
   - `$`記号の前後にスペースがないか確認
   - 特殊文字のエスケープを確認

3. **コードハイライトが効かない**
   - 言語名のスペルミスを確認
   - バッククォート（`）の数を確認

## まとめ

このガイドで紹介した機能を活用することで、読みやすく美しいブログ記事を作成できます。特にリンクカード機能は、読者にとって有益な参考資料を視覚的に魅力的な形で提供できる強力な機能です。

記事作成時は以下のチェックリストを活用してください：

- [ ] フロントマターが正しく設定されている
- [ ] 見出し構造が論理的である
- [ ] コードブロックに適切な言語指定がある
- [ ] リンクカードが正しく表示される
- [ ] 数式が正しく表示される
- [ ] 画像のalt属性が設定されている

---

*このガイドについて質問がある場合は、[お問い合わせ](/contact)からご連絡ください。*