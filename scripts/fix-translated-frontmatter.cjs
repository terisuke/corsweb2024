#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Extract frontmatter from content
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: '', body: content };
  }

  return {
    frontmatter: match[1],
    body: match[2]
  };
}

// Extract title from body content
function extractTitleFromBody(body) {
  const lines = body.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.substring(2).trim();
    }
  }
  return null;
}

// Extract description from body content
function extractDescriptionFromBody(body) {
  const lines = body.split('\n');
  let foundTitle = false;
  let description = '';

  for (const line of lines) {
    if (line.startsWith('# ')) {
      foundTitle = true;
      continue;
    }
    if (foundTitle && line.trim() && !line.startsWith('![') && !line.startsWith('#')) {
      // Get first paragraph after title as description
      description = line.trim();
      break;
    }
  }

  return description.substring(0, 150) + (description.length > 150 ? '...' : '');
}

// Process a single file
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = extractFrontmatter(content);

  // Extract title and description from body
  const newTitle = extractTitleFromBody(body);
  const newDescription = extractDescriptionFromBody(body);

  if (!newTitle) {
    console.log(`  ⚠️ No title found in body: ${filePath}`);
    return false;
  }

  // Update frontmatter
  let updatedFrontmatter = frontmatter;

  // Replace title if it exists and is in Japanese
  const titleMatch = frontmatter.match(/^title:\s*"([^"]+)"/m);
  if (titleMatch && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(titleMatch[1])) {
    updatedFrontmatter = updatedFrontmatter.replace(
      /^title:\s*"[^"]+"/m,
      `title: "${newTitle.replace(/"/g, '\\"')}"`
    );
    console.log(`  ✅ Updated title: ${newTitle.substring(0, 50)}...`);
  }

  // Replace description if it's in Japanese or missing
  const descMatch = frontmatter.match(/^description:\s*"([^"]+)"/m);
  if (descMatch && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(descMatch[1])) {
    updatedFrontmatter = updatedFrontmatter.replace(
      /^description:\s*"[^"]+"/m,
      `description: "${newDescription.replace(/"/g, '\\"')}"`
    );
    console.log(`  ✅ Updated description: ${newDescription.substring(0, 50)}...`);
  }

  // Write back the file
  const updatedContent = `---\n${updatedFrontmatter}\n---\n${body}`;
  fs.writeFileSync(filePath, updatedContent, 'utf-8');

  return true;
}

// Process all files in a language directory
function processLanguageDir(langCode) {
  const dirPath = path.join(__dirname, '..', 'src', 'content', 'blog', langCode);

  if (!fs.existsSync(dirPath)) {
    console.log(`❌ Directory not found: ${dirPath}`);
    return;
  }

  console.log(`\n📁 Processing ${langCode.toUpperCase()} blog posts...`);

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
  let updated = 0;

  for (const file of files) {
    console.log(`\n  📄 ${file}`);
    const filePath = path.join(dirPath, file);
    if (processFile(filePath)) {
      updated++;
    }
  }

  console.log(`\n  📊 Updated ${updated}/${files.length} files in ${langCode}`);
  return updated;
}

// Main execution
function main() {
  console.log('🔧 Fixing translated blog post frontmatter...\n');

  const languages = ['zh', 'ko', 'es'];
  let totalUpdated = 0;

  for (const lang of languages) {
    totalUpdated += processLanguageDir(lang) || 0;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ Total files updated: ${totalUpdated}`);
  console.log('✅ Frontmatter fix complete!');
}

// Run the script
main();