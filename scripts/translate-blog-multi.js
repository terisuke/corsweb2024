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

// Language configurations
const LANGUAGES = {
  en: { name: 'English', author: 'Terisuke' },
  zh: { name: 'Chinese', author: 'Terisuke' },
  ko: { name: 'Korean', author: 'Terisuke' },
  es: { name: 'Spanish', author: 'Terisuke' }
};

// -----------------------------------------------------------------------------
// Utility helpers
// -----------------------------------------------------------------------------

/**
 * Escape a string so that it can be safely wrapped in double quotes inside
 * YAML front-matter. The function currently escapes backslashes and double
 * quotes, which are the only two characters that need special handling inside
 * double-quoted YAML scalars (single quotes are fine inside double quotes).
 *
 * NOTE: We purposefully do not touch newlines – if a title/description ever
 * contains one the caller should handle that case separately.
 */
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
    console.error('Translation error:', error);
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
  // Use js-yaml for robust parsing
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
      // Handle boolean values
      frontmatterStr += `${key}: ${value}\n`;
    } else if (value instanceof Date) {
      // Handle date values
      frontmatterStr += `${key}: ${value.toISOString().split('T')[0]}\n`;
    } else if (typeof value === 'string') {
      // Handle string values using unified escaping (always double-quoted)
      const escapedValue = escapeYAMLString(value);
      frontmatterStr += `${key}: "${escapedValue}"\n`;
    } else {
      // Handle other scalar values (numbers, null, etc.)
      frontmatterStr += `${key}: ${value}\n`;
    }
  }

  return frontmatterStr.trim();
}

async function translateFile(inputFile, targetLang) {
  try {
    const langConfig = LANGUAGES[targetLang];
    console.log(`Translating to ${langConfig.name}: ${inputFile}`);

    // Read Japanese blog post
    const japaneseContent = fs.readFileSync(inputFile, 'utf-8');
    const { frontmatter, body } = extractFrontmatter(japaneseContent);
    const parsedFrontmatter = parseFrontmatter(frontmatter);

    // Extract title and description for targeted translation
    const titleAndDescription = `Title: ${parsedFrontmatter.title}\nDescription: ${parsedFrontmatter.description}`;

    console.log(`Translating title and description to ${langConfig.name}...`);
    const prompt = `Translate the following to ${langConfig.name}, maintaining the exact format with "Title:" and "Description:" labels:

${titleAndDescription}`;

    let translatedTitleDesc;
    try {
      translatedTitleDesc = await rateLimiter.executeWithRetry(async () => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
      }, `Translating ${path.basename(inputFile)} to ${langConfig.name}`);
      console.log('Translation result:', translatedTitleDesc);
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }

    // Parse translated title and description more robustly
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
        // No further escaping here – will be handled uniformly later
      } else if (line.toLowerCase().startsWith('description:')) {
        translatedDescription = line.substring(line.indexOf(':') + 1).trim();
        // Remove quotes if present
        if ((translatedDescription.startsWith('"') && translatedDescription.endsWith('"')) ||
            (translatedDescription.startsWith("'") && translatedDescription.endsWith("'"))) {
          translatedDescription = translatedDescription.slice(1, -1);
        }
      }
    }

    // Translate the body content
    console.log(`Translating body content to ${langConfig.name}...`);
    const translatedBody = await rateLimiter.executeWithRetry(
      () => translateBlogPost(body, targetLang),
      `Translating body of ${path.basename(inputFile)} to ${langConfig.name}`
    );

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
    console.log(`✅ Successfully translated to ${langConfig.name}: ${outputFile}`);

    return outputFile;
  } catch (error) {
    console.error(`❌ Error translating ${inputFile} to ${targetLang}:`, error);
    throw error;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node translate-blog-multi.js <target-language> <input-file>');
    console.log('Target languages: en, zh, ko, es');
    console.log('Example: node translate-blog-multi.js zh src/content/blog/ja/your-post.md');
    process.exit(1);
  }

  const targetLang = args[0];
  const inputFile = args[1];

  if (!LANGUAGES[targetLang]) {
    console.error(`❌ Invalid target language: ${targetLang}`);
    console.error('Valid languages: en, zh, ko, es');
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}`);
    process.exit(1);
  }

  try {
    await translateFile(inputFile, targetLang);
    console.log('✨ Translation complete!');
  } catch (error) {
    console.error('❌ Translation failed:', error);
    process.exit(1);
  }
}

main();