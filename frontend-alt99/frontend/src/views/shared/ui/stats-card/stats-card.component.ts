/**
 * Stats Card Component
 * 
 * Display statistics with icon, value, and label.
 * 
 * @example
 * ```html
 * <app-stats-card
 *   value="1,234"
 *   label="Total Users"
 *   icon="👥"
 *   variant="primary"
 *   [trend]="12.5"
 * ></app-stats-card>
 * ```
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatsVariant = 'primary' | 'success' | 'warning' | 'info' | 'danger';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-card" [class]="'stats-' + variant()">
      <div class="stats-icon" [style.background]="getIconBackground()">
        {{ icon() }}
      </div>
      <div class="stats-content">
        @if (trend() !== undefined && trend() !== null) {
          <div class="stats-trend" [class.trend-positive]="trend()! >= 0" [class.trend-negative]="trend()! < 0">
            <span class="trend-value">{{ trend()! >= 0 ? '+' : '' }}{{ trend() }}%</span>
            <span class="trend-label">vs last period</span>
          </div>
        }
        <span class="stats-value">{{ value() }}</span>
        <span class="stats-label">{{ label() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .stats-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      }
    }

    .stats-icon {
      font-size: 32px;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .stats-primary .stats-icon { background: rgba(59, 130, 246, 0.2); }
    .stats-success .stats-icon { background: rgba(16, 185, 129, 0.2); }
    .stats-warning .stats-icon { background: rgba(245, 158, 11, 0.2); }
    .stats-info .stats-icon { background: rgba(6, 182, 212, 0.2); }
    .stats-danger .stats-icon { background: rgba(239, 68, 68, 0.2); }

    .stats-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .stats-trend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .trend-positive { color: #10b981; }
    .trend-negative { color: #ef4444; }

    .trend-value {
      font-weight: 700;
    }

    .trend-label {
      color: #94a3b8;
    }

    .stats-value {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      line-height: 1;
    }

    .stats-label {
      font-size: 13px;
      color: #94a3b8;
    }
  `]
})
export class StatsCardComponent {
  readonly value = input<string>('0');
  readonly label = input<string>('');
  readonly icon = input<string>('📊');
  readonly variant = input<StatsVariant>('primary');
  readonly trend = input<number>();

  getIconBackground(): string {
    const colors: Record<StatsVariant, string> = {
      primary: 'rgba(59, 130, 246, 0.2)',
      success: 'rgba(16, 185, 129, 0.2)',
      warning: 'rgba(245, 158, 11, 0.2)',
      info: 'rgba(6, 182, 212, 0.2)',
      danger: 'rgba(239, 68, 68, 0.2)',
    };
    return colors[this.variant()];
  }
}
