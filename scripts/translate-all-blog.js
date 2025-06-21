#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateFile } from './translate-blog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function translateAllJapanesePosts() {
  const japaneseBlogDir = path.join(path.dirname(__dirname), 'src/content/blog/ja');
  const englishBlogDir = path.join(path.dirname(__dirname), 'src/content/blog/en');
  
  console.log('🚀 Starting automatic translation of all Japanese blog posts...');
  
  if (!fs.existsSync(japaneseBlogDir)) {
    console.error('❌ Japanese blog directory not found:', japaneseBlogDir);
    process.exit(1);
  }
  
  // Ensure English directory exists
  if (!fs.existsSync(englishBlogDir)) {
    fs.mkdirSync(englishBlogDir, { recursive: true });
    console.log('📁 Created English blog directory:', englishBlogDir);
  }
  
  // Get all markdown files in Japanese directory
  const files = fs.readdirSync(japaneseBlogDir)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(japaneseBlogDir, file));
  
  if (files.length === 0) {
    console.log('📝 No Japanese blog posts found to translate.');
    return;
  }
  
  console.log(`📚 Found ${files.length} Japanese blog post(s) to translate:`);
  files.forEach((file, index) => {
    console.log(`  ${index + 1}. ${path.basename(file)}`);
  });
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    try {
      console.log(`\n🔄 Translating: ${path.basename(file)}`);
      await translateFile(file);
      successCount++;
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to translate ${path.basename(file)}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Translation Summary:');
  console.log(`  ✅ Successfully translated: ${successCount} files`);
  console.log(`  ❌ Failed to translate: ${errorCount} files`);
  
  if (successCount > 0) {
    console.log('\n🎉 Translation workflow completed!');
    console.log('📁 English blog posts are available in:', englishBlogDir);
  }
}

async function main() {
  try {
    await translateAllJapanesePosts();
  } catch (error) {
    console.error('❌ Translation workflow failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}