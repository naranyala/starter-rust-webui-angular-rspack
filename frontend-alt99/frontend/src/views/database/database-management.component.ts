/**
 * Database Management Component
 * 
 * Provides database management capabilities:
 * - View database information and statistics
 * - Create and restore backups
 * - Verify database integrity
 * - Monitor data persistence status
 */

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerService } from '../../core/logger.service';
import { BackendService } from '../../core/backend.service';
import { ApiContract } from '../../app/constants/api-contract';
import { ButtonComponent, StatsCardComponent, SpinnerComponent, BadgeComponent } from '../shared/ui';

export interface DatabaseInfo {
  path: string;
  size: number;
  sizeFormatted: string;
  created: number;
  modified: number;
  userCount: number;
  productCount: number;
  orderCount: number;
  backupCount: number;
  isPersistent: boolean;
}

export interface BackupInfo {
  path: string;
  size: number;
  created: number;
  modified: number;
  modifiedFormatted: string;
}

export interface IntegrityStatus {
  isValid: boolean;
  message: string;
  lastVerified: number;
  lastVerifiedFormatted: string;
}

@Component({
  selector: 'app-database-management',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    StatsCardComponent,
    SpinnerComponent,
    BadgeComponent,
  ],
  template: `
    <div class="db-management">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-branding">
            <span class="header-icon">🗄️</span>
            <div class="header-text">
              <h1 class="page-title">Database Management</h1>
              <p class="page-subtitle">Backup, restore, and monitor your persistent data</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Database Info Cards -->
      @if (dbInfo()) {
        <section class="info-section">
          <div class="info-grid">
            <div class="info-card">
              <div class="info-label">Database Path</div>
              <div class="info-value">{{ dbInfo()!.path }}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Database Size</div>
              <div class="info-value">{{ dbInfo()!.sizeFormatted }}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Persistence Status</div>
              <div class="info-value">
                <app-badge [variant]="dbInfo()!.isPersistent ? 'success' : 'warning'" size="md">
                  {{ dbInfo()!.isPersistent ? '✓ Persistent' : '⚠ Temporary' }}
                </app-badge>
              </div>
            </div>
            <div class="info-card">
              <div class="info-label">Last Modified</div>
              <div class="info-value">{{ formatDate(dbInfo()!.modified) }}</div>
            </div>
          </div>
        </section>

        <!-- Statistics -->
        <section class="stats-section">
          <app-stats-card
            value="{{ dbInfo()!.userCount }}"
            label="Total Users"
            icon="👥"
            variant="primary"
          />
          <app-stats-card
            value="{{ dbInfo()!.productCount }}"
            label="Total Products"
            icon="📦"
            variant="success"
          />
          <app-stats-card
            value="{{ dbInfo()!.orderCount }}"
            label="Total Orders"
            icon="📋"
            variant="warning"
          />
          <app-stats-card
            value="{{ dbInfo()!.backupCount }}"
            label="Available Backups"
            icon="💾"
            variant="info"
          />
        </section>

        <!-- Integrity Status -->
        @if (integrityStatus()) {
          <section class="integrity-section">
            <div class="integrity-card" [class.valid]="integrityStatus()!.isValid" [class.invalid]="!integrityStatus()!.isValid">
              <div class="integrity-header">
                <span class="integrity-icon">{{ integrityStatus()!.isValid ? '✅' : '❌' }}</span>
                <h3 class="integrity-title">Database Integrity</h3>
                <app-badge [variant]="integrityStatus()!.isValid ? 'success' : 'danger'" size="md">
                  {{ integrityStatus()!.isValid ? 'Healthy' : 'Issues Detected' }}
                </app-badge>
              </div>
              <div class="integrity-body">
                <p class="integrity-message">{{ integrityStatus()!.message }}</p>
                <p class="integrity-date">Last verified: {{ integrityStatus()!.lastVerifiedFormatted }}</p>
              </div>
            </div>
          </section>
        }
      } @else {
        <div class="loading-container">
          <app-spinner size="lg" label="Loading database information..." />
        </div>
      }

      <!-- Actions -->
      <section class="actions-section">
        <div class="action-cards">
          <!-- Create Backup -->
          <div class="action-card">
            <div class="action-icon">💾</div>
            <h3 class="action-title">Create Backup</h3>
            <p class="action-description">Create a backup of your current database. This can be used to restore your data later.</p>
            <app-button
              variant="primary"
              [label]="creatingBackup() ? 'Creating...' : 'Create Backup'"
              [loading]="creatingBackup()"
              (click)="createBackup()"
            />
          </div>

          <!-- Verify Integrity -->
          <div class="action-card">
            <div class="action-icon">✅</div>
            <h3 class="action-title">Verify Integrity</h3>
            <p class="action-description">Check the database for corruption or errors. Recommended after unexpected shutdowns.</p>
            <app-button
              variant="secondary"
              [label]="verifyingIntegrity() ? 'Verifying...' : 'Verify Now'"
              [loading]="verifyingIntegrity()"
              (click)="verifyIntegrity()"
            />
          </div>

          <!-- Refresh Info -->
          <div class="action-card">
            <div class="action-icon">🔄</div>
            <h3 class="action-title">Refresh Info</h3>
            <p class="action-description">Reload database information and statistics from the server.</p>
            <app-button
              variant="ghost"
              [label]="'Refresh'"
              icon="🔄"
              (click)="loadDatabaseInfo()"
            />
          </div>
        </div>
      </section>

      <!-- Backups List -->
      @if (backups().length > 0) {
        <section class="backups-section">
          <div class="section-header">
            <h2 class="section-title">Available Backups</h2>
            <app-button
              variant="secondary"
              label="Refresh List"
              icon="🔄"
              (click)="listBackups()"
            />
          </div>
          <div class="backups-list">
            @for (backup of backups(); track backup.path) {
              <div class="backup-item">
                <div class="backup-info">
                  <div class="backup-path">{{ backup.path | basename }}</div>
                  <div class="backup-meta">
                    <span class="backup-size">{{ formatSize(backup.size) }}</span>
                    <span class="backup-date">{{ backup.modifiedFormatted }}</span>
                  </div>
                </div>
                <div class="backup-actions">
                  <app-button
                    variant="secondary"
                    label="Restore"
                    size="sm"
                    (click)="restoreBackup(backup)"
                  />
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Persistence Notice -->
      <section class="notice-section">
        <div class="notice-card">
          <div class="notice-icon">ℹ️</div>
          <div class="notice-content">
            <h4 class="notice-title">Data Persistence Information</h4>
            <div class="notice-body">
              <ul class="notice-list">
                <li>✓ Your data is stored persistently in SQLite database files</li>
                <li>✓ Data survives application restarts and system reboots</li>
                <li>✓ Sample data is only inserted when the database is first created</li>
                <li>✓ You must explicitly delete data through the UI</li>
                <li>✓ Regular backups are recommended for production use</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .db-management {
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100%;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-branding {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 40px;
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
    }

    .page-subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
    }

    .info-section {
      margin-bottom: 32px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .info-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 20px;
    }

    .info-label {
      font-size: 12px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .info-value {
      font-size: 16px;
      color: #fff;
      font-weight: 600;
      word-break: break-all;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .integrity-section {
      margin-bottom: 32px;
    }

    .integrity-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 24px;
    }

    .integrity-card.valid {
      border-color: rgba(16, 185, 129, 0.3);
    }

    .integrity-card.invalid {
      border-color: rgba(239, 68, 68, 0.3);
    }

    .integrity-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .integrity-icon {
      font-size: 24px;
    }

    .integrity-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
      flex: 1;
    }

    .integrity-body {
      color: #94a3b8;
      font-size: 14px;
    }

    .integrity-message {
      margin: 0 0 8px 0;
    }

    .integrity-date {
      margin: 0;
      font-size: 13px;
    }

    .actions-section {
      margin-bottom: 32px;
    }

    .action-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .action-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .action-icon {
      font-size: 32px;
    }

    .action-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .action-description {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.6;
      flex: 1;
    }

    .backups-section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .backups-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .backup-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
    }

    .backup-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .backup-path {
      font-family: 'Fira Code', monospace;
      font-size: 14px;
      color: #fff;
    }

    .backup-meta {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #94a3b8;
    }

    .notice-section {
      margin-bottom: 32px;
    }

    .notice-card {
      display: flex;
      gap: 16px;
      padding: 24px;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.2);
      border-radius: 12px;
    }

    .notice-icon {
      font-size: 32px;
      flex-shrink: 0;
    }

    .notice-content {
      flex: 1;
    }

    .notice-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 12px 0;
    }

    .notice-body {
      margin: 0;
    }

    .notice-list {
      margin: 0;
      padding-left: 20px;
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.8;
    }

    .notice-list li {
      margin-bottom: 4px;
    }

    @media (max-width: 1200px) {
      .info-grid,
      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .action-cards {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .db-management {
        padding: 16px;
      }

      .info-grid,
      .stats-section {
        grid-template-columns: 1fr;
      }

      .backup-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }
  `]
})
export class DatabaseManagementComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly backend = inject(BackendService);

  dbInfo = signal<DatabaseInfo | null>(null);
  backups = signal<BackupInfo[]>([]);
  integrityStatus = signal<IntegrityStatus | null>(null);

  creatingBackup = signal(false);
  verifyingIntegrity = signal(false);

  ngOnInit(): void {
    this.loadDatabaseInfo();
    this.listBackups();
    this.verifyIntegrity();
  }

  async loadDatabaseInfo(): Promise<void> {
    try {
      const response = await this.backend.callOrThrow<any>(ApiContract.Database.GET_INFO);
      if (response) {
        this.dbInfo.set(response);
        this.logger.info('Database info loaded', response);
      }
    } catch (error) {
      this.logger.error('Failed to load database info', error);
    }
  }

  async listBackups(): Promise<void> {
    try {
      const response = await this.backend.callOrThrow<any>(ApiContract.Database.LIST_BACKUPS);
      if (response) {
        this.backups.set(response);
        this.logger.info(`Found ${response.length} backups`);
      }
    } catch (error) {
      this.logger.error('Failed to list backups', error);
    }
  }

  async createBackup(): Promise<void> {
    this.creatingBackup.set(true);
    try {
      const response = await this.backend.callOrThrow<any>(ApiContract.Database.CREATE_BACKUP);
      if (response) {
        this.logger.info('Backup created', response);
        await this.loadDatabaseInfo();
        await this.listBackups();
        alert(`Backup created successfully!\n\n${response.backupPath || response.backup_path}`);
      }
    } catch (error: any) {
      this.logger.error('Failed to create backup', error);
      alert(`Failed to create backup: ${error.message}`);
    } finally {
      this.creatingBackup.set(false);
    }
  }

  async verifyIntegrity(): Promise<void> {
    this.verifyingIntegrity.set(true);
    try {
      const response = await this.backend.callOrThrow<any>(ApiContract.Database.VERIFY_INTEGRITY);
      if (response) {
        this.integrityStatus.set(response);
        this.logger.info('Integrity check complete', response);
        if (!response.isValid) {
          alert('⚠️ Database integrity issues detected!\n\n' + response.message);
        }
      }
    } catch (error) {
      this.logger.error('Failed to verify integrity', error);
    } finally {
      this.verifyingIntegrity.set(false);
    }
  }

  async restoreBackup(backup: BackupInfo): Promise<void> {
    const confirmed = confirm(
      `⚠️ Restore Database\n\n` +
      `Are you sure you want to restore from this backup?\n\n` +
      `Backup: ${backup.path}\n` +
      `Created: ${backup.modifiedFormatted}\n\n` +
      `⚠️ This will replace your current database! A backup will be created before restoration.`
    );

    if (!confirmed) return;

    try {
      const response = await this.backend.callOrThrow<any>(ApiContract.Database.RESTORE_BACKUP, [backup.path]);
      if (response) {
        alert('✅ Database restored successfully!\n\nThe application will continue running with the restored data.');
        await this.loadDatabaseInfo();
        await this.listBackups();
      }
    } catch (error: any) {
      this.logger.error('Failed to restore backup', error);
      alert(`Failed to restore backup: ${error.message}`);
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  formatSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${bytes} bytes`;
  }
}

// Pipe for extracting basename from path
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'basename',
  standalone: true,
})
export class BasenamePipe implements PipeTransform {
  transform(value: string): string {
    return value.split('/').pop() || value;
  }
}
