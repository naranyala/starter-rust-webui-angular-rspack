/**
 * WelcomeComponent
 *
 * Shown on first load — displays app stats, quick-action cards,
 * and a greeting so the content area is never blank.
 */
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface WelcomeStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-container">
      <!-- Hero -->
      <section class="hero">
        <h1 class="hero-title">Rust WebUI + Angular</h1>
        <p class="hero-subtitle">
          Desktop application framework — Rust backend, Angular frontend, WebUI windowing
        </p>
      </section>

      <!-- Stats Grid -->
      @if (stats(); as s) {
        <section class="stats-section">
          <h2 class="section-heading">Database Overview</h2>
          <div class="stats-grid">
            <div class="stat-card stat-users">
              <span class="stat-emoji">👤</span>
              <span class="stat-value">{{ s.totalUsers }}</span>
              <span class="stat-label">Users</span>
            </div>
            <div class="stat-card stat-products">
              <span class="stat-emoji">📦</span>
              <span class="stat-value">{{ s.totalProducts }}</span>
              <span class="stat-label">Products</span>
            </div>
            <div class="stat-card stat-orders">
              <span class="stat-emoji">🛒</span>
              <span class="stat-value">{{ s.totalOrders }}</span>
              <span class="stat-label">Orders</span>
            </div>
            <div class="stat-card stat-revenue">
              <span class="stat-emoji">💰</span>
              <span class="stat-value">\${{ s.totalRevenue | number:'1.2-2' }}</span>
              <span class="stat-label">Revenue</span>
            </div>
          </div>
        </section>
      } @else {
        <section class="stats-section">
          <div class="loading-skeleton">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
          </div>
        </section>
      }

      <!-- Quick Actions -->
      <section class="quick-actions">
        <h2 class="section-heading">Quick Actions</h2>
        <div class="actions-grid">
          <button class="action-card" (click)="navigateTo('demo_sqlite_crud')">
            <span class="action-icon">🗄️</span>
            <span class="action-title">SQLite CRUD</span>
            <span class="action-desc">Create, read, update, delete users</span>
          </button>
          <button class="action-card" (click)="navigateTo('demo_duckdb_crud')">
            <span class="action-icon">🦆</span>
            <span class="action-title">DuckDB CRUD</span>
            <span class="action-desc">Analytical database demos</span>
          </button>
          <button class="action-card" (click)="navigateTo('demo_vega_charts')">
            <span class="action-icon">📊</span>
            <span class="action-title">Vega Charts</span>
            <span class="action-desc">Data visualizations</span>
          </button>
          <button class="action-card" (click)="navigateTo('docs_home')">
            <span class="action-icon">📚</span>
            <span class="action-title">Documentation</span>
            <span class="action-desc">Guides and API references</span>
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .welcome-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 32px;
    }

    /* Hero */
    .hero {
      text-align: center;
      margin-bottom: 48px;
    }

    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 12px;
    }

    .hero-subtitle {
      color: #94a3b8;
      font-size: 1.1rem;
      margin: 0;
    }

    /* Section headings */
    .section-heading {
      font-size: 1.1rem;
      font-weight: 600;
      color: #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 20px;
    }

    /* Stats */
    .stats-section {
      margin-bottom: 48px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      transition: all 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .stat-emoji {
      font-size: 2rem;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #fff;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #64748b;
      margin-top: 4px;
    }

    .stat-users .stat-value { color: #3b82f6; }
    .stat-products .stat-value { color: #10b981; }
    .stat-orders .stat-value { color: #f59e0b; }
    .stat-revenue .stat-value { color: #06b6d4; }

    /* Loading skeleton */
    .loading-skeleton {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .skeleton-card {
      height: 120px;
      background: rgba(30, 41, 59, 0.3);
      border-radius: 12px;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.7; }
    }

    /* Quick Actions */
    .quick-actions {
      margin-bottom: 32px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.15);
      border-radius: 12px;
      color: #e2e8f0;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .action-card:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      transform: translateY(-2px);
    }

    .action-icon {
      font-size: 1.5rem;
    }

    .action-title {
      font-size: 1rem;
      font-weight: 600;
      color: #fff;
    }

    .action-desc {
      font-size: 0.85rem;
      color: #64748b;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .welcome-container { padding: 24px 16px; }
      .hero-title { font-size: 1.8rem; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .actions-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class WelcomeComponent {
  readonly stats = input<WelcomeStats | undefined>();
  readonly navigateTo = input<(viewId: string) => void>(() => {});
}
