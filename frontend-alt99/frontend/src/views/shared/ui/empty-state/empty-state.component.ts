/**
 * Empty State Component
 * 
 * Display when no data is available.
 * 
 * @example
 * ```html
 * <app-empty-state
 *   icon="📭"
 *   title="No items found"
 *   description="Try adjusting your search or filters"
 * >
 *   <app-button>Add Item</app-button>
 * </app-empty-state>
 * ```
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      @if (icon()) {
        <div class="empty-icon">{{ icon() }}</div>
      }
      @if (title()) {
        <h3 class="empty-title">{{ title() }}</h3>
      }
      @if (description()) {
        <p class="empty-description">{{ description() }}</p>
      }
      @if (showActions()) {
        <div class="empty-actions">
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 24px;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 8px;
    }

    .empty-description {
      font-size: 14px;
      color: #94a3b8;
      margin: 0 0 24px;
      max-width: 400px;
    }

    .empty-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
  `]
})
export class EmptyStateComponent {
  readonly icon = input<string>('📭');
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly showActions = input<boolean>(true);
}
