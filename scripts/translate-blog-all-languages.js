#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import yaml from 'js-yaml';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import RateLimiter from './rate-limiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in environment variables. Please add it to the .env file.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });

// Initialize rate limiter with conservative settings for Gemini API
const rateLimiter = new RateLimiter({
  requestsPerMinute: 15, // Conservative limit for Gemini API
  maxRetries: 3,
  baseDelay: 2000, // 2 seconds base delay
  maxDelay: 60000 // 60 seconds max delay
});

// Language configurations - translate to all 4 languages
const LANGUAGES = {
  en: { name: 'English', author: 'Terisuke' },
  zh: { name: 'Chinese', author: 'Terisuke' },
  ko: { name: 'Korean', author: 'Terisuke' },
  es: { name: 'Spanish', author: 'Terisuke' }
};

// -----------------------------------------------------------------------------
// Utility helpers
// -----------------------------------------------------------------------------

function escapeYAMLString(str) {
  return str
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/"/g, '\\"');     // Escape remaining double quotes
}

async function translateBlogPost(japaneseContent, targetLang) {
  const langConfig = LANGUAGES[targetLang];
  const prompt = `Translate the following Japanese blog post to ${langConfig.name}. Translate technical terms appropriately and make it readable ${langConfig.name}. Return only the translated content without any additional explanations:

${japaneseContent}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let translatedText = response.text();

    // Clean up common AI response prefixes
    translatedText = translatedText.replace(/^Here's an? ${langConfig.name} translation[^:]*:\s*/i, '');
    translatedText = translatedText.replace(/^Here is the ${langConfig.name} translation[^:]*:\s*/i, '');
    translatedText = translatedText.replace(/^Translation:\s*/i, '');

    return translatedText.trim();
  } catch (error) {
    console.error(`Translation error for ${targetLang}:`, error);
    throw error;
  }
}

function extractFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('Invalid frontmatter format');
  }

  return {
    frontmatter: match[1],
    body: match[2]
  };
}

function parseFrontmatter(frontmatterStr) {
  return yaml.load(frontmatterStr);
}

function createTranslatedFrontmatter(japaneseFrontmatter, translatedTitle, translatedDescription, targetLang) {
  const translatedFrontmatter = { ...japaneseFrontmatter };
  const langConfig = LANGUAGES[targetLang];

  // Update key fields for translated version
  translatedFrontmatter.title = translatedTitle;
  translatedFrontmatter.description = translatedDescription;
  translatedFrontmatter.lang = targetLang;
  translatedFrontmatter.author = langConfig.author;

  // Convert frontmatter object back to string
  let frontmatterStr = '';
  for (const [key, value] of Object.entries(translatedFrontmatter)) {
    if (key === 'tags') {
      // Handle tags properly - parse if string, keep if array
      let tagsArray = value;
      if (typeof value === 'string') {
        // Try to parse as array string
        try {
          tagsArray = JSON.parse(value.replace(/'/g, '"'));
        } catch {
          tagsArray = [value];
        }
      }
      frontmatterStr += `${key}: [${tagsArray.map(tag => `"${escapeYAMLString(tag)}"`).join(', ')}]\n`;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
      // Handle nested objects (like image)
      if (Object.keys(value).length > 0) {
        frontmatterStr += `${key}:\n`;
        for (const [subKey, subValue] of Object.entries(value)) {
          if (typeof subValue === 'string') {
            const escapedSubValue = escapeYAMLString(subValue);
            frontmatterStr += `  ${subKey}: "${escapedSubValue}"\n`;
          } else {
            frontmatterStr += `  ${subKey}: ${subValue}\n`;
          }
        }
      }
    } else if (typeof value === 'boolean') {
      frontmatterStr += `${key}: ${value}\n`;
    } else if (value instanceof Date) {
      frontmatterStr += `${key}: ${value.toISOString().split('T')[0]}\n`;
    } else if (typeof value === 'string') {
      const escapedValue = escapeYAMLString(value);
      frontmatterStr += `${key}: "${escapedValue}"\n`;
    } else {
      frontmatterStr += `${key}: ${value}\n`;
    }
  }

  return frontmatterStr.trim();
}

async function translateToLanguage(inputFile, targetLang, body, parsedFrontmatter) {
  const langConfig = LANGUAGES[targetLang];

  console.log(`\n📝 Translating to ${langConfig.name}...`);

  // Extract title and description for targeted translation
  const titleAndDescription = `Title: ${parsedFrontmatter.title}\nDescription: ${parsedFrontmatter.description}`;

  console.log(`  Translating title and description...`);
  const prompt = `Translate the following to ${langConfig.name}, maintaining the exact format with "Title:" and "Description:" labels:

${titleAndDescription}`;

  let translatedTitleDesc;
  try {
    translatedTitleDesc = await rateLimiter.executeWithRetry(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    }, `Translating metadata to ${langConfig.name}`);
  } catch (error) {
    console.error(`  ❌ Translation error for ${targetLang}:`, error);
    return null;
  }

  // Parse translated title and description
  console.log(`  Raw translated text: ${translatedTitleDesc.substring(0, 200)}...`);
  const lines = translatedTitleDesc.split('\n');
  let translatedTitle = parsedFrontmatter.title;
  let translatedDescription = parsedFrontmatter.description;

  for (const line of lines) {
    if (line.toLowerCase().startsWith('title:')) {
      translatedTitle = line.substring(line.indexOf(':') + 1).trim();
      // Remove quotes if present
      if ((translatedTitle.startsWith('"') && translatedTitle.endsWith('"')) ||
          (translatedTitle.startsWith("'") && translatedTitle.endsWith("'"))) {
        translatedTitle = translatedTitle.slice(1, -1);
      }
    } else if (line.toLowerCase().startsWith('description:')) {
      translatedDescription = line.substring(line.indexOf(':') + 1).trim();
      // Remove quotes if present
      if ((translatedDescription.startsWith('"') && translatedDescription.endsWith('"')) ||
          (translatedDescription.startsWith("'") && translatedDescription.endsWith("'"))) {
        translatedDescription = translatedDescription.slice(1, -1);
      }
    }
  }
  console.log(`  Translated title: ${translatedTitle}`);
  console.log(`  Translated description: ${translatedDescription.substring(0, 100)}...`);

  // Translate the body content
  console.log(`  Translating body content...`);
  let translatedBody;
  try {
    translatedBody = await rateLimiter.executeWithRetry(
      () => translateBlogPost(body, targetLang),
      `Translating body to ${langConfig.name}`
    );
  } catch (error) {
    console.error(`  ❌ Body translation error for ${targetLang}:`, error);
    return null;
  }

  // Create translated frontmatter
  const translatedFrontmatterStr = createTranslatedFrontmatter(
    parsedFrontmatter,
    translatedTitle,
    translatedDescription,
    targetLang
  );

  // Combine frontmatter and body
  const translatedContent = `---\n${translatedFrontmatterStr}\n---\n\n${translatedBody}`;

  // Determine output file path
  const inputDir = path.dirname(inputFile);
  const parentDir = path.dirname(inputDir);
  const filename = path.basename(inputFile);
  const outputDir = path.join(parentDir, targetLang);
  const outputFile = path.join(outputDir, filename);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write translated file
  fs.writeFileSync(outputFile, translatedContent, 'utf-8');
  console.log(`  ✅ Successfully saved to: ${outputFile}`);

  return outputFile;
}

async function translateFileToAllLanguages(inputFile) {
  try {
    console.log(`\n🚀 Starting translation of: ${inputFile}`);
    console.log('Target languages: English, Chinese, Korean, Spanish');

    // Read Japanese blog post
    const japaneseContent = fs.readFileSync(inputFile, 'utf-8');
    const { frontmatter, body } = extractFrontmatter(japaneseContent);
    const parsedFrontmatter = parseFrontmatter(frontmatter);

    const results = {
      success: [],
      failed: []
    };

    // Translate to all 4 languages sequentially to respect rate limits
    for (const [langCode, langConfig] of Object.entries(LANGUAGES)) {
      const result = await translateToLanguage(inputFile, langCode, body, parsedFrontmatter);
      if (result) {
        results.success.push({ lang: langConfig.name, file: result });
      } else {
        results.failed.push({ lang: langConfig.name });
      }

      // Add a small delay between languages to respect rate limits
      if (langCode !== 'es') { // Don't delay after the last language
        console.log('  ⏳ Waiting before next translation...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Report results
    console.log('\n📊 Translation Summary:');
    console.log('━'.repeat(50));

    if (results.success.length > 0) {
      console.log('\n✅ Successfully translated to:');
      results.success.forEach(({ lang, file }) => {
        console.log(`   • ${lang}: ${file}`);
      });
    }

    if (results.failed.length > 0) {
      console.log('\n❌ Failed translations:');
      results.failed.forEach(({ lang }) => {
        console.log(`   • ${lang}`);
      });
    }

    return results;
  } catch (error) {
    console.error(`\n❌ Critical error translating ${inputFile}:`, error);
    throw error;
  }
}

async function translateAllBlogPosts() {
  const blogDir = path.join(__dirname, '../src/content/blog/ja');
  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

  console.log('═'.repeat(60));
  console.log('   🌐 BATCH TRANSLATION TO ALL LANGUAGES');
  console.log('═'.repeat(60));
  console.log(`\nFound ${files.length} Japanese blog posts to translate`);
  console.log('Target languages: English, Chinese, Korean, Spanish\n');

  const overallResults = {
    totalFiles: files.length,
    successByLang: { en: 0, zh: 0, ko: 0, es: 0 },
    failedFiles: []
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputFile = path.join(blogDir, file);

    console.log('\n' + '─'.repeat(60));
    console.log(`📄 [${i + 1}/${files.length}] Processing: ${file}`);
    console.log('─'.repeat(60));

    try {
      const results = await translateFileToAllLanguages(inputFile);

      // Update statistics
      results.success.forEach(({ lang }) => {
        const langCode = Object.entries(LANGUAGES).find(([_, config]) => config.name === lang)?.[0];
        if (langCode) {
          overallResults.successByLang[langCode]++;
        }
      });

      if (results.failed.length === 4) {
        overallResults.failedFiles.push(file);
      }

      // Add delay between files to respect rate limits
      if (i < files.length - 1) {
        console.log('\n⏳ Waiting before next file...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`❌ Failed to process ${file}:`, error);
      overallResults.failedFiles.push(file);
    }
  }

  // Final summary
  console.log('\n' + '═'.repeat(60));
  console.log('   📊 FINAL TRANSLATION SUMMARY');
  console.log('═'.repeat(60));
  console.log(`\nTotal files processed: ${overallResults.totalFiles}`);
  console.log('\nTranslations completed by language:');
  console.log(`  • English: ${overallResults.successByLang.en}/${overallResults.totalFiles}`);
  console.log(`  • Chinese: ${overallResults.successByLang.zh}/${overallResults.totalFiles}`);
  console.log(`  • Korean: ${overallResults.successByLang.ko}/${overallResults.totalFiles}`);
  console.log(`  • Spanish: ${overallResults.successByLang.es}/${overallResults.totalFiles}`);

  if (overallResults.failedFiles.length > 0) {
    console.log('\n❌ Files that completely failed:');
    overallResults.failedFiles.forEach(file => {
      console.log(`  • ${file}`);
    });
  }

  console.log('\n✨ Batch translation complete!');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // No arguments - translate all blog posts
    await translateAllBlogPosts();
  } else if (args.length === 1) {
    // Single file specified
    const inputFile = args[0];

    if (!fs.existsSync(inputFile)) {
      console.error(`❌ File not found: ${inputFile}`);
      process.exit(1);
    }

    try {
      await translateFileToAllLanguages(inputFile);
      console.log('\n✨ Translation complete!');
    } catch (error) {
      console.error('❌ Translation failed:', error);
      process.exit(1);
    }
  } else {
    console.log('Usage:');
    console.log('  Translate single file to all languages:');
    console.log('    node translate-blog-all-languages.js <input-file>');
    console.log('');
    console.log('  Translate all Japanese blog posts:');
    console.log('    node translate-blog-all-languages.js');
    console.log('');
    console.log('Example:');
    console.log('  node translate-blog-all-languages.js src/content/blog/ja/your-post.md');
    process.exit(1);
  }
}

main();