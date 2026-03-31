/**
 * Badge Component
 * 
 * Small status indicators and labels.
 * 
 * @example
 * ```html
 * <app-badge variant="success">Active</app-badge>
 * <app-badge variant="warning" size="sm">Pending</app-badge>
 * <app-badge variant="dot" color="#10b981"></app-badge>
 * ```
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'dot';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (variant() === 'dot') {
      <span
        class="badge badge-dot"
        [class.badge-sm]="size() === 'sm'"
        [class.badge-md]="size() === 'md'"
        [style.background]="color()"
      ></span>
    } @else {
      <span
        class="badge"
        [class]="'badge-' + variant()"
        [class.badge-sm]="size() === 'sm'"
        [class.badge-md]="size() === 'md'"
        [style.background]="getBackground()"
        [style.color]="getTextColor()"
      >
        <ng-content></ng-content>
      </span>
    }
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
    }

    .badge-sm {
      padding: 2px 8px;
      font-size: 11px;
    }

    .badge-md {
      padding: 4px 12px;
      font-size: 12px;
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      min-width: 8px;
      border-radius: 50%;
      padding: 0;
    }

    .badge-default {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
    }

    .badge-primary {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .badge-warning {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .badge-danger {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .badge-info {
      background: rgba(6, 182, 212, 0.2);
      color: #06b6d4;
    }
  `]
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
  readonly size = input<'sm' | 'md'>('md');
  readonly color = input<string>();

  getBackground(): string {
    if (this.color()) {
      return this.color();
    }
    return '';
  }

  getTextColor(): string {
    if (this.color()) {
      return '#fff';
    }
    return '';
  }
}
