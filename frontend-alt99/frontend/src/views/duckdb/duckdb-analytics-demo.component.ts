/**
 * Production-Ready DuckDB Analytics Dashboard
 * 
 * Demonstrates analytical queries and data visualization:
 * - Category statistics
 * - Sales trends
 * - Top products
 * - Revenue analysis
 */

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerService } from '../../core/logger.service';
import { ApiService } from '../../core/api.service';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

export interface CategoryStats {
  category: string;
  product_count: number;
  avg_price: number;
  total_stock: number;
  min_price: number;
  max_price: number;
}

export interface SalesTrend {
  date: string;
  order_count: number;
  total_quantity: number;
  total_revenue: number;
  avg_order_value: number;
}

export interface ProductStats {
  id: number;
  name: string;
  category: string;
  order_count: number;
  total_sold: number;
  total_revenue: number;
}

export interface RevenueData {
  period: string;
  revenue: number;
  transactions: number;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalCategories: number;
  totalStock: number;
  avgPrice: number;
  totalRevenue: number;
  totalOrders: number;
}

@Component({
  selector: 'app-duckdb-analytics-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-container">
      <!-- Header -->
      <div class="analytics-header">
        <div class="header-content">
          <h1 class="analytics-title">
            <span class="title-icon">🦆</span>
            DuckDB Analytics Dashboard
          </h1>
          <p class="analytics-description">
            High-performance analytical queries and business intelligence
          </p>
        </div>
        <div class="header-actions">
          <select class="period-select" [(ngModel)]="selectedPeriod" (change)="loadData()">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="metrics-grid">
        <div class="metric-card metric-primary">
          <div class="metric-icon">📦</div>
          <div class="metric-content">
            <span class="metric-value">{{ metrics().totalProducts }}</span>
            <span class="metric-label">Total Products</span>
          </div>
        </div>
        
        <div class="metric-card metric-success">
          <div class="metric-icon">🏷️</div>
          <div class="metric-content">
            <span class="metric-value">{{ metrics().totalCategories }}</span>
            <span class="metric-label">Categories</span>
          </div>
        </div>
        
        <div class="metric-card metric-warning">
          <div class="metric-icon">📊</div>
          <div class="metric-content">
            <span class="metric-value">{{ metrics().totalStock | number }}</span>
            <span class="metric-label">Total Stock</span>
          </div>
        </div>
        
        <div class="metric-card metric-info">
          <div class="metric-icon">💰</div>
          <div class="metric-content">
            <span class="metric-value">\${{ metrics().avgPrice | number:'1.2-2' }}</span>
            <span class="metric-label">Avg Price</span>
          </div>
        </div>
        
        <div class="metric-card metric-revenue">
          <div class="metric-icon">💵</div>
          <div class="metric-content">
            <span class="metric-value">\${{ metrics().totalRevenue | number:'1.2-2' }}</span>
            <span class="metric-label">Total Revenue</span>
          </div>
        </div>
        
        <div class="metric-card metric-orders">
          <div class="metric-icon">🛒</div>
          <div class="metric-content">
            <span class="metric-value">{{ metrics().totalOrders | number }}</span>
            <span class="metric-label">Total Orders</span>
          </div>
        </div>
      </div>

      <!-- Category Statistics -->
      <div class="analytics-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">📈</span>
            Category Statistics
          </h2>
        </div>
        
        @if (categoryStats().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">📭</span>
            <span>No category data available</span>
          </div>
        } @else {
          <div class="category-grid">
            @for (stat of categoryStats(); track stat.category) {
              <div class="category-card">
                <div class="category-header">
                  <span class="category-name">{{ stat.category }}</span>
                  <span class="category-count">{{ stat.product_count }} products</span>
                </div>
                <div class="category-stats">
                  <div class="category-stat">
                    <span class="stat-label">Avg Price</span>
                    <span class="stat-value">\${{ stat.avg_price | number:'1.2-2' }}</span>
                  </div>
                  <div class="category-stat">
                    <span class="stat-label">Total Stock</span>
                    <span class="stat-value">{{ stat.total_stock }}</span>
                  </div>
                  <div class="category-stat">
                    <span class="stat-label">Price Range</span>
                    <span class="stat-value">\${{ stat.min_price }} - \${{ stat.max_price }}</span>
                  </div>
                </div>
                <div class="category-bar">
                  <div class="category-bar-fill" 
                       [style.width.%]="getCategoryPercentage(stat.product_count)">
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Top Products & Sales Trend -->
      <div class="analytics-row">
        <!-- Top Products -->
        <div class="analytics-section analytics-section-half">
          <div class="section-header">
            <h2 class="section-title">
              <span class="section-icon">🏆</span>
              Top Products by Revenue
            </h2>
          </div>
          
          @if (topProducts().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">📭</span>
              <span>No product data available</span>
            </div>
          } @else {
            <div class="top-products-list">
              @for (product of topProducts(); track product.id; let i = $index) {
                <div class="top-product-item">
                  <div class="product-rank">
                    <span class="rank-number">{{ i + 1 }}</span>
                  </div>
                  <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-category">{{ product.category }}</div>
                  </div>
                  <div class="product-metrics">
                    <div class="product-metric">
                      <span class="metric-label">Sold</span>
                      <span class="metric-value">{{ product.total_sold }}</span>
                    </div>
                    <div class="product-metric product-metric-revenue">
                      <span class="metric-label">Revenue</span>
                      <span class="metric-value">\${{ product.total_revenue | number:'1.2-2' }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Sales Trend -->
        <div class="analytics-section analytics-section-half">
          <div class="section-header">
            <h2 class="section-title">
              <span class="section-icon">📉</span>
              Sales Trend (30 Days)
            </h2>
          </div>
          
          @if (salesTrend().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">📭</span>
              <span>No sales data available</span>
            </div>
          } @else {
            <div class="trend-chart">
              @for (item of salesTrend(); track item.date; let i = $index) {
                <div class="trend-bar-container">
                  <div class="trend-bar" 
                       [style.height.%]="getTrendBarHeight(item.total_revenue)">
                  </div>
                  <div class="trend-label">
                    <span class="trend-date">{{ formatTrendDate(item.date) }}</span>
                    <span class="trend-value">\${{ item.total_revenue | number:'1.2-2' }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Revenue by Period -->
      <div class="analytics-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">💹</span>
            Revenue by {{ selectedPeriod }}
          </h2>
        </div>
        
        @if (revenueData().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">📭</span>
            <span>No revenue data available</span>
          </div>
        } @else {
          <div class="revenue-table">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Transactions</th>
                  <th>Avg Transaction</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                @for (item of revenueData(); track item.period; let i = $index) {
                  <tr>
                    <td class="cell-period">{{ item.period }}</td>
                    <td class="cell-revenue">\${{ item.revenue | number:'1.2-2' }}</td>
                    <td class="cell-transactions">{{ item.transactions | number }}</td>
                    <td class="cell-avg">\${{ getAvgTransaction(item) | number:'1.2-2' }}</td>
                    <td class="cell-growth">
                      <span class="growth-indicator" 
                            [class.growth-positive]="i === 0"
                            [class.growth-negative]="i > 0">
                        {{ i === 0 ? '—' : getGrowth(item, revenueData()[i - 1]) }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100%;
    }
    
    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .analytics-title {
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
    
    .analytics-description {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }
    
    .period-select {
      padding: 10px 16px;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .metric-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
    }
    
    .metric-icon {
      font-size: 32px;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }
    
    .metric-primary .metric-icon { background: rgba(59, 130, 246, 0.2); }
    .metric-success .metric-icon { background: rgba(16, 185, 129, 0.2); }
    .metric-warning .metric-icon { background: rgba(245, 158, 11, 0.2); }
    .metric-info .metric-icon { background: rgba(6, 182, 212, 0.2); }
    .metric-revenue .metric-icon { background: rgba(34, 197, 94, 0.2); }
    .metric-orders .metric-icon { background: rgba(139, 92, 246, 0.2); }
    
    .metric-content {
      display: flex;
      flex-direction: column;
    }
    
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
    }
    
    .metric-label {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }
    
    .analytics-section {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    
    .analytics-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .section-header {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-icon {
      font-size: 20px;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #94a3b8;
    }
    
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    
    .category-card {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 16px;
    }
    
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .category-name {
      font-weight: 600;
      color: #fff;
      font-size: 16px;
    }
    
    .category-count {
      font-size: 12px;
      color: #94a3b8;
      background: rgba(148, 163, 184, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .category-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .category-stat {
      text-align: center;
    }
    
    .category-stat .stat-label {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    
    .category-stat .stat-value {
      display: block;
      font-size: 14px;
      color: #fff;
      font-weight: 600;
    }
    
    .category-bar {
      height: 4px;
      background: rgba(148, 163, 184, 0.2);
      border-radius: 2px;
      overflow: hidden;
    }
    
    .category-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #06b6d4, #3b82f6);
      border-radius: 2px;
      transition: width 0.3s;
    }
    
    .top-products-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .top-product-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      background: rgba(15, 23, 42, 0.3);
      border-radius: 8px;
    }
    
    .product-rank {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      border-radius: 8px;
      font-weight: 700;
      color: #fff;
    }
    
    .rank-number {
      font-size: 16px;
    }
    
    .product-info {
      flex: 1;
    }
    
    .product-name {
      font-weight: 600;
      color: #fff;
      font-size: 14px;
    }
    
    .product-category {
      font-size: 12px;
      color: #94a3b8;
    }
    
    .product-metrics {
      display: flex;
      gap: 20px;
    }
    
    .product-metric {
      text-align: right;
    }
    
    .product-metric .metric-label {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    
    .product-metric .metric-value {
      display: block;
      font-size: 14px;
      color: #fff;
      font-weight: 600;
    }
    
    .product-metric-revenue .metric-value {
      color: #10b981;
    }
    
    .trend-chart {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 200px;
      padding: 16px;
      background: rgba(15, 23, 42, 0.3);
      border-radius: 8px;
    }
    
    .trend-bar-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    
    .trend-bar {
      width: 100%;
      min-height: 4px;
      background: linear-gradient(180deg, #06b6d4, #3b82f6);
      border-radius: 4px 4px 0 0;
      transition: height 0.3s;
    }
    
    .trend-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    
    .trend-date {
      font-size: 10px;
      color: #94a3b8;
      transform: rotate(-45deg);
      transform-origin: left;
    }
    
    .trend-value {
      font-size: 11px;
      color: #fff;
      font-weight: 600;
    }
    
    .revenue-table {
      overflow-x: auto;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .data-table th,
    .data-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }
    
    .data-table th {
      color: #94a3b8;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
    }
    
    .data-table td {
      color: #e2e8f0;
      font-size: 14px;
    }
    
    .cell-revenue {
      color: #10b981;
      font-weight: 600;
    }
    
    .growth-indicator {
      font-weight: 600;
    }
    
    .growth-positive {
      color: #10b981;
    }
    
    .growth-negative {
      color: #ef4444;
    }
    
    @media (max-width: 1200px) {
      .metrics-grid {
        grid-template-columns: repeat(3, 1fr);
      }
      
      .analytics-row {
        grid-template-columns: 1fr;
      }
    }
    
    @media (max-width: 768px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .analytics-header {
        flex-direction: column;
        gap: 16px;
      }
      
      .category-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DuckdbAnalyticsDemoComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly api = inject(ApiService);

  // State
  isLoading = signal(false);
  selectedPeriod = signal<'daily' | 'monthly' | 'quarterly'>('daily');

  // Data
  products = signal<Product[]>([]);
  categoryStats = signal<CategoryStats[]>([]);
  topProducts = signal<ProductStats[]>([]);
  salesTrend = signal<SalesTrend[]>([]);
  revenueData = signal<RevenueData[]>([]);
  
  metrics = signal<DashboardMetrics>({
    totalProducts: 0,
    totalCategories: 0,
    totalStock: 0,
    avgPrice: 0,
    totalRevenue: 0,
    totalOrders: 0
  });

  private maxCategoryCount = 0;
  private maxRevenue = 0;

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [
        products,
        categoryStats,
        topProducts,
        salesTrend,
        revenueData
      ] = await Promise.all([
        this.api.callOrThrow<Product[]>('getProducts').catch(() => []),
        this.api.callOrThrow<CategoryStats[]>('getCategoryStats').catch(() => []),
        this.api.callOrThrow<ProductStats[]>('getTopProducts', [10]).catch(() => []),
        this.api.callOrThrow<SalesTrend[]>('getSalesTrend', [30]).catch(() => []),
        this.api.callOrThrow<RevenueData[]>('getRevenueByPeriod', [this.selectedPeriod()]).catch(() => [])
      ]);

      this.products.set(products);
      this.categoryStats.set(categoryStats);
      this.topProducts.set(topProducts);
      this.salesTrend.set(salesTrend);
      this.revenueData.set(revenueData);

      // Calculate metrics
      this.calculateMetrics(products);
      
      // Calculate max values for charts
      this.maxCategoryCount = Math.max(...categoryStats.map(s => s.product_count), 1);
      this.maxRevenue = Math.max(...salesTrend.map(s => s.total_revenue), 1);
    } catch (error) {
      this.logger.error('Failed to load analytics data', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private calculateMetrics(products: Product[]): void {
    const totalProducts = products.length;
    const categories = new Set(products.map(p => p.category));
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const avgPrice = totalProducts > 0 
      ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts 
      : 0;

    this.metrics.update(m => ({
      ...m,
      totalProducts,
      totalCategories: categories.size,
      totalStock,
      avgPrice
    }));
  }

  getCategoryPercentage(count: number): number {
    return (count / this.maxCategoryCount) * 100;
  }

  getTrendBarHeight(revenue: number): number {
    return (revenue / this.maxRevenue) * 100;
  }

  formatTrendDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getAvgTransaction(item: RevenueData): number {
    return item.transactions > 0 ? item.revenue / item.transactions : 0;
  }

  getGrowth(current: RevenueData, previous: RevenueData): string {
    if (previous.revenue === 0) return '—';
    const growth = ((current.revenue - previous.revenue) / previous.revenue) * 100;
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  }
}
