/**
 * Spinner Component
 * 
 * Loading spinner with customizable size and color.
 * 
 * @example
 * ```html
 * <app-spinner size="md"></app-spinner>
 * <app-spinner size="lg" color="#06b6d4"></app-spinner>
 * ```
 */

import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="spinner-container"
      [class.spinner-sm]="size() === 'sm'"
      [class.spinner-md]="size() === 'md'"
      [class.spinner-lg]="size() === 'lg'"
      [style.color]="color()"
    >
      <svg class="spinner" viewBox="0 0 24 24">
        <circle class="spinner-track" cx="12" cy="12" r="10" />
        <circle class="spinner-indicator" cx="12" cy="12" r="10" />
      </svg>
      @if (label()) {
        <span class="spinner-label">{{ label() }}</span>
      }
    </div>
  `,
  styles: [`
    .spinner-container {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #06b6d4;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    .spinner-sm {
      & .spinner {
        width: 16px;
        height: 16px;
      }
    }

    .spinner-md {
      & .spinner {
        width: 24px;
        height: 24px;
      }
    }

    .spinner-lg {
      & .spinner {
        width: 40px;
        height: 40px;
      }
    }

    .spinner-track {
      fill: none;
      stroke: rgba(148, 163, 184, 0.2);
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

    .spinner-label {
      font-size: 13px;
      color: #94a3b8;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('md');
  readonly color = input<string>('#06b6d4');
  readonly label = input<string>('');
}
