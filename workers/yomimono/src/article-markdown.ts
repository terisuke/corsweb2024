import { normalizeCategory, type ArticleInput, type NormalizedArticle } from './validate';
import type { Collection } from './types';

interface FrontmatterBlock {
  key: string;
  lines: string[];
}

interface ParsedFrontmatter {
  blocks: FrontmatterBlock[];
  body: string;
}

export interface ParsedBlogArticle {
  article: ArticleInput;
  frontmatter: Record<string, unknown>;
}

function splitMarkdown(markdown: string): ParsedFrontmatter {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('frontmatter が見つかりません');
  }

  const blocks: FrontmatterBlock[] = [];
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (m) {
      blocks.push({ key: m[1], lines: [line] });
    } else if (blocks.length) {
      blocks[blocks.length - 1].lines.push(line);
    }
  }
  return { blocks, body: match[2].replace(/^\n/, '').replace(/\n$/, '') };
}

function scalarValue(raw: string | undefined): string {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }
  return value;
}

function parseValue(lines: string[]): unknown {
  const first = lines[0] ?? '';
  const raw = first.slice(first.indexOf(':') + 1).trim();
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return parseLooseInlineArray(raw);
    }
  }
  return scalarValue(raw);
}

function parseLooseInlineArray(raw: string): string[] {
  const body = raw.replace(/^\[/, '').replace(/\]$/, '').trim();
  if (!body) return [];
  return body
    .split(',')
    .map((item) => scalarValue(item))
    .filter(Boolean);
}

function parseFrontmatter(blocks: FrontmatterBlock[]): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const block of blocks) {
    values[block.key] = parseValue(block.lines);
  }
  return values;
}

function tagsValue(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.map(String).filter(Boolean) : [];
}

export function parseBlogMarkdown(slug: string, markdown: string): ParsedBlogArticle {
  return parseArticleMarkdown(slug, markdown, 'blog');
}

export function parseArticleMarkdown(
  slug: string,
  markdown: string,
  collection: Collection = 'blog',
): ParsedBlogArticle {
  const parsed = splitMarkdown(markdown);
  const frontmatter = parseFrontmatter(parsed.blocks);
  const category =
    collection === 'news'
      ? normalizeCategory(String(frontmatter.category ?? undefined), 'news')
      : collection === 'cases'
        ? normalizeCategory(String(frontmatter.category ?? undefined), 'cases')
        : normalizeCategory(String(frontmatter.category ?? undefined));
  return {
    frontmatter,
    article: {
      slug,
      title: String(frontmatter.title ?? ''),
      description: String(frontmatter.description ?? ''),
      category,
      tags: tagsValue(frontmatter.tags),
      body: parsed.body,
      pubDate: typeof frontmatter.pubDate === 'string' ? frontmatter.pubDate : undefined,
      publishedAt: typeof frontmatter.publishedAt === 'string' ? frontmatter.publishedAt : undefined,
      externalUrl: typeof frontmatter.externalUrl === 'string' ? frontmatter.externalUrl : undefined,
      source: typeof frontmatter.source === 'string' ? frontmatter.source : undefined,
      summary: typeof frontmatter.summary === 'string' ? frontmatter.summary : undefined,
      featured: frontmatter.featured === true,
      isDraft: frontmatter.isDraft === true,
    },
  };
}

function replacementLines(article: NormalizedArticle): Record<string, string | null | undefined> {
  const common: Record<string, string | null | undefined> = {
    title: `title: ${JSON.stringify(article.title)}`,
    description: `description: ${JSON.stringify(article.description)}`,
    category: `category: "${article.category}"`,
    tags: `tags: ${JSON.stringify(article.tags)}`,
    isDraft: `isDraft: ${article.isDraft === true}`,
  };
  if (article.collection === 'blog') {
    return {
      ...common,
      pubDate: article.pubDate ? `pubDate: ${article.pubDate}` : undefined,
    };
  }
  if (article.collection === 'news') {
    return {
      ...common,
      publishedAt: article.publishedAt ? `publishedAt: ${article.publishedAt}` : undefined,
      externalUrl: article.externalUrl ? `externalUrl: ${JSON.stringify(article.externalUrl)}` : null,
      source: article.source ? `source: ${JSON.stringify(article.source)}` : null,
      featured: `featured: ${article.featured === true}`,
    };
  }
  return {
    ...common,
    publishedAt: article.publishedAt ? `publishedAt: ${article.publishedAt}` : undefined,
    summary: `summary: ${JSON.stringify(article.summary || '')}`,
    featured: `featured: ${article.featured === true}`,
  };
}

function preservedCommentLines(block: FrontmatterBlock): string[] {
  return block.lines.slice(1).filter((line) => {
    const trimmed = line.trim();
    return trimmed === '' || trimmed.startsWith('#');
  });
}

export function rebuildBlogMarkdown(originalMarkdown: string, article: NormalizedArticle): string {
  return rebuildArticleMarkdown(originalMarkdown, article);
}

export function rebuildArticleMarkdown(originalMarkdown: string, article: NormalizedArticle): string {
  const parsed = splitMarkdown(originalMarkdown);
  const replacements = replacementLines(article);
  const emitted = new Set<string>();
  const lines: string[] = [];

  for (const block of parsed.blocks) {
    if (Object.prototype.hasOwnProperty.call(replacements, block.key)) {
      const replacement = replacements[block.key];
      if (replacement === null) {
        lines.push(...preservedCommentLines(block));
        emitted.add(block.key);
        continue;
      }
      if (!replacement) {
        lines.push(...block.lines);
        continue;
      }
      lines.push(replacement);
      lines.push(...preservedCommentLines(block));
      emitted.add(block.key);
    } else {
      lines.push(...block.lines);
    }
  }

  const requiredOrder =
    article.collection === 'blog'
      ? ['title', 'description', 'pubDate', 'category', 'tags', 'isDraft']
      : article.collection === 'news'
        ? ['title', 'description', 'publishedAt', 'category', 'tags', 'externalUrl', 'source', 'isDraft', 'featured']
        : ['title', 'description', 'category', 'tags', 'publishedAt', 'summary', 'isDraft', 'featured'];
  for (const key of requiredOrder) {
    const replacement = replacements[key];
    if (!emitted.has(key) && replacement) {
      lines.push(replacement);
    }
  }

  const body = article.body.replace(/^(?:\s*\n)*-{3,}[ \t]*(?:\n|$)/, '');
  return ['---', ...lines, '---', '', body, ''].join('\n');
}
