/**
 * Card Component
 * 
 * Reusable card container with header, body, and footer sections.
 * 
 * @example
 * ```html
 * <app-card>
 *   <app-card-header title="User Info" icon="👤"></app-card-header>
 *   <app-card-body>
 *     <p>Card content goes here</p>
 *   </app-card-body>
 *   <app-card-footer>
 *     <app-button>Actions</app-button>
 *   </app-card-footer>
 * </app-card>
 * ```
 */

import { Component, input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.card-hoverable]="hoverable()">
      <ng-content select="app-card-header"></ng-content>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <ng-content select="app-card-footer"></ng-content>
    </div>
  `,
  styles: [`
    .card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .card-hoverable {
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        border-color: rgba(148, 163, 184, 0.2);
      }
    }

    .card-body {
      padding: 20px;
    }
  `]
})
export class CardComponent {
  readonly hoverable = input<boolean>(false);
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-header">
      <div class="card-header-content">
        @if (icon()) {
          <span class="card-header-icon">{{ icon() }}</span>
        }
        <h3 class="card-header-title">{{ title() }}</h3>
        @if (subtitle()) {
          <p class="card-header-subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="card-header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      background: rgba(15, 23, 42, 0.3);
    }

    .card-header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-header-icon {
      font-size: 20px;
    }

    .card-header-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .card-header-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 0 8px;
    }

    .card-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class CardHeaderComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly icon = input<string>();
}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-footer" [class.card-footer-bordered]="bordered()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(15, 23, 42, 0.3);
      gap: 12px;
      flex-wrap: wrap;
    }

    .card-footer-bordered {
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }
  `]
})
export class CardFooterComponent {
  readonly bordered = input<boolean>(true);
}
