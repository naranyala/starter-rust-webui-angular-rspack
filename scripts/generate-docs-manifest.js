#!/usr/bin/env node

/**
 * Documentation Manifest Generator
 * 
 * Scans the docs folder and generates a manifest file listing all markdown files.
 * This manifest is used by the frontend to dynamically generate the documentation menu.
 * 
 * Features:
 * - Automatically discovers all .md files in docs/
 * - Extracts metadata (title, description) from frontmatter or first heading
 * - Generates sorted, categorized menu structure
 * - Creates TypeScript-compatible manifest file
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DOCS_DIR = join(__dirname, '..', 'docs');
const OUTPUT_DIR = join(__dirname, '..', 'frontend', 'src', 'app', 'constants');
const OUTPUT_FILE = join(OUTPUT_DIR, 'docs-manifest.ts');

// Category configuration for organizing docs
const CATEGORIES = {
  '0-index': { label: 'Overview', icon: '📖', order: 0 },
  '01-': { label: 'Getting Started', icon: '🚀', order: 1 },
  '02-': { label: 'Database Guides', icon: '🗄️', order: 2 },
  '03-': { label: 'Database Guides', icon: '🗄️', order: 2 },
  '04-': { label: 'API Reference', icon: '📚', order: 3 },
  '05-': { label: 'Security', icon: '🔒', order: 4 },
  '06-': { label: 'Deployment', icon: '📦', order: 5 },
  'PROFESSIONAL': { label: 'Professional Features', icon: '🎨', order: 6 },
  'DATA_': { label: 'Data Management', icon: '💾', order: 7 },
  'SECURITY_': { label: 'Security', icon: '🛡️', order: 4 },
  'SECURE_': { label: 'Deployment', icon: '🔐', order: 5 },
  'REFACTORING': { label: 'Refactoring', icon: '♻️', order: 8 },
  'ABSTRACTION': { label: 'Architecture', icon: '🏗️', order: 9 },
  'NEW_DEMO': { label: 'New Features', icon: '✨', order: 10 },
  'DEMO_': { label: 'New Features', icon: '✨', order: 10 },
};

// Default icons by category
const DEFAULT_ICONS = {
  'overview': '📖',
  'getting': '🚀',
  'database': '🗄️',
  'api': '📚',
  'security': '🔒',
  'deployment': '📦',
  'refactoring': '♻️',
  'architecture': '🏗️',
  'professional': '🎨',
  'data': '💾',
  'demo': '✨',
  'default': '📄',
};

/**
 * Extract metadata from markdown file
 */
function extractMetadata(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  
  // Try to extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let title = '';
  let description = '';
  let icon = '';
  
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?$/m);
    const descMatch = frontmatter.match(/^description:\s*["']?(.+?)["']?$/m);
    const iconMatch = frontmatter.match(/^icon:\s*["']?(.+?)["']?$/m);
    
    if (titleMatch) title = titleMatch[1].trim();
    if (descMatch) description = descMatch[1].trim();
    if (iconMatch) icon = iconMatch[1].trim();
  }
  
  // Fallback: extract from first heading
  if (!title) {
    const headingMatch = content.match(/^#\s+(.+?)$/m);
    if (headingMatch) {
      title = headingMatch[1].trim();
    }
  }
  
  // Fallback: use filename
  if (!title) {
    title = basename(filePath, '.md')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  return { title, description, icon };
}

/**
 * Determine category and icon for a document
 */
function categorizeDoc(filename, metadata) {
  const upperName = filename.toUpperCase();
  
  // Find matching category
  for (const [prefix, config] of Object.entries(CATEGORIES)) {
    if (upperName.startsWith(prefix)) {
      return {
        category: config.label,
        icon: metadata.icon || config.icon,
        order: config.order,
      };
    }
  }
  
  // Fallback: infer from filename
  const lowerName = filename.toLowerCase();
  for (const [key, icon] of Object.entries(DEFAULT_ICONS)) {
    if (lowerName.includes(key)) {
      return {
        category: key.charAt(0).toUpperCase() + key.slice(1),
        icon,
        order: 99,
      };
    }
  }
  
  // Default
  return {
    category: 'Documentation',
    icon: metadata.icon || DEFAULT_ICONS.default,
    order: 99,
  };
}

/**
 * Scan docs directory and generate manifest
 */
function generateManifest() {
  console.log('📚 Generating documentation manifest...');
  console.log(`📂 Scanning: ${DOCS_DIR}`);
  
  if (!existsSync(DOCS_DIR)) {
    console.error(`❌ Docs directory not found: ${DOCS_DIR}`);
    process.exit(1);
  }
  
  // Get all markdown files
  const files = readdirSync(DOCS_DIR)
    .filter(file => file.endsWith('.md'))
    .filter(file => file !== 'README.md'); // Exclude README
  
  console.log(`📄 Found ${files.length} markdown files`);
  
  // Process each file
  const docs = files.map(file => {
    const filePath = join(DOCS_DIR, file);
    const id = basename(file, '.md');
    const metadata = extractMetadata(filePath);
    const categorization = categorizeDoc(id, metadata);
    
    return {
      id,
      fileId: id,
      label: metadata.title,
      filename: file,
      path: `docs/${file}`,
      category: categorization.category,
      icon: categorization.icon,
      order: categorization.order,
      description: metadata.description,
    };
  });
  
  // Sort by order, then alphabetically
  docs.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.id.localeCompare(b.id);
  });
  
  // Group by category
  const categories = {};
  docs.forEach(doc => {
    if (!categories[doc.category]) {
      categories[doc.category] = [];
    }
    categories[doc.category].push(doc);
  });
  
  // Generate TypeScript file
  const manifestContent = `/**
 * Auto-generated Documentation Manifest
 * 
 * This file is automatically generated by scanning the docs/ folder.
 * Do not edit manually - changes will be overwritten.
 * 
 * To regenerate: bun run generate:docs-manifest
 * Generated: ${new Date().toISOString()}
 */

export const DOCS_MANIFEST = ${JSON.stringify(docs, null, 2)};

export const DOCS_BY_CATEGORY = ${JSON.stringify(
    Object.entries(categories).map(([label, items]) => ({
      label,
      icon: items[0].icon,
      order: items[0].order,
      items,
    })).sort((a, b) => a.order - b.order),
    null,
    2
  )};

export const DOCS_MAP = Object.fromEntries(
  DOCS_MANIFEST.map(doc => [doc.id, doc])
);

export const DOCS_COUNT = DOCS_MANIFEST.length;
`;
  
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    console.log(`📁 Creating output directory: ${OUTPUT_DIR}`);
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Write manifest file
  writeFileSync(OUTPUT_FILE, manifestContent);
  
  console.log(`✅ Manifest generated: ${OUTPUT_FILE}`);
  console.log(`📊 Total documents: ${docs.length}`);
  console.log(`📁 Categories: ${Object.keys(categories).length}`);
  
  // Print summary
  console.log('\n📋 Documentation Structure:');
  Object.entries(categories).forEach(([category, items]) => {
    console.log(`\n  ${items[0].icon} ${category} (${items.length})`);
    items.forEach(item => {
      console.log(`    - ${item.label}`);
    });
  });
  
  return docs;
}

// Run generator
generateManifest();
