// Build i18n search index from markdown files
// Generates unified search index + per-language content manifests

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../src/docs/content');
const outputDir = path.join(__dirname, '../public/docs');

// Supported languages
const LANGUAGES = ['en', 'es'];

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Common words to exclude from concept extraction
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out',
  'day', 'has', 'his', 'him', 'how', 'its', 'may', 'now', 'old', 'see', 'than', 'that', 'this',
  'with', 'from', 'have', 'more', 'will', 'your', 'what', 'when', 'which', 'their', 'there',
  'would', 'been', 'could', 'should', 'they', 'them', 'only', 'also', 'most', 'into', 'over',
  'such', 'very', 'after', 'just', 'before', 'other', 'some', 'these', 'about', 'above',
  'below', 'between', 'during', 'through', 'under', 'because', 'each', 'same', 'then', 'while',
  'where', 'being', 'does', 'doing', 'made', 'make', 'many', 'much', 'need', 'only', 'once',
  'over', 'part', 'take', 'than', 'very', 'well', 'even', 'back', 'here', 'only', 'both',
  'down', 'find', 'get', 'give', 'go', 'keep', 'let', 'new', 'now', 'put', 'say', 'she',
  'too', 'use', 'via', 'yes', 'can', 'may', 'must', 'use', 'used', 'using', 'like', 'including'
]);

function extractPlainText(markdown) {
  return markdown
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`{3}[\s\S]*?`{3}/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/>/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

function extractHeadings(body) {
  // Extract headings with their positions for smart navigation
  const headings = [];
  const lines = body.split('\n');
  let position = 0;
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      headings.push({
        level,
        text,
        id,
        line: index + 1,
        position
      });
    }
    position += line.length + 1;
  });
  
  return headings;
}

function extractConcepts(body) {
  // Extract important terms, concepts, and relationships
  const terms = new Set();
  const concepts = [];
  
  // 1. Extract from code blocks (like `direct`, `request`, etc.)
  const codeBlockTerms = body.match(/`([^`]+)`/g);
  if (codeBlockTerms) {
    codeBlockTerms.forEach(term => {
      const clean = term.replace(/`/g, '').trim();
      if (clean.length > 1 && clean.length < 50 && !STOP_WORDS.has(clean.toLowerCase())) {
        terms.add(clean.toLowerCase());
        concepts.push({
          term: clean.toLowerCase(),
          type: 'code_value',
          context: 'code'
        });
      }
    });
  }
  
  // 2. Extract from bold text (important concepts)
  const boldTerms = body.match(/\*\*([^*]+)\*\*/g);
  if (boldTerms) {
    boldTerms.forEach(term => {
      const clean = term.replace(/\*\*/g, '').trim();
      if (clean.length > 2 && clean.length < 50 && !STOP_WORDS.has(clean.toLowerCase())) {
        terms.add(clean.toLowerCase());
        concepts.push({
          term: clean.toLowerCase(),
          type: 'important_term',
          context: 'bold'
        });
      }
    });
  }
  
  // 3. Extract table values (enum values, field names, etc.)
  const tableValues = body.match(/\|([^|]+)\|/g);
  if (tableValues) {
    tableValues.forEach(val => {
      const clean = val.replace(/\|/g, '').trim();
      // Filter out separator rows (----, ---, etc.)
      if (clean.length > 2 && clean.length < 50 && 
          !clean.match(/^-+$/) && !STOP_WORDS.has(clean.toLowerCase())) {
        terms.add(clean.toLowerCase());
      }
    });
  }
  
  // 4. Extract headings as concepts (they represent major topics)
  const headingMatches = body.match(/^#{1,3}\s+(.+)$/gm);
  if (headingMatches) {
    headingMatches.forEach(heading => {
      const clean = heading.replace(/^#+\s*/, '').trim();
      if (clean.length > 2 && clean.length < 60) {
        // Add the full heading as a concept
        terms.add(clean.toLowerCase());
        
        // Also add significant words from the heading
        const words = clean.split(/\s+/).filter(w => 
          w.length > 3 && !STOP_WORDS.has(w.toLowerCase())
        );
        words.forEach(word => terms.add(word.toLowerCase()));
      }
    });
  }
  
  // 5. Extract meaningful phrases (2-4 words)
  const lines = body.split('\n');
  lines.forEach(line => {
    // Skip markdown syntax lines
    if (line.match(/^[#|*`>\-|]/)) return;
    
    const cleanLine = line.replace(/^#+\s/, '').replace(/\*\*|\_\_|\*|_|`/g, '');
    const words = cleanLine.split(/\s+/).filter(w => 
      w.length > 3 && !STOP_WORDS.has(w.toLowerCase()) && /^[a-z]/i.test(w)
    );
    
    // Build 2-4 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const twoWords = words.slice(i, i + 2).join(' ');
      if (twoWords.length < 40) {
        terms.add(twoWords.toLowerCase());
      }
      
      if (i < words.length - 2) {
        const threeWords = words.slice(i, i + 3).join(' ');
        if (threeWords.length < 50) {
          terms.add(threeWords.toLowerCase());
        }
      }
      
      if (i < words.length - 3) {
        const fourWords = words.slice(i, i + 4).join(' ');
        if (fourWords.length < 60) {
          terms.add(fourWords.toLowerCase());
        }
      }
    }
  });
  
  return Array.from(terms);
}

function buildCrossReferenceIndex(pages) {
  // Build a cross-reference: term -> pages mapping
  const crossRef = new Map();
  
  pages.forEach(page => {
    // Add all keywords (now combined from both languages in searchKeywords)
    const allTerms = [
      ...(page.searchKeywords || []),
      ...extractConcepts(page.content?.en || ''),
      ...extractConcepts(page.content?.es || '')
    ];
    
    allTerms.forEach(term => {
      let existing = crossRef.get(term);
      
      // Initialize as array if needed
      if (existing === undefined) {
        existing = [];
        crossRef.set(term, existing);
      }
      
      // Only add if it's an array and doesn't already have this page
      if (Array.isArray(existing) && !existing.find(p => p.slug === page.slug)) {
        existing.push({ 
          slug: page.slug, 
          title: page.title?.en || page.slug 
        });
      }
    });
  });
  
  // Convert to array format for JSON serialization
  const crossRefArray = [];
  crossRef.forEach((value, term) => {
    if (Array.isArray(value) && value.length > 0) {
      crossRefArray.push({ term, pages: value });
    }
  });
  
  return crossRefArray;
}

function extractBody(content) {
  if (!content) return '';
  return content.replace(/^---[\s\S]*?---\n/, '');
}

// Process a single language directory
function processLanguageDir(langDir, lang) {
  const pages = [];
  const contentMap = {};
  const files = [];

  // Recursively collect all .md files
  function walkDir(dir, basePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath, relativePath);
      } else if (entry.name.endsWith('.md')) {
        files.push({ fullPath, relativePath });
      }
    });
  }
  
  walkDir(langDir);
  
  files.forEach((fileInfo) => {
    const { fullPath, relativePath } = fileInfo;
    const fileName = path.basename(fullPath);
    
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    const { data, content: body } = matter(fileContent);
    const slug = fileName.replace('.md', '');
    const section = relativePath.replace(/\\/g, '/').replace(`.md`, '').replace(`content/${lang}/`, '');
    
    // Extract plain text and concepts
    const plainText = extractPlainText(body);
    const extractedConcepts = extractConcepts(body);
    const headings = extractHeadings(body);
    
    // Store content for manifest
    contentMap[slug] = {
      body: extractBody(body),
      section,
      lastUpdated: data.lastUpdated || null
    };
    
    pages.push({
      slug,
      section,
      title: data.title || slug,
      description: data.description || '',
      keywords: [...new Set([...(data.keywords || []), ...extractedConcepts])],
      content: plainText,
      headings,
      relatedRoutes: data.relatedRoutes || [],
      lastUpdated: data.lastUpdated || null,
      lang
    });
  });
  
  return { pages, contentMap };
}

// Process all languages and build unified index
function buildUnifiedIndex() {
  const allPages = new Map(); // slug -> page data
  const languageContent = {}; // lang -> slug -> content
  const languageManifests = {}; // lang -> manifest
  
  LANGUAGES.forEach(lang => {
    const langDir = path.join(contentDir, lang);
    if (!fs.existsSync(langDir)) {
      console.log(`Skipping ${lang}/ - directory not found`);
      return;
    }
    
    const { pages, contentMap } = processLanguageDir(langDir, lang);
    
    // Store language-specific content
    languageContent[lang] = contentMap;
    languageManifests[lang] = {};
    
    // Merge into unified pages
    pages.forEach(page => {
      const existing = allPages.get(page.slug);
      
      if (existing) {
        // Merge language-specific fields
        existing.title = existing.title || {};
        existing.title[lang] = page.title;
        
        existing.description = existing.description || {};
        existing.description[lang] = page.description;
        
        existing.keywords = existing.keywords || { en: [], es: [] };
        existing.keywords[lang] = page.keywords;
        
        // For searchKeywords, combine both language keywords
        existing.searchKeywords = [
          ...(existing.searchKeywords || []),
          ...page.keywords
        ];
        
        existing.content = existing.content || {};
        existing.content[lang] = page.content;
        
        existing.headings = existing.headings || { en: [], es: [] };
        existing.headings[lang] = page.headings;
        
        // Keep other metadata from first found
        if (!existing.relatedRoutes?.length && page.relatedRoutes?.length) {
          existing.relatedRoutes = page.relatedRoutes;
        }
      } else {
        // Create new unified page entry
        allPages.set(page.slug, {
          slug: page.slug,
          section: page.section,
          title: { [lang]: page.title },
          description: { [lang]: page.description },
          keywords: { [lang]: page.keywords },
          // Flatten keywords for search - Fuse needs flat arrays
          searchKeywords: page.keywords,
          content: { [lang]: page.content },
          headings: { [lang]: page.headings },
          relatedRoutes: page.relatedRoutes || [],
          lastUpdated: page.lastUpdated
        });
      }
      
      // Store in language manifest
      languageManifests[lang][page.slug] = {
        body: contentMap[page.slug]?.body || '',
        section: page.section,
        lastUpdated: page.lastUpdated
      };
    });
    
    console.log(`✓ Processed ${lang}/: ${pages.length} pages`);
  });
  
  // Convert to array for search index
  const unifiedIndex = Array.from(allPages.values());
  
  return { unifiedIndex, languageManifests };
}

// Main execution
console.log('Building i18n documentation index...\n');

const { unifiedIndex, languageManifests } = buildUnifiedIndex();

// Build cross-reference index
const crossRefIndex = buildCrossReferenceIndex(unifiedIndex);

// Write unified search index
fs.writeFileSync(
  path.join(outputDir, 'search-index.json'),
  JSON.stringify(unifiedIndex, null, 2)
);

// Write per-language content manifests
LANGUAGES.forEach(lang => {
  const manifestDir = path.join(outputDir, lang);
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(manifestDir, 'content-manifest.json'),
    JSON.stringify(languageManifests[lang] || {}, null, 2)
  );
  
  console.log(`✓ ${lang}/ content manifest: ${Object.keys(languageManifests[lang] || {}).length} pages`);
});

// Write cross-reference index
fs.writeFileSync(
  path.join(outputDir, 'cross-ref.json'),
  JSON.stringify(crossRefIndex, null, 2)
);

console.log(`\n✓ Unified search index: ${unifiedIndex.length} pages`);
console.log(`✓ Cross-reference index: ${crossRefIndex.length} terms`);
console.log(`\nOutput directories:`);
console.log(`  - public/docs/search-index.json`);
console.log(`  - public/docs/en/content-manifest.json`);
console.log(`  - public/docs/es/content-manifest.json`);
console.log(`  - public/docs/cross-ref.json`);