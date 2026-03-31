/**
 * DuckDB Products Management - Professional Demo
 * 
 * A production-ready product catalog interface demonstrating:
 * - Complete CRUD operations with validation
 * - Category-based filtering
 * - Stock management
 * - Professional card-based layout
 * - Real-time inventory tracking
 */

import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../core/logger.service';
import { BackendService, ConfirmModalService } from '../../core';
import { ApiContract } from '../../app/constants/api-contract';
import { ButtonComponent, StatsCardComponent, BadgeComponent, SpinnerComponent, EmptyStateComponent, CardComponent, CardHeaderComponent, CardFooterComponent } from '../shared/ui';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  createdAt?: string;
}

export interface ProductStats {
  totalProducts: number;
  totalCategories: number;
  totalStock: number;
  avgPrice: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface ProductFilters {
  search: string;
  category: string;
  stockStatus: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  sortBy: 'name' | 'price' | 'stock' | 'category';
  sortOrder: 'asc' | 'desc';
}

// ============================================================================
// Constants
// ============================================================================

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Home',
  'Sports',
  'Office',
  'Other'
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: '📱',
  Clothing: '👕',
  Books: '📚',
  Home: '🏠',
  Sports: '⚽',
  Office: '📎',
  Other: '📦'
};

// ============================================================================
// Main Component
// ============================================================================

@Component({
  selector: 'app-duckdb-products-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    StatsCardComponent,
    BadgeComponent,
    SpinnerComponent,
    EmptyStateComponent,
    CardComponent,
    CardHeaderComponent,
    CardFooterComponent,
  ],
  template: `
    <div class="duckdb-demo">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-branding">
            <span class="header-icon">🦆</span>
            <div class="header-text">
              <h1 class="page-title">Product Catalog</h1>
              <p class="page-subtitle">DuckDB-powered inventory management with real-time analytics</p>
            </div>
          </div>
          <div class="header-actions">
            <app-button
              variant="primary"
              icon="➕"
              label="Add Product"
              (click)="showCreateModal()"
            />
          </div>
        </div>
      </header>

      <!-- Statistics Dashboard -->
      <section class="stats-section">
        <app-stats-card
          value="{{ productStats().totalProducts }}"
          label="Total Products"
          icon="📦"
          variant="primary"
        />
        <app-stats-card
          value="{{ productStats().totalCategories }}"
          label="Categories"
          icon="🏷️"
          variant="success"
        />
        <app-stats-card
          value="{{ productStats().totalStock }}"
          label="Total Stock"
          icon="📊"
          variant="warning"
        />
        <app-stats-card
          value="\${{ productStats().avgPrice }}"
          label="Avg Price"
          icon="💰"
          variant="info"
        />
        <app-stats-card
          value="{{ productStats().lowStockCount }}"
          label="Low Stock"
          icon="⚠️"
          variant="warning"
        />
        <app-stats-card
          value="{{ productStats().outOfStockCount }}"
          label="Out of Stock"
          icon="❌"
          variant="danger"
        />
      </section>

      <!-- Filters and Search -->
      <section class="filters-section">
        <div class="filters-bar">
          <div class="search-container">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="search-input"
              placeholder="Search products by name or description..."
              [(ngModel)]="filters().search"
              (input)="applyFilters()"
            />
          </div>
          
          <div class="filters-group">
            <select
              class="filter-select"
              [(ngModel)]="filters().category"
              (change)="applyFilters()"
            >
              <option value="">All Categories</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ CATEGORY_ICONS[cat] }} {{ cat }}</option>
              }
            </select>

            <select
              class="filter-select"
              [(ngModel)]="filters().stockStatus"
              (change)="applyFilters()"
            >
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock (&lt;10)</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            <select
              class="filter-select"
              [(ngModel)]="filters().sortBy"
              (change)="applyFilters()"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="category">Sort by Category</option>
            </select>

            <button
              class="filter-select"
              (click)="toggleSortOrder()"
              title="Toggle Sort Order"
            >
              {{ filters().sortOrder === 'asc' ? '↑' : '↓' }}
            </button>

            <app-button
              variant="secondary"
              icon="🔄"
              label="Refresh"
              (click)="loadProducts()"
            />
          </div>
        </div>
      </section>

      <!-- Products Grid -->
      <section class="products-section">
        @if (isLoading()) {
          <div class="loading-container">
            <app-spinner size="lg" label="Loading products..." />
          </div>
        } @else if (filteredProducts().length === 0) {
          <app-empty-state
            icon="📭"
            title="No products found"
            description="Try adjusting your search or filters, or add a new product to get started."
          >
            <app-button
              variant="primary"
              icon="➕"
              label="Add Product"
              (click)="showCreateModal()"
            />
          </app-empty-state>
        } @else {
          <div class="products-grid">
            @for (product of filteredProducts(); track product.id) {
              <app-card hoverable class="product-card">
                <div class="product-card-header" [class]="'category-' + getCategoryColor(product.category)">
                  <div class="product-category">
                    <span class="category-icon">{{ CATEGORY_ICONS[product.category] || '📦' }}</span>
                    <span class="category-name">{{ product.category }}</span>
                  </div>
                  <div class="product-stock-indicator" [class]="'stock-' + getStockStatus(product.stock)">
                    @if (getStockStatus(product.stock) === 'in-stock') {
                      <span class="stock-dot"></span>
                      <span class="stock-text">{{ product.stock }} in stock</span>
                    } @else if (getStockStatus(product.stock) === 'low-stock') {
                      <span class="stock-dot low"></span>
                      <span class="stock-text">Only {{ product.stock }} left</span>
                    } @else {
                      <span class="stock-dot out"></span>
                      <span class="stock-text">Out of stock</span>
                    }
                  </div>
                </div>

                <div class="product-card-body">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-description">{{ product.description || 'No description available' }}</p>
                </div>

                <app-card-footer bordered>
                  <div class="product-price">\${{ product.price | number:'1.2-2' }}</div>
                  <div class="product-actions">
                    <button
                      class="action-btn btn-edit"
                      (click)="editProduct(product)"
                      title="Edit Product"
                    >
                      ✏️
                    </button>
                    <button
                      class="action-btn btn-delete"
                      (click)="deleteProduct(product)"
                      title="Delete Product"
                    >
                      🗑️
                    </button>
                  </div>
                </app-card-footer>
              </app-card>
            }
          </div>
        }

        <!-- Results Footer -->
        @if (filteredProducts().length > 0) {
          <div class="results-footer">
            <span class="results-count">
              Showing {{ filteredProducts().length }} of {{ products().length }} products
            </span>
          </div>
        }
      </section>

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-container" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-group">
                <span class="modal-icon">{{ isEditing() ? '✏️' : '➕' }}</span>
                <h2 class="modal-title">{{ isEditing() ? 'Edit Product' : 'Create New Product' }}</h2>
              </div>
              <button class="modal-close" (click)="closeModal()">✕</button>
            </div>

            <form class="modal-form" (ngSubmit)="saveProduct()">
              <div class="form-grid">
                <div class="form-group form-group-full">
                  <label class="form-label">
                    Product Name
                    <span class="required">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-input"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    placeholder="Enter product name"
                    autocomplete="off"
                  />
                </div>

                <div class="form-group form-group-full">
                  <label class="form-label">Description</label>
                  <textarea
                    class="form-input form-textarea"
                    [(ngModel)]="formData.description"
                    name="description"
                    placeholder="Product description"
                    rows="3"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Price
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">$</span>
                    <input
                      type="number"
                      class="form-input"
                      [(ngModel)]="formData.price"
                      name="price"
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Stock Quantity
                    <span class="required">*</span>
                  </label>
                  <input
                    type="number"
                    class="form-input"
                    [(ngModel)]="formData.stock"
                    name="stock"
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div class="form-group form-group-full">
                  <label class="form-label">Category</label>
                  <select class="form-input" [(ngModel)]="formData.category" name="category">
                    @for (cat of categories; track cat) {
                      <option [value]="cat">{{ CATEGORY_ICONS[cat] }} {{ cat }}</option>
                    }
                  </select>
                </div>
              </div>

              @if (errorMessage()) {
                <div class="form-error">
                  <span class="error-icon">⚠️</span>
                  <span class="error-message">{{ errorMessage() }}</span>
                </div>
              }

              <div class="modal-footer">
                <app-button
                  variant="secondary"
                  label="Cancel"
                  type="button"
                  (click)="closeModal()"
                />
                <app-button
                  variant="primary"
                  [label]="saving() ? 'Saving...' : (isEditing() ? 'Update Product' : 'Create Product')"
                  [loading]="saving()"
                  type="submit"
                />
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .duckdb-demo {
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100%;
    }

    /* Page Header */
    .page-header {
      margin-bottom: 32px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .header-branding {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 40px;
      line-height: 1;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    /* Statistics Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    /* Filters Section */
    .filters-section {
      margin-bottom: 24px;
    }

    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
    }

    .search-container {
      flex: 1;
      max-width: 400px;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      opacity: 0.5;
    }

    .search-input {
      width: 100%;
      padding: 12px 16px 12px 44px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: rgba(59, 130, 246, 0.5);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    .filters-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .filter-select {
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: rgba(148, 163, 184, 0.3);
      }

      &:focus {
        outline: none;
        border-color: rgba(59, 130, 246, 0.5);
      }
    }

    /* Products Section */
    .products-section {
      position: relative;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .product-card {
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .product-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15));
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .product-category {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-icon {
      font-size: 18px;
    }

    .category-name {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-stock-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      padding: 4px 10px;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 12px;
    }

    .stock-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      animation: pulse 2s infinite;
    }

    .stock-dot.low {
      background: #f59e0b;
    }

    .stock-dot.out {
      background: #ef4444;
      animation: none;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .stock-text {
      color: #94a3b8;
      font-weight: 500;
    }

    .product-card-body {
      padding: 18px;
    }

    .product-name {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 8px;
      line-height: 1.3;
    }

    .product-description {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-price {
      font-size: 24px;
      font-weight: 700;
      color: #10b981;
      line-height: 1;
    }

    .product-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      background: transparent;
      opacity: 0.7;
      transition: all 0.2s;

      &:hover {
        opacity: 1;
        transform: scale(1.1);
      }

      &.btn-edit:hover {
        background: rgba(59, 130, 246, 0.2);
      }

      &.btn-delete:hover {
        background: rgba(239, 68, 68, 0.2);
      }
    }

    .results-footer {
      display: flex;
      justify-content: center;
      padding: 20px;
      margin-top: 24px;
    }

    .results-count {
      font-size: 13px;
      color: #94a3b8;
    }

    /* Modal Styles */
    .modal-backdrop {
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
      padding: 20px;
    }

    .modal-container {
      background: #1e293b;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      width: 100%;
      max-width: 650px;
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

    .modal-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-icon {
      font-size: 24px;
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
      transition: all 0.2s;

      &:hover {
        color: #fff;
        transform: rotate(90deg);
      }
    }

    .modal-form {
      padding: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-size: 14px;
      font-weight: 500;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .required {
      color: #ef4444;
    }

    .form-input {
      padding: 12px 14px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: rgba(59, 130, 246, 0.5);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
      font-family: inherit;
    }

    .input-with-prefix {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-prefix {
      position: absolute;
      left: 14px;
      color: #94a3b8;
      font-weight: 600;
      pointer-events: none;
    }

    .input-with-prefix .form-input {
      padding-left: 32px;
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #ef4444;
      font-size: 14px;
    }

    .error-icon {
      font-size: 18px;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }

    /* Responsive */
    @media (max-width: 1400px) {
      .stats-section {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 1024px) {
      .filters-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-container {
        max-width: 100%;
      }

      .filters-group {
        flex-wrap: wrap;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .duckdb-demo {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .header-branding {
        flex-direction: column;
        text-align: center;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DuckdbProductsDemoComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly backend = inject(BackendService);
  private readonly confirmModal = inject(ConfirmModalService);

  // Constants
  readonly categories = CATEGORIES;
  readonly CATEGORY_ICONS = CATEGORY_ICONS;

  // State
  isLoading = signal(false);
  saving = signal(false);
  showModal = signal(false);
  isEditing = signal(false);
  errorMessage = signal('');
  selectedProduct = signal<Product | null>(null);

  // Data
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);

  // Computed Stats
  productStats = computed<ProductStats>(() => {
    const prods = this.products();
    const categories = new Set(prods.map(p => p.category));
    const totalStock = prods.reduce((sum, p) => sum + p.stock, 0);
    const avgPrice = prods.length > 0 
      ? prods.reduce((sum, p) => sum + p.price, 0) / prods.length 
      : 0;
    const lowStockCount = prods.filter(p => p.stock > 0 && p.stock < 10).length;
    const outOfStockCount = prods.filter(p => p.stock === 0).length;

    return {
      totalProducts: prods.length,
      totalCategories: categories.size,
      totalStock,
      avgPrice: Math.round(avgPrice * 100) / 100,
      lowStockCount,
      outOfStockCount
    };
  });

  // Filters
  filters = signal<ProductFilters>({
    search: '',
    category: '',
    stockStatus: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Form
  formData = {
    name: '',
    description: '',
    price: 0,
    category: 'Electronics',
    stock: 0
  };

  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.isLoading.set(true);
    try {
      const productsData = await this.backend.callOrThrow<Product[]>(ApiContract.Products.GET_ALL).catch(() => []);
      this.products.set(productsData);
      this.applyFilters();
      
      this.logger.info(`Loaded ${productsData.length} products`);
    } catch (error) {
      this.logger.error('Failed to load products', error);
      this.errorMessage.set('Failed to load products. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  applyFilters(): void {
    let filtered = [...this.products()];
    const { search, category, stockStatus, sortBy, sortOrder } = this.filters();

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (category) {
      filtered = filtered.filter(product => product.category === category);
    }

    // Stock status filter
    if (stockStatus !== 'all') {
      filtered = filtered.filter(product => {
        switch (stockStatus) {
          case 'in-stock': return product.stock >= 10;
          case 'low-stock': return product.stock > 0 && product.stock < 10;
          case 'out-of-stock': return product.stock === 0;
          default: return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredProducts.set(filtered);
  }

  toggleSortOrder(): void {
    this.filters.update(f => ({
      ...f,
      sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
    this.applyFilters();
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      Electronics: 'electronics',
      Clothing: 'clothing',
      Books: 'books',
      Home: 'home',
      Sports: 'sports',
      Office: 'office',
      Other: 'other'
    };
    return colors[category] || 'other';
  }

  getStockStatus(stock: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  }

  showCreateModal(): void {
    this.isEditing.set(false);
    this.formData = {
      name: '',
      description: '',
      price: 0,
      category: 'Electronics',
      stock: 0
    };
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  editProduct(product: Product): void {
    this.isEditing.set(true);
    this.selectedProduct.set(product);
    this.formData = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock
    };
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.errorMessage.set('');
    this.selectedProduct.set(null);
  }

  async saveProduct(): Promise<void> {
    // Validation
    if (!this.formData.name?.trim()) {
      this.errorMessage.set('Product name is required');
      return;
    }

    if (!this.formData.price || this.formData.price <= 0) {
      this.errorMessage.set('Price must be greater than 0');
      return;
    }

    if (this.formData.stock === undefined || this.formData.stock < 0) {
      this.errorMessage.set('Stock must be 0 or greater');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    try {
      if (this.isEditing()) {
        const productId = this.selectedProduct()?.id || 0;
        await this.backend.callOrThrow(ApiContract.Products.UPDATE, [
          productId,
          this.formData.name,
          this.formData.description,
          this.formData.price,
          this.formData.category,
          this.formData.stock
        ]);
        this.logger.info('Product updated successfully');
      } else {
        await this.backend.callOrThrow(ApiContract.Products.CREATE, [
          this.formData.name,
          this.formData.description,
          this.formData.price,
          this.formData.category,
          this.formData.stock
        ]);
        this.logger.info('Product created successfully');
      }

      await this.loadProducts();
      this.closeModal();
    } catch (error: any) {
      this.logger.error('Failed to save product', error);
      this.errorMessage.set(error.message || 'Failed to save product');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteProduct(product: Product): Promise<void> {
    const confirmed = await this.confirmModal.showDeleteConfirm({
      title: 'Delete Product',
      itemName: product.name,
      itemDescription: product.description,
      additionalInfo: `<strong>Price:</strong> $${product.price.toFixed(2)} | <strong>Stock:</strong> ${product.stock} units | <strong>Category:</strong> ${product.category}`,
      confirmText: `DELETE ${product.name.toUpperCase()}`,
    });
    
    if (!confirmed) {
      this.logger.info('Delete cancelled by user');
      return;
    }

    try {
      await this.backend.callOrThrow(ApiContract.Products.DELETE, [product.id]);
      this.logger.info('Product deleted successfully');
      await this.loadProducts();
    } catch (error: any) {
      this.logger.error('Failed to delete product', error);
      this.errorMessage.set(error.message || 'Failed to delete product');
    }
  }
}
