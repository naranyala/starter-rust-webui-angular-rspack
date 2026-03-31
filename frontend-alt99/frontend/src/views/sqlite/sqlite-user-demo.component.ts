/**
 * SQLite User Management - Professional Demo
 * 
 * A production-ready user management interface demonstrating:
 * - Complete CRUD operations with validation
 * - Advanced search and filtering
 * - Real-time statistics dashboard
 * - Professional UI/UX patterns
 * - Responsive design
 */

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../core/logger.service';
import { BackendService, ConfirmModalService } from '../../core';
import { ApiContract } from '../../app/constants/api-contract';
import { ButtonComponent, StatsCardComponent, BadgeComponent, SpinnerComponent, EmptyStateComponent } from '../shared/ui';

// ============================================================================
// Type Definitions
// ============================================================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'User';
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  todayCount: number;
}

export interface UserFilters {
  search: string;
  role: string;
  status: string;
  sortBy: 'name' | 'email' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

// ============================================================================
// Main Component
// ============================================================================

@Component({
  selector: 'app-sqlite-user-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    StatsCardComponent,
    BadgeComponent,
    SpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="sqlite-demo">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-branding">
            <span class="header-icon">🗄️</span>
            <div class="header-text">
              <h1 class="page-title">User Management</h1>
              <p class="page-subtitle">SQLite-powered user administration with complete CRUD operations</p>
            </div>
          </div>
          <div class="header-actions">
            <app-button
              variant="primary"
              icon="➕"
              label="Add User"
              (click)="showCreateModal()"
            />
          </div>
        </div>
      </header>

      <!-- Statistics Dashboard -->
      <section class="stats-section">
        <app-stats-card
          value="{{ stats().totalUsers }}"
          label="Total Users"
          icon="👥"
          variant="primary"
        />
        <app-stats-card
          value="{{ stats().activeUsers }}"
          label="Active Users"
          icon="✅"
          variant="success"
        />
        <app-stats-card
          value="{{ stats().adminUsers }}"
          label="Administrators"
          icon="👑"
          variant="warning"
        />
        <app-stats-card
          value="{{ stats().todayCount }}"
          label="Added Today"
          icon="📅"
          variant="info"
        />
      </section>

      <!-- Filters and Search -->
      <section class="filters-section">
        <div class="filters-bar">
          <div class="search-container">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              class="search-input"
              placeholder="Search by name or email..."
              [(ngModel)]="filters().search"
              (input)="applyFilters()"
            />
          </div>
          
          <div class="filters-group">
            <select
              class="filter-select"
              [(ngModel)]="filters().role"
              (change)="applyFilters()"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>

            <select
              class="filter-select"
              [(ngModel)]="filters().status"
              (change)="applyFilters()"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select
              class="filter-select"
              [(ngModel)]="filters().sortBy"
              (change)="applyFilters()"
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="createdAt">Sort by Date</option>
            </select>

            <button
              class="filter-select"
              (click)="toggleSortOrder()"
              title="Toggle Sort Order"
            >
              {{ filters().sortOrder === 'asc' ? '↑' : '↓' }}
            </button>

            <app-button
              variant="secondary"
              icon="🔄"
              label="Refresh"
              (click)="loadUsers()"
            />
          </div>
        </div>
      </section>

      <!-- Data Table -->
      <section class="table-section">
        <div class="table-container">
          @if (isLoading()) {
            <div class="loading-container">
              <app-spinner size="lg" label="Loading users..." />
            </div>
          } @else if (filteredUsers().length === 0) {
            <app-empty-state
              icon="📭"
              title="No users found"
              description="Try adjusting your search or filters to find what you're looking for."
              [showActions]="false"
            />
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-id">ID</th>
                  <th class="col-user">User</th>
                  <th class="col-role">Role</th>
                  <th class="col-status">Status</th>
                  <th class="col-date">Created</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (user of filteredUsers(); track user.id) {
                  <tr class="table-row" [class.row-active]="selectedUser()?.id === user.id">
                    <td class="cell-id">
                      <span class="id-badge">#{{ user.id }}</span>
                    </td>
                    <td class="cell-user">
                      <div class="user-info">
                        <div class="user-avatar">{{ getInitials(user.name) }}</div>
                        <div class="user-details">
                          <div class="user-name">{{ user.name }}</div>
                          <div class="user-email">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="cell-role">
                      <app-badge
                        [variant]="getRoleBadge(user.role)"
                        size="md"
                      >
                        {{ user.role }}
                      </app-badge>
                    </td>
                    <td class="cell-status">
                      <app-badge
                        [variant]="getStatusBadge(user.status)"
                        size="md"
                      >
                        {{ user.status }}
                      </app-badge>
                    </td>
                    <td class="cell-date">
                      <span class="date-text">{{ formatDate(user.createdAt) }}</span>
                    </td>
                    <td class="cell-actions">
                      <div class="action-buttons">
                        <button
                          class="action-btn btn-edit"
                          (click)="editUser(user)"
                          title="Edit User"
                        >
                          ✏️
                        </button>
                        <button
                          class="action-btn btn-delete"
                          (click)="deleteUser(user)"
                          title="Delete User"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }

          <!-- Table Footer -->
          @if (filteredUsers().length > 0) {
            <div class="table-footer">
              <span class="results-count">
                Showing {{ filteredUsers().length }} of {{ users().length }} users
              </span>
            </div>
          }
        </div>
      </section>

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-container" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-group">
                <span class="modal-icon">{{ isEditing() ? '✏️' : '➕' }}</span>
                <h2 class="modal-title">{{ isEditing() ? 'Edit User' : 'Create New User' }}</h2>
              </div>
              <button class="modal-close" (click)="closeModal()">✕</button>
            </div>

            <form class="modal-form" (ngSubmit)="saveUser()">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    Full Name
                    <span class="required">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-input"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    placeholder="John Doe"
                    autocomplete="name"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Email Address
                    <span class="required">*</span>
                  </label>
                  <input
                    type="email"
                    class="form-input"
                    [(ngModel)]="formData.email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    autocomplete="email"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Role</label>
                  <select class="form-input" [(ngModel)]="formData.role" name="role">
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select class="form-input" [(ngModel)]="formData.status" name="status">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              @if (errorMessage()) {
                <div class="form-error">
                  <span class="error-icon">⚠️</span>
                  <span class="error-message">{{ errorMessage() }}</span>
                </div>
              }

              <div class="modal-footer">
                <app-button
                  variant="secondary"
                  label="Cancel"
                  type="button"
                  (click)="closeModal()"
                />
                <app-button
                  variant="primary"
                  [label]="saving() ? 'Saving...' : (isEditing() ? 'Update User' : 'Create User')"
                  [loading]="saving()"
                  type="submit"
                />
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .sqlite-demo {
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100%;
    }

    /* Page Header */
    .page-header {
      margin-bottom: 32px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .header-branding {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 40px;
      line-height: 1;
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
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    /* Statistics Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    /* Filters Section */
    .filters-section {
      margin-bottom: 24px;
    }

    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
    }

    .search-container {
      flex: 1;
      max-width: 400px;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      opacity: 0.5;
    }

    .search-input {
      width: 100%;
      padding: 12px 16px 12px 44px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: rgba(59, 130, 246, 0.5);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    .filters-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .filter-select {
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: rgba(148, 163, 184, 0.3);
      }

      &:focus {
        outline: none;
        border-color: rgba(59, 130, 246, 0.5);
      }
    }

    /* Table Section */
    .table-section {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .table-container {
      overflow: hidden;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      padding: 14px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(15, 23, 42, 0.8);
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .data-table td {
      padding: 16px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      color: #e2e8f0;
      font-size: 14px;
    }

    .table-row {
      transition: all 0.2s;

      &:hover {
        background: rgba(59, 130, 246, 0.05);
      }

      &.row-active {
        background: rgba(59, 130, 246, 0.1);
      }
    }

    .col-id { width: 80px; }
    .col-user { min-width: 250px; }
    .col-role { width: 120px; }
    .col-status { width: 120px; }
    .col-date { width: 140px; }
    .col-actions { width: 120px; }

    .cell-id {
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      color: #64748b;
    }

    .id-badge {
      padding: 4px 10px;
      background: rgba(148, 163, 184, 0.1);
      border-radius: 6px;
      font-size: 12px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #fff;
      font-size: 14px;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 13px;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .date-text {
      font-size: 13px;
      color: #94a3b8;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      background: transparent;
      opacity: 0.7;
      transition: all 0.2s;

      &:hover {
        opacity: 1;
        transform: scale(1.1);
      }

      &.btn-edit:hover {
        background: rgba(59, 130, 246, 0.2);
      }

      &.btn-delete:hover {
        background: rgba(239, 68, 68, 0.2);
      }
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      background: rgba(15, 23, 42, 0.5);
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }

    .results-count {
      font-size: 13px;
      color: #94a3b8;
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-container {
      background: #1e293b;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .modal-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-icon {
      font-size: 24px;
    }

    .modal-title {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .modal-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 24px;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
      transition: all 0.2s;

      &:hover {
        color: #fff;
        transform: rotate(90deg);
      }
    }

    .modal-form {
      padding: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-size: 14px;
      font-weight: 500;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .required {
      color: #ef4444;
    }

    .form-input {
      padding: 12px 14px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: rgba(59, 130, 246, 0.5);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #ef4444;
      font-size: 14px;
    }

    .error-icon {
      font-size: 18px;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 1024px) {
      .filters-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-container {
        max-width: 100%;
      }

      .filters-group {
        flex-wrap: wrap;
      }
    }

    @media (max-width: 768px) {
      .sqlite-demo {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .header-branding {
        flex-direction: column;
        text-align: center;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .data-table {
        font-size: 13px;
      }

      .user-info {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class SqliteUserDemoComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly backend = inject(BackendService);
  private readonly confirmModal = inject(ConfirmModalService);

  // State
  isLoading = signal(false);
  saving = signal(false);
  showModal = signal(false);
  isEditing = signal(false);
  errorMessage = signal('');
  selectedUser = signal<User | null>(null);

  // Data
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  stats = signal<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    todayCount: 0
  });

  // Filters
  filters = signal<UserFilters>({
    search: '',
    role: '',
    status: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Form
  formData = {
    name: '',
    email: '',
    role: 'User' as User['role'],
    status: 'Active' as User['status']
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [usersData, statsData] = await Promise.all([
        this.backend.callOrThrow<User[]>(ApiContract.Users.GET_ALL).catch(() => []),
        this.backend.callOrThrow<UserStats>(ApiContract.Users.GET_STATS).catch(() => ({
          totalUsers: 0,
          activeUsers: 0,
          adminUsers: 0,
          todayCount: 0
        }))
      ]);

      this.users.set(usersData);
      this.stats.set(statsData);
      this.applyFilters();
      
      this.logger.info(`Loaded ${usersData.length} users`);
    } catch (error) {
      this.logger.error('Failed to load users', error);
      this.errorMessage.set('Failed to load users. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  applyFilters(): void {
    let filtered = [...this.users()];
    const { search, role, status, sortBy, sortOrder } = this.filters();

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (role) {
      filtered = filtered.filter(user => user.role === role);
    }

    // Status filter
    if (status) {
      filtered = filtered.filter(user => user.status === status);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    this.filteredUsers.set(filtered);
  }

  toggleSortOrder(): void {
    this.filters.update(f => ({
      ...f,
      sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
    this.applyFilters();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getRoleBadge(role: string): 'primary' | 'warning' | 'default' {
    switch (role) {
      case 'Admin': return 'warning';
      case 'Manager': return 'primary';
      default: return 'default';
    }
  }

  getStatusBadge(status: string): 'success' | 'default' | 'danger' {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      case 'Suspended': return 'danger';
      default: return 'default';
    }
  }

  showCreateModal(): void {
    this.isEditing.set(false);
    this.formData = {
      name: '',
      email: '',
      role: 'User',
      status: 'Active'
    };
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  editUser(user: User): void {
    this.isEditing.set(true);
    this.selectedUser.set(user);
    this.formData = {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    };
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.errorMessage.set('');
    this.selectedUser.set(null);
  }

  async saveUser(): Promise<void> {
    // Validation
    if (!this.formData.name?.trim()) {
      this.errorMessage.set('Name is required');
      return;
    }

    if (!this.formData.email?.trim()) {
      this.errorMessage.set('Email is required');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errorMessage.set('Please enter a valid email address');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    try {
      if (this.isEditing()) {
        const userId = this.selectedUser()?.id || 0;
        await this.backend.callOrThrow(ApiContract.Users.UPDATE, [
          userId,
          this.formData.name,
          this.formData.email,
          this.formData.role,
          this.formData.status
        ]);
        this.logger.info('User updated successfully');
      } else {
        await this.backend.callOrThrow(ApiContract.Users.CREATE, [
          this.formData.name,
          this.formData.email,
          this.formData.role,
          this.formData.status
        ]);
        this.logger.info('User created successfully');
      }

      await this.loadUsers();
      this.closeModal();
    } catch (error: any) {
      this.logger.error('Failed to save user', error);
      this.errorMessage.set(error.message || 'Failed to save user');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.confirmModal.showDeleteConfirm({
      title: 'Delete User',
      itemName: user.name,
      itemDescription: user.email,
      confirmText: `DELETE ${user.email}`,
      warningMessage: `You are about to permanently delete <strong>${user.name}</strong> (${user.email}).<br/><br/>All associated data will be removed.`,
    });
    
    if (!confirmed) {
      this.logger.info('Delete cancelled by user');
      return;
    }

    try {
      await this.backend.callOrThrow(ApiContract.Users.DELETE, [user.id]);
      this.logger.info('User deleted successfully');
      await this.loadUsers();
    } catch (error: any) {
      this.logger.error('Failed to delete user', error);
      this.errorMessage.set(error.message || 'Failed to delete user');
    }
  }
}
