---
title: "The Complete Markdown Guide: Everything for Blog Post Creation"
description: "A complete guide to Markdown syntax and rich content features usable on the Cor.inc blog.  Covers all features for creating beautiful articles, including link cards, equations, code highlighting, and more."
pubDate: 2025-01-21
author: "Terisuke"
category: "lab"
tags: ["Markdown", "Blog", "Writing", "Technical Documentation", "Guide"]
lang: "en"
featured: true
---
# The Complete Markdown Guide: Everything You Need for Blog Post Creation

This guide introduces all the Markdown and rich content features available on the Cor.inc blog. Let's learn the techniques to create beautiful and readable articles.

## Basic Markdown Syntax

### Headings

```markdown
# Heading 1 (H1)
## Heading 2 (H2)
### Heading 3 (H3)
#### Heading 4 (H4)
```

### Text Formatting

```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
`Inline code`
```

**Bold text**
*Italic text*
~~Strikethrough~~
`Inline code`

### Lists

#### Unordered List

```markdown
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3
```

- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3

#### Ordered List

```markdown
1. First item
2. Second item
3. Third item
```

1. First item
2. Second item
3. Third item

#### Task List

```markdown
- [x] Completed task
- [ ] Incomplete task
- [ ] Another incomplete task
```

- [x] Completed task
- [ ] Incomplete task
- [ ] Another incomplete task

## Code Blocks

### Basic Code Block

````markdown
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('World');
```
````

### Example Output

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('World');
```

### Supported Languages

- JavaScript/TypeScript
- Python
- HTML/CSS
- Bash/Shell
- JSON/YAML
- Markdown
- Many more

```python
# Python example
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

print(calculate_fibonacci(10))
```

```bash
# Bash example
#!/bin/bash
npm run build
npm run deploy
```

## Tables

```markdown
| Item      | Description          | Price  |
|-----------|----------------------|--------|
| Product A | High-quality product | ¥1,000 |
| Product B | Affordable price     | ¥500   |
| Product C | Premium              | ¥2,000 |
```

| Item      | Description          | Price  |
|-----------|----------------------|--------|
| Product A | High-quality product | ¥1,000 |
| Product B | Affordable price     | ¥500   |
| Product C | Premium              | ¥2,000 |

### Table Alignment

```markdown
| Left-aligned | Center-aligned | Right-aligned |
|:-------------|:--------------:|--------------:|
| Left         |     Center     |         Right |
| L            |       C        |             R |
```

| Left-aligned | Center-aligned | Right-aligned |
|:-------------|:--------------:|--------------:|
| Left         |     Center     |         Right |
| L            |       C        |             R |

## Quotes

```markdown
> This is a quote.
> It can span
> multiple lines.

> **Important Quote**
>
> You can also use **Markdown syntax** within a quote.
```

> This is a quote.
> It can span
> multiple lines.

> **Important Quote**
>
> You can also use **Markdown syntax** within a quote.

## Links and Images

### Basic Links

```markdown
[Cor.inc Website](https://cor-jp.com)
[Contact Us](/contact)
```

[Cor.inc Website](https://cor-jp.com)
[Contact Us](/contact)

### Images

```markdown
![Alt text](/images/example.jpg)
![Description](/images/example.jpg "Title")
```

## Math Equations (KaTeX)

### Inline Equation

```markdown
The area of a circle is calculated as $A = \pi r^2$.
```

The area of a circle is calculated as $A = \pi r^2$.

### Block Equation

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

### Example of Complex Equation

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

## Rich Link Cards

### Usage

Simply write a URL by itself to automatically generate a rich preview card:

```markdown
https://cor-jp.com/

https://github.com

https://docs.astro.build
```

### Example

https://cor-jp.com/

https://github.com

https://docs.astro.build

### Features

- **Automatic Metadata Retrieval**: Automatically retrieves the title, description, and favicon.
- **OG Image Display**: Displays the website's thumbnail image.
- **Caching Function**: Once retrieved, information is cached locally.
- **Responsive**: Supports both desktop and mobile.
- **Dark Mode**: Automatically adjusts according to the theme.

## Horizontal Rule

```markdown
---
```

---

## Escape Characters

To prevent characters from being interpreted as Markdown syntax, escape them with a backslash:

```markdown
\*This will not be italicized\*
\`This will not be code\`
\# This will not be a heading
```

\*This will not be italicized\*
\`This will not be code\`
\# This will not be a heading

## Front Matter

At the beginning of the article, write front matter to set metadata:

```yaml
---
title: "Article Title"
description: "Article description"
pubDate: 2025-01-21
author: "Terisuke"
category: "lab"
tags: ["tag1", "tag2", "tag3"]
image:
  url: "/images/blog/example.avif"
  alt: "Image description"
lang: "ja"
featured: true
---
```

### Category List

- `ai-driven-futures`: AI-Driven Futures
- `high-performance-engineering`: High-Performance Engineering
- `founders-journey`: Founder's Journey
- `tech-lab-creativity`: Tech Lab Creativity

## Best Practices

### 1. Structured Headings

```markdown
# Main Title (H1 is auto-generated)

## Large Section (H2)

### Subsection (H3)

#### Detail Item (H4)
```

### 2. Readable Code

- Use appropriate language specifications for code blocks.
- Divide long code into logical units.
- Add comments for explanations.

### 3. Effective Link Cards

- Only create link cards for highly relevant URLs.
- Create a reference links section at the end of the article.
- Choose reliable sources for external links.

### 4. Visual Elements

- Use tables to organize information.
- Emphasize important points with quotes.
- Separate sections with horizontal rules.

## Troubleshooting

### Common Problems

1. **Link cards are not displayed.**
   - Make sure the URL is on a single line.
   - Make sure it starts with HTTPS.
   - Check if the website is accessible.

2. **Mathematical formulas are not displayed.**
   - Check that there are no spaces before and after the `$` symbol.
   - Check the escaping of special characters.

3. **Code highlighting does not work.**
   - Check for spelling mistakes in the language name.
   - Check the number of backticks (`).

## Summary

By utilizing the features introduced in this guide, you can create readable and beautiful blog posts.  The link card feature, in particular, is a powerful tool for providing readers with valuable reference materials in a visually appealing way.

Use the following checklist when creating articles:

- [ ] Front matter is correctly set.
- [ ] Heading structure is logical.
- [ ] Code blocks have appropriate language specifications.
- [ ] Link cards are displayed correctly.
- [ ] Mathematical formulas are displayed correctly.
- [ ] Alt attributes are set for images.

---

*If you have any questions about this guide, please [contact us](/contact).*