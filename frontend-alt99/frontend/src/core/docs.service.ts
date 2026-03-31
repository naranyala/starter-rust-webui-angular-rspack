/**
 * Documentation Service
 * 
 * Provides access to the auto-generated documentation manifest.
 * The manifest is generated at build time by scanning the docs/ folder.
 * 
 * Features:
 * - Dynamic menu generation from available markdown files
 * - Category-based organization
 * - Search functionality
 * - Metadata extraction (title, icon, description)
 * 
 * @example
 * ```typescript
 * // Get all docs
 * const allDocs = docsService.getAllDocs();
 * 
 * // Get docs by category
 * const categories = docsService.getDocsByCategory();
 * 
 * // Search docs
 * const results = docsService.searchDocs('security');
 * 
 * // Get specific doc
 * const doc = docsService.getDocById('01-GETTING_STARTED');
 * ```
 */

import { Injectable } from '@angular/core';
import { DOCS_MANIFEST, DOCS_BY_CATEGORY, DOCS_MAP, DOCS_COUNT } from '../app/constants/docs-manifest';

export interface DocManifestItem {
  id: string;
  fileId: string;
  label: string;
  filename: string;
  path: string;
  category: string;
  icon: string;
  order: number;
  description?: string;
}

export interface DocCategory {
  label: string;
  icon: string;
  order: number;
  items: DocManifestItem[];
}

@Injectable({ providedIn: 'root' })
export class DocsService {
  /**
   * Get all documentation items
   */
  getAllDocs(): DocManifestItem[] {
    return DOCS_MANIFEST;
  }

  /**
   * Get documentation items grouped by category
   */
  getDocsByCategory(): DocCategory[] {
    return DOCS_BY_CATEGORY;
  }

  /**
   * Get a specific documentation item by ID
   */
  getDocById(id: string): DocManifestItem | undefined {
    return DOCS_MAP[id];
  }

  /**
   * Get documentation items for a specific category
   */
  getDocsByCategoryName(category: string): DocManifestItem[] {
    const categoryData = DOCS_BY_CATEGORY.find(c => c.label === category);
    return categoryData?.items || [];
  }

  /**
   * Search documentation by title or description
   */
  searchDocs(query: string): DocManifestItem[] {
    if (!query.trim()) {
      return DOCS_MANIFEST;
    }

    const searchQuery = query.toLowerCase();
    return DOCS_MANIFEST.filter(doc => 
      doc.label.toLowerCase().includes(searchQuery) ||
      doc.description?.toLowerCase().includes(searchQuery) ||
      doc.id.toLowerCase().includes(searchQuery)
    );
  }

  /**
   * Get total number of documentation files
   */
  getDocsCount(): number {
    return DOCS_COUNT;
  }

  /**
   * Get all unique categories
   */
  getCategories(): string[] {
    return DOCS_BY_CATEGORY.map(c => c.label);
  }

  /**
   * Check if a documentation file exists
   */
  hasDoc(id: string): boolean {
    return id in DOCS_MAP;
  }

  /**
   * Get the file path for a documentation item
   */
  getDocPath(id: string): string {
    const doc = DOCS_MAP[id];
    return doc?.path || '';
  }

  /**
   * Get the next document in the same category
   */
  getNextDoc(currentId: string): DocManifestItem | undefined {
    const doc = DOCS_MAP[currentId];
    if (!doc) return undefined;

    const category = DOCS_BY_CATEGORY.find(c => c.label === doc.category);
    if (!category) return undefined;

    const currentIndex = category.items.findIndex(i => i.id === currentId);
    if (currentIndex < 0 || currentIndex >= category.items.length - 1) {
      return undefined;
    }

    return category.items[currentIndex + 1];
  }

  /**
   * Get the previous document in the same category
   */
  getPreviousDoc(currentId: string): DocManifestItem | undefined {
    const doc = DOCS_MAP[currentId];
    if (!doc) return undefined;

    const category = DOCS_BY_CATEGORY.find(c => c.label === doc.category);
    if (!category) return undefined;

    const currentIndex = category.items.findIndex(i => i.id === currentId);
    if (currentIndex <= 0) {
      return undefined;
    }

    return category.items[currentIndex - 1];
  }

  /**
   * Get the first document in a category
   */
  getFirstDoc(category?: string): DocManifestItem | undefined {
    if (!category) {
      return DOCS_MANIFEST[0];
    }

    const categoryData = DOCS_BY_CATEGORY.find(c => c.label === category);
    return categoryData?.items[0];
  }

  /**
   * Refresh the manifest (for development)
   * Note: In production, this would require a rebuild
   */
  refreshManifest(): void {
    console.warn('DocsService: Manifest refresh requires rebuild in production');
    // In development, you could fetch the latest manifest from server
  }
}
