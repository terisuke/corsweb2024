#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function translateBlogPost(japaneseContent) {
  const prompt = `Translate the following Japanese blog post to English. Translate technical terms appropriately and make it readable English. Return only the translated content without any additional explanations:

${japaneseContent}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let translatedText = response.text();
    
    // Clean up common AI response prefixes
    translatedText = translatedText.replace(/^Here's an? English translation[^:]*:\s*/i, '');
    translatedText = translatedText.replace(/^Here is the English translation[^:]*:\s*/i, '');
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
  const lines = frontmatterStr.split('\n');
  const frontmatter = {};
  let currentKey = null;
  let currentObject = null;
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
      // Handle continuation of array or object
      if (currentKey && line.trim().startsWith('-')) {
        // Array item
        if (!Array.isArray(frontmatter[currentKey])) {
          frontmatter[currentKey] = [];
        }
        let value = line.trim().substring(1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        frontmatter[currentKey].push(value);
      }
      continue;
    }
    
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    
    // Check if this is an indented property (part of an object)
    if (line.startsWith('  ') && currentObject) {
      // This is a property of the current object
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      currentObject[key] = value;
      continue;
    }
    
    // Check if this starts an object
    if (value === '' || value === '{}') {
      currentKey = key;
      currentObject = {};
      frontmatter[key] = currentObject;
      continue;
    }
    
    // Check if this is an array
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        frontmatter[key] = JSON.parse(value);
      } catch {
        // Fallback parsing
        const items = value.slice(1, -1).split(',').map(item => {
          let trimmed = item.trim();
          if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
              (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            trimmed = trimmed.slice(1, -1);
          }
          return trimmed;
        });
        frontmatter[key] = items;
      }
      currentKey = null;
      currentObject = null;
      continue;
    }
    
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Convert known boolean strings
    if (value === 'true') value = true;
    if (value === 'false') value = false;
    
    // Convert date strings to dates for known date fields
    if ((key === 'pubDate' || key === 'updatedDate') && value) {
      frontmatter[key] = new Date(value);
    } else {
      frontmatter[key] = value;
    }
    
    currentKey = key;
    currentObject = null;
  }
  
  return frontmatter;
}

function createEnglishFrontmatter(japaneseFrontmatter, translatedTitle, translatedDescription) {
  const englishFrontmatter = { ...japaneseFrontmatter };
  
  // Update key fields for English version
  englishFrontmatter.title = translatedTitle;
  englishFrontmatter.description = translatedDescription;
  englishFrontmatter.lang = 'en';
  englishFrontmatter.author = 'Terisuke';
  
  // Convert frontmatter object back to string
  let frontmatterStr = '';
  for (const [key, value] of Object.entries(englishFrontmatter)) {
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
      frontmatterStr += `${key}: [${tagsArray.map(tag => `"${tag}"`).join(', ')}]\n`;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
      // Handle nested objects (like image)
      if (Object.keys(value).length > 0) {
        frontmatterStr += `${key}:\n`;
        for (const [subKey, subValue] of Object.entries(value)) {
          if (typeof subValue === 'string' && subValue.includes('"')) {
            const escapedSubValue = subValue.replace(/'/g, "''");
            frontmatterStr += `  ${subKey}: '${escapedSubValue}'\n`;
          } else {
            frontmatterStr += `  ${subKey}: "${subValue}"\n`;
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
      // Handle string values with proper YAML escaping
      if (value.includes('"')) {
        // Use single quotes if string contains double quotes
        const escapedValue = value.replace(/'/g, "''");
        frontmatterStr += `${key}: '${escapedValue}'\n`;
      } else {
        frontmatterStr += `${key}: "${value}"\n`;
      }
    } else {
      // Handle other values
      frontmatterStr += `${key}: ${value}\n`;
    }
  }
  
  return frontmatterStr.trim();
}

async function translateFile(inputFile) {
  try {
    console.log(`Translating: ${inputFile}`);
    
    // Read Japanese blog post
    const japaneseContent = fs.readFileSync(inputFile, 'utf-8');
    const { frontmatter, body } = extractFrontmatter(japaneseContent);
    const parsedFrontmatter = parseFrontmatter(frontmatter);
    
    // Extract title and description for targeted translation
    const titleAndDescription = `Title: ${parsedFrontmatter.title}\nDescription: ${parsedFrontmatter.description}`;
    
    console.log('Translating title and description...');
    const prompt = `Translate the following to English, maintaining the exact format with "Title:" and "Description:" labels:

${titleAndDescription}`;

    let translatedTitleDesc;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      translatedTitleDesc = response.text().trim();
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
        // Handle quotes for YAML safety - use single quotes instead
        if (translatedTitle.includes('"')) {
          translatedTitle = translatedTitle.replace(/'/g, "''"); // Escape single quotes in YAML
        }
      } else if (line.toLowerCase().startsWith('description:')) {
        translatedDescription = line.substring(line.indexOf(':') + 1).trim();
        // Remove quotes if present
        if ((translatedDescription.startsWith('"') && translatedDescription.endsWith('"')) || 
            (translatedDescription.startsWith("'") && translatedDescription.endsWith("'"))) {
          translatedDescription = translatedDescription.slice(1, -1);
        }
        // Handle quotes for YAML safety - use single quotes instead  
        if (translatedDescription.includes('"')) {
          translatedDescription = translatedDescription.replace(/'/g, "''"); // Escape single quotes in YAML
        }
      }
    }
    
    console.log('Translating main content...');
    const translatedBody = await translateBlogPost(body);
    
    // Create English frontmatter
    const englishFrontmatter = createEnglishFrontmatter(
      parsedFrontmatter, 
      translatedTitle, 
      translatedDescription
    );
    
    // Combine frontmatter and translated body
    const englishContent = `---\n${englishFrontmatter}\n---\n${translatedBody}`;
    
    // Generate output file path
    const filename = path.basename(inputFile);
    const outputDir = path.join(path.dirname(__dirname), 'src/content/blog/en');
    const outputFile = path.join(outputDir, filename);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write English blog post
    fs.writeFileSync(outputFile, englishContent, 'utf-8');
    
    console.log(`✅ Translation complete: ${outputFile}`);
    return outputFile;
    
  } catch (error) {
    console.error(`❌ Translation failed for ${inputFile}:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/translate-blog.js <japanese-blog-file>');
    console.log('Example: node scripts/translate-blog.js src/content/blog/ja/ai-driven-development-workflow.md');
    process.exit(1);
  }
  
  const inputFile = args[0];
  
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}`);
    process.exit(1);
  }
  
  try {
    await translateFile(inputFile);
    console.log('🎉 Translation completed successfully!');
  } catch (error) {
    console.error('❌ Translation failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { translateFile };