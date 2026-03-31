/**
 * PDF Viewer Demo
 *
 * Demonstrates PDF viewing capabilities:
 * - PDF rendering with PDF.js
 * - Page navigation
 * - Zoom controls
 * - Search functionality
 * - Document information
 */

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../core/logger.service';
import { ApiService } from '../../core/api.service';

export interface PdfPage {
  pageNumber: number;
  width: number;
  height: number;
}

export interface PdfInfo {
  title: string;
  author: string;
  pages: number;
  size: string;
  createdDate: string;
}

@Component({
  selector: 'app-pdf-viewer-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="demo-container">
      <!-- Header -->
      <div class="demo-header">
        <div class="header-content">
          <h1 class="demo-title">
            <span class="title-icon">📄</span>
            PDF Viewer Demo
          </h1>
          <p class="demo-description">Interactive PDF viewing with navigation and search</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="pdf-toolbar">
        <div class="toolbar-group">
          <button class="btn-icon" (click)="previousPage()" [disabled]="currentPage() <= 1" title="Previous Page">
            ⬅️
          </button>
          <span class="page-indicator">
            Page {{ currentPage() }} of {{ totalPages() }}
          </span>
          <button class="btn-icon" (click)="nextPage()" [disabled]="currentPage() >= totalPages()" title="Next Page">
            ➡️
          </button>
        </div>

        <div class="toolbar-group">
          <button class="btn-icon" (click)="zoomOut()" [disabled]="zoom() <= 50" title="Zoom Out">
            🔍-
          </button>
          <span class="zoom-level">{{ zoom() }}%</span>
          <button class="btn-icon" (click)="zoomIn()" [disabled]="zoom() >= 200" title="Zoom In">
            🔍+
          </button>
          <button class="btn-icon" (click)="fitToWidth()" title="Fit to Width">
            ↔️
          </button>
          <button class="btn-icon" (click)="fitToPage()" title="Fit to Page">
            📄
          </button>
        </div>

        <div class="toolbar-group">
          <input
            type="text"
            class="search-input"
            [(ngModel)]="searchQuery"
            (keyup.enter)="searchInPdf()"
            placeholder="Search in PDF..."
          />
          <button class="btn btn-sm btn-primary" (click)="searchInPdf()">Search</button>
        </div>

        <div class="toolbar-group">
          <button class="btn btn-sm btn-secondary" (click)="loadSamplePdf()">Load Sample</button>
          <button class="btn btn-sm btn-secondary" (click)="showInfo()">Info</button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="pdf-content">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>Loading PDF...</span>
          </div>
        } @else if (pdfLoaded()) {
          <div class="pdf-viewer" [style.zoom]="zoom() / 100">
            <!-- PDF Canvas Placeholder -->
            <div class="pdf-page-placeholder">
              <div class="pdf-page-mock">
                <div class="mock-header">
                  <div class="mock-line"></div>
                  <div class="mock-line short"></div>
                </div>
                @for (para of mockParagraphs; track para) {
                  <div class="mock-paragraph">
                    @for (line of para; track line) {
                      <div class="mock-line" [class.short]="line === 'short'"></div>
                    }
                  </div>
                }
                <div class="page-number">Page {{ currentPage() }}</div>
              </div>
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-icon">📄</div>
            <h3>No PDF Loaded</h3>
            <p>Click "Load Sample" to view a sample PDF document</p>
            <button class="btn btn-primary" (click)="loadSamplePdf()">
              <span>📄</span> Load Sample PDF
            </button>
          </div>
        }
      </div>

      <!-- Thumbnails Panel -->
      @if (pdfLoaded()) {
        <div class="thumbnails-panel">
          <div class="panel-header">
            <h3 class="panel-title">Pages</h3>
          </div>
          <div class="thumbnails-grid">
            @for (page of pages(); track page.pageNumber) {
              <div
                class="thumbnail"
                [class.active]="currentPage() === page.pageNumber"
                (click)="goToPage(page.pageNumber)"
              >
                <div class="thumbnail-mock">
                  <div class="thumbnail-line"></div>
                  <div class="thumbnail-line short"></div>
                  <div class="thumbnail-line"></div>
                </div>
                <span class="thumbnail-number">{{ page.pageNumber }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Info Modal -->
      @if (showInfoModal()) {
        <div class="modal-overlay" (click)="closeInfo()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">Document Information</h2>
              <button class="modal-close" (click)="closeInfo()">✕</button>
            </div>
            <div class="modal-body">
              <div class="info-grid">
                <div class="info-label">Title:</div>
                <div class="info-value">{{ pdfInfo().title }}</div>

                <div class="info-label">Author:</div>
                <div class="info-value">{{ pdfInfo().author }}</div>

                <div class="info-label">Pages:</div>
                <div class="info-value">{{ pdfInfo().pages }}</div>

                <div class="info-label">Size:</div>
                <div class="info-value">{{ pdfInfo().size }}</div>

                <div class="info-label">Created:</div>
                <div class="info-value">{{ pdfInfo().createdDate }}</div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" (click)="closeInfo()">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- Search Results -->
      @if (searchResults().length > 0) {
        <div class="search-results">
          <div class="results-header">
            <span class="results-count">{{ searchResults().length }} results found</span>
            <button class="btn-icon btn-sm" (click)="clearSearch()">✕</button>
          </div>
          <div class="results-list">
            @for (result of searchResults(); track result.page; let i = $index) {
              <div
                class="result-item"
                [class.active]="currentResult() === i"
                (click)="goToResult(i)"
              >
                <span class="result-page">Page {{ result.page }}</span>
                <span class="result-text">{{ result.snippet }}</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100%;
    }

    .demo-header {
      margin-bottom: 24px;
    }

    .demo-title {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      font-size: 32px;
    }

    .demo-description {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    .pdf-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-indicator,
    .zoom-level {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      min-width: 80px;
      text-align: center;
    }

    .search-input {
      padding: 8px 12px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      color: #fff;
      font-size: 14px;
      width: 200px;
    }

    .search-input:focus {
      outline: none;
      border-color: rgba(59, 130, 246, 0.5);
    }

    .btn-icon {
      padding: 8px 12px;
      background: rgba(148, 163, 184, 0.2);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-icon:hover:not(:disabled) {
      background: rgba(148, 163, 184, 0.3);
    }

    .btn-icon:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
    }

    .btn-secondary {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }

    .btn-secondary:hover {
      background: rgba(148, 163, 184, 0.3);
    }

    .pdf-content {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      min-height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: #94a3b8;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(148, 163, 184, 0.2);
      border-top-color: #06b6d4;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 24px;
    }

    .empty-state h3 {
      font-size: 20px;
      color: #fff;
      margin: 0 0 8px;
    }

    .empty-state p {
      margin: 0 0 24px;
    }

    .pdf-viewer {
      width: 100%;
      height: 600px;
      overflow: auto;
      padding: 20px;
    }

    .pdf-page-placeholder {
      max-width: 800px;
      margin: 0 auto;
    }

    .pdf-page-mock {
      background: #fff;
      padding: 40px;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      color: #1f2937;
    }

    .mock-header {
      margin-bottom: 32px;
    }

    .mock-line {
      height: 12px;
      background: #e5e7eb;
      margin-bottom: 12px;
      border-radius: 2px;
    }

    .mock-line.short {
      width: 60%;
    }

    .mock-paragraph {
      margin-bottom: 20px;
    }

    .page-number {
      text-align: center;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }

    .thumbnails-panel {
      margin-top: 24px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 20px;
    }

    .panel-header {
      margin-bottom: 16px;
    }

    .panel-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .thumbnails-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
    }

    .thumbnail {
      background: rgba(15, 23, 42, 0.5);
      border: 2px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .thumbnail:hover {
      border-color: rgba(59, 130, 246, 0.5);
    }

    .thumbnail.active {
      border-color: #06b6d4;
      background: rgba(6, 182, 212, 0.1);
    }

    .thumbnail-mock {
      background: #fff;
      padding: 6px;
      border-radius: 2px;
      margin-bottom: 6px;
    }

    .thumbnail-line {
      height: 4px;
      background: #e5e7eb;
      margin-bottom: 4px;
      border-radius: 1px;
    }

    .thumbnail-line.short {
      width: 60%;
    }

    .thumbnail-number {
      display: block;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: #1e293b;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .modal-title {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .modal-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 24px;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }

    .modal-close:hover {
      color: #fff;
    }

    .modal-body {
      padding: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 12px;
      align-items: baseline;
    }

    .info-label {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }

    .info-value {
      font-size: 14px;
      color: #fff;
    }

    .modal-footer {
      padding: 24px;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
      display: flex;
      justify-content: flex-end;
    }

    /* Search Results */
    .search-results {
      margin-top: 24px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .results-count {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }

    .results-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .result-item {
      padding: 12px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      cursor: pointer;
      transition: background 0.2s;
    }

    .result-item:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .result-item.active {
      background: rgba(6, 182, 212, 0.1);
    }

    .result-page {
      font-size: 12px;
      font-weight: 600;
      color: #06b6d4;
      margin-right: 12px;
    }

    .result-text {
      font-size: 13px;
      color: #e2e8f0;
    }

    @media (max-width: 768px) {
      .pdf-toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .toolbar-group {
        justify-content: center;
      }

      .search-input {
        width: 100%;
      }

      .thumbnails-grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
  `]
})
export class PdfViewerDemoComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly api = inject(ApiService);

  // State
  isLoading = signal(false);
  pdfLoaded = signal(false);
  currentPage = signal(1);
  totalPages = signal(0);
  zoom = signal(100);
  searchQuery = '';
  showInfoModal = signal(false);

  // Data
  pages = signal<PdfPage[]>([]);
  pdfInfo = signal<PdfInfo>({
    title: '',
    author: '',
    pages: 0,
    size: '',
    createdDate: '',
  });

  searchResults = signal<{ page: number; snippet: string }[]>([]);
  currentResult = signal(0);

  // Mock data for demo
  mockParagraphs = [
    ['full', 'full', 'full', 'short'],
    ['full', 'full', 'short'],
    ['full', 'full', 'full', 'full', 'short'],
  ];

  ngOnInit(): void {
    // Initialize with sample data
  }

  async loadSamplePdf(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Simulate PDF loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.pages.set([
        { pageNumber: 1, width: 612, height: 792 },
        { pageNumber: 2, width: 612, height: 792 },
        { pageNumber: 3, width: 612, height: 792 },
        { pageNumber: 4, width: 612, height: 792 },
        { pageNumber: 5, width: 612, height: 792 },
      ]);

      this.totalPages.set(5);
      this.currentPage.set(1);
      this.pdfLoaded.set(true);

      this.pdfInfo.set({
        title: 'Sample Document',
        author: 'Demo Author',
        pages: 5,
        size: '245 KB',
        createdDate: new Date().toLocaleDateString(),
      });

      this.logger.info('Sample PDF loaded');
    } catch (error) {
      this.logger.error('Failed to load PDF', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  zoomIn(): void {
    if (this.zoom() < 200) {
      this.zoom.update(z => Math.min(z + 25, 200));
    }
  }

  zoomOut(): void {
    if (this.zoom() > 50) {
      this.zoom.update(z => Math.max(z - 25, 50));
    }
  }

  fitToWidth(): void {
    this.zoom.set(100);
  }

  fitToPage(): void {
    this.zoom.set(80);
  }

  searchInPdf(): void {
    if (!this.searchQuery.trim()) {
      return;
    }

    // Simulate search results
    const results = [
      { page: 1, snippet: `...sample text containing "${this.searchQuery}" in the document...` },
      { page: 3, snippet: `...another occurrence of "${this.searchQuery}" found here...` },
      { page: 5, snippet: `...final mention of "${this.searchQuery}" in conclusion...` },
    ];

    this.searchResults.set(results);
    this.currentResult.set(0);
    this.logger.info(`Found ${results.length} results for "${this.searchQuery}"`);
  }

  goToResult(index: number): void {
    const result = this.searchResults()[index];
    if (result) {
      this.currentPage.set(result.page);
      this.currentResult.set(index);
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults.set([]);
  }

  showInfo(): void {
    this.showInfoModal.set(true);
  }

  closeInfo(): void {
    this.showInfoModal.set(false);
  }
}
