/**
 * Confirm Modal Service
 * 
 * Provides type-to-confirm delete validation and other confirmation dialogs.
 * Extracts modal logic from components for better separation of concerns.
 * 
 * @example
 * ```typescript
 * // Delete confirmation with type-to-validate
 * const confirmed = await confirmModal.showDeleteConfirm({
 *   title: 'Delete User',
 *   itemName: user.name,
 *   itemDescription: user.email,
 *   confirmText: `DELETE ${user.email}`,
 * });
 * 
 * if (confirmed) {
 *   await backend.deleteUser(user.id);
 * }
 * ```
 */

import { Injectable } from '@angular/core';

// ============================================================================
// Type Definitions
// ============================================================================

export interface DeleteConfirmOptions {
  /** Modal title */
  title: string;
  /** Name of the item being deleted */
  itemName: string;
  /** Optional description/details of the item */
  itemDescription?: string;
  /** Additional info to display (price, stock, etc.) */
  additionalInfo?: string;
  /** Text user must type to confirm (e.g., "DELETE user@example.com") */
  confirmText: string;
  /** Custom warning message */
  warningMessage?: string;
}

export interface ConfirmResult {
  confirmed: boolean;
  cancelled: boolean;
}

// ============================================================================
// Confirm Modal Service
// ============================================================================

@Injectable({ providedIn: 'root' })
export class ConfirmModalService {
  /**
   * Show delete confirmation modal with type-to-validate
   * 
   * @returns Promise<boolean> - true if user confirmed, false if cancelled
   */
  async showDeleteConfirm(options: DeleteConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const modalContainer = document.createElement('div');
      modalContainer.className = 'delete-confirmation-modal';

      modalContainer.innerHTML = this.buildModalHtml(options);

      document.body.appendChild(modalContainer);

      const input = modalContainer.querySelector(
        '.confirmation-input'
      ) as HTMLInputElement;
      const deleteBtn = modalContainer.querySelector(
        '.btn-delete'
      ) as HTMLButtonElement;
      const cancelBtn = modalContainer.querySelector(
        '.btn-cancel'
      ) as HTMLButtonElement;
      const backdrop = modalContainer.querySelector('.modal-backdrop');

      // Enable delete button when confirmation text matches
      input.addEventListener('input', () => {
        if (input.value === options.confirmText) {
          deleteBtn.disabled = false;
          deleteBtn.style.opacity = '1';
          deleteBtn.style.cursor = 'pointer';
          deleteBtn.style.background = 'rgba(239, 68, 68, 0.2)';
        } else {
          deleteBtn.disabled = true;
          deleteBtn.style.opacity = '0.5';
          deleteBtn.style.cursor = 'not-allowed';
          deleteBtn.style.background = 'rgba(239, 68, 68, 0.3)';
        }
      });

      // Handle delete action
      deleteBtn.addEventListener('click', () => {
        if (input.value === options.confirmText) {
          this.closeModal(modalContainer);
          resolve(true);
        }
      });

      // Handle cancel action
      cancelBtn.addEventListener('click', () => {
        this.closeModal(modalContainer);
        resolve(false);
      });

      // Handle backdrop click
      backdrop?.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.closeModal(modalContainer);
          resolve(false);
        }
      });

      // Handle Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', handleEscape);
          this.closeModal(modalContainer);
          resolve(false);
        }
      };
      document.addEventListener('keydown', handleEscape);

      // Focus input after short delay
      setTimeout(() => input.focus(), 100);
    });
  }

  /**
   * Build modal HTML
   */
  private buildModalHtml(options: DeleteConfirmOptions): string {
    const additionalInfoHtml = options.additionalInfo
      ? `<br/><br/>${options.additionalInfo}`
      : '';

    const descriptionHtml = options.itemDescription
      ? `<strong>${options.itemDescription}</strong>`
      : '';

    const warningMessage =
      options.warningMessage ||
      `You are about to permanently delete <strong>${options.itemName}</strong> ${descriptionHtml}.${additionalInfoHtml}<br/><br/>This action cannot be undone.`;

    return `
      <div class="modal-backdrop" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;">
        <div class="modal-container" style="background: #1e293b; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 16px; width: 100%; max-width: 550px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
          <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 24px; border-bottom: 1px solid rgba(239, 68, 68, 0.2);">
            <div class="modal-title-group" style="display: flex; align-items: center; gap: 12px;">
              <span class="modal-icon" style="font-size: 24px;">⚠️</span>
              <h2 class="modal-title" style="font-size: 20px; font-weight: 600; color: #fff; margin: 0;">${options.title}</h2>
            </div>
          </div>
          <div class="modal-body" style="padding: 24px;">
            <div class="warning-message" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="color: #ef4444; margin: 0 0 12px 0; font-weight: 600;">⚠️ This action cannot be undone!</p>
              <p style="color: #fca5a5; margin: 0; font-size: 14px;">
                ${warningMessage}
              </p>
            </div>
            <div class="confirmation-input-group" style="margin-bottom: 16px;">
              <label style="display: block; font-size: 14px; font-weight: 500; color: #94a3b8; margin-bottom: 8px;">
                Type <strong style="color: #ef4444;">${options.confirmText}</strong> to confirm deletion:
              </label>
              <input
                type="text"
                class="confirmation-input"
                placeholder="Type the confirmation text above"
                style="width: 100%; padding: 12px 14px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 8px; color: #fff; font-size: 14px; font-family: monospace;"
                autocomplete="off"
                spellcheck="false"
              />
            </div>
          </div>
          <div class="modal-footer" style="display: flex; gap: 12px; justify-content: flex-end; padding: 24px; border-top: 1px solid rgba(148, 163, 184, 0.1);">
            <button class="btn-cancel" style="padding: 10px 20px; background: rgba(148, 163, 184, 0.2); border: 1px solid rgba(148, 163, 184, 0.3); border-radius: 8px; color: #94a3b8; font-size: 14px; font-weight: 600; cursor: pointer;">Cancel</button>
            <button class="btn-delete" disabled style="padding: 10px 20px; background: rgba(239, 68, 68, 0.3); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #ef4444; font-size: 14px; font-weight: 600; cursor: not-allowed; opacity: 0.5;">Delete Permanently</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Close modal and cleanup
   */
  private closeModal(modalContainer: HTMLElement): void {
    if (modalContainer.parentNode) {
      modalContainer.parentNode.removeChild(modalContainer);
    }
  }
}
