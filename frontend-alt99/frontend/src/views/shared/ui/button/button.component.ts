/**
 * Button Component
 * 
 * Reusable button with multiple variants and states.
 * 
 * @example
 * ```html
 * <app-button variant="primary" (click)="onSave()">Save</app-button>
 * <app-button variant="secondary" icon="🔄" [loading]="isLoading()">Refresh</app-button>
 * <app-button variant="danger" size="sm">Delete</app-button>
 * ```
 */

import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="btn"
      [class.btn-primary]="variant() === 'primary'"
      [class.btn-secondary]="variant() === 'secondary'"
      [class.btn-danger]="variant() === 'danger'"
      [class.btn-ghost]="variant() === 'ghost'"
      [class.btn-outline]="variant() === 'outline'"
      [class.btn-sm]="size() === 'sm'"
      [class.btn-md]="size() === 'md'"
      [class.btn-lg]="size() === 'lg'"
      [class.btn-loading]="loading()"
      [class.btn-icon]="icon()"
      [disabled]="disabled() || loading()"
      (click)="handleClick($event)"
      [attr.aria-label]="ariaLabel()"
      [attr.type]="type()"
    >
      @if (loading()) {
        <span class="btn-spinner">
          <svg class="spinner" viewBox="0 0 24 24">
            <circle class="spinner-track" cx="12" cy="12" r="10" />
            <circle class="spinner-indicator" cx="12" cy="12" r="10" />
          </svg>
        </span>
      }
      @if (icon() && !loading()) {
        <span class="btn-icon-wrapper">{{ icon() }}</span>
      }
      @if (label()) {
        <span class="btn-label">{{ label() }}</span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      position: relative;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #fff;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
      }
    }

    .btn-secondary {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.3);
      
      &:hover:not(:disabled) {
        background: rgba(148, 163, 184, 0.3);
      }
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      
      &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.3);
        box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
      }
    }

    .btn-ghost {
      background: transparent;
      color: #94a3b8;
      
      &:hover:not(:disabled) {
        background: rgba(148, 163, 184, 0.1);
      }
    }

    .btn-outline {
      background: transparent;
      color: #06b6d4;
      border: 1px solid rgba(6, 182, 212, 0.3);
      
      &:hover:not(:disabled) {
        background: rgba(6, 182, 212, 0.1);
      }
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    .btn-md {
      padding: 10px 20px;
      font-size: 14px;
    }

    .btn-lg {
      padding: 14px 28px;
      font-size: 16px;
    }

    .btn-loading {
      pointer-events: none;
    }

    .btn-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      width: 16px;
      height: 16px;
      animation: spin 1s linear infinite;
    }

    .spinner-track {
      fill: none;
      stroke: rgba(255, 255, 255, 0.2);
      stroke-width: 3;
    }

    .spinner-indicator {
      fill: none;
      stroke: currentColor;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-dasharray: 30 50;
      stroke-dashoffset: 0;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .btn-icon-wrapper {
      font-size: 16px;
      line-height: 1;
    }

    .btn-label {
      line-height: 1.2;
    }

    .btn-icon {
      padding: 8px;
      border-radius: 6px;
      
      &.btn-sm {
        padding: 4px;
      }
      
      &.btn-lg {
        padding: 12px;
      }
    }
  `]
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly icon = input<string>();
  readonly label = input<string>('');
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string>();
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly clicked = output<MouseEvent>();

  handleClick(event: MouseEvent): void {
    this.clicked.emit(event);
  }
}
