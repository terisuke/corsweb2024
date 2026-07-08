import { normalizeCategory, type ArticleInput, type NormalizedArticle } from './validate';

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
      return [];
    }
  }
  return scalarValue(raw);
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
  const parsed = splitMarkdown(markdown);
  const frontmatter = parseFrontmatter(parsed.blocks);
  return {
    frontmatter,
    article: {
      slug,
      title: String(frontmatter.title ?? ''),
      description: String(frontmatter.description ?? ''),
      category: normalizeCategory(String(frontmatter.category ?? undefined)),
      tags: tagsValue(frontmatter.tags),
      body: parsed.body,
      isDraft: frontmatter.isDraft === true,
    },
  };
}

function replacementLines(article: NormalizedArticle): Record<string, string> {
  return {
    title: `title: ${JSON.stringify(article.title)}`,
    description: `description: ${JSON.stringify(article.description)}`,
    category: `category: "${article.category}"`,
    tags: `tags: ${JSON.stringify(article.tags)}`,
    isDraft: `isDraft: ${article.isDraft === true}`,
  };
}

export function rebuildBlogMarkdown(originalMarkdown: string, article: NormalizedArticle): string {
  const parsed = splitMarkdown(originalMarkdown);
  const replacements = replacementLines(article);
  const emitted = new Set<string>();
  const lines: string[] = [];

  for (const block of parsed.blocks) {
    const replacement = replacements[block.key];
    if (replacement) {
      lines.push(replacement);
      emitted.add(block.key);
    } else {
      lines.push(...block.lines);
    }
  }

  const requiredOrder = ['title', 'description', 'category', 'tags', 'isDraft'];
  for (const key of requiredOrder) {
    if (!emitted.has(key)) {
      lines.push(replacements[key]);
    }
  }

  const body = article.body.replace(/^(?:\s*\n)*-{3,}[ \t]*(?:\n|$)/, '');
  return ['---', ...lines, '---', '', body, ''].join('\n');
}
