/**
 * Backend Service - Unified Backend Communication
 * 
 * Single service for all backend communication, replacing:
 * - ApiService (direct calls)
 * - CommunicationService (multi-channel)
 * - WebUIBridgeService (WebUI specific)
 * 
 * Provides:
 * - Type-safe API calls with contract constants
 * - Automatic loading/error state management
 * - Event publishing and subscribing
 * - Shared state management
 */

import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiContract, ApiFunctionName } from '../app/constants/api-contract';
import { DEFAULT_TIMEOUT_MS } from '../app/constants/app.constants';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: number;
}

export interface BackendState {
  loading: boolean;
  error: string | null;
  lastCallTime: number | null;
  callCount: number;
}

export type EventHandler = (data: unknown, event: string) => void;

// ============================================================================
// Backend Service
// ============================================================================

@Injectable({ providedIn: 'root' })
export class BackendService {
  private readonly defaultTimeout = DEFAULT_TIMEOUT_MS;

  // State Signals
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);
  private readonly lastCallTime = signal<number | null>(null);
  private readonly callCount = signal(0);
  private readonly eventHandlers = new Map<string, Set<EventHandler>>();

  // Public Readonly Signals
  readonly isLoading = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();
  readonly lastCallTime$ = this.lastCallTime.asReadonly();
  readonly callCount$ = this.callCount.asReadonly();
  readonly hasError = computed(() => this.error() !== null);
  readonly isReady = computed(() => !this.loading() && this.error() === null);

  constructor() {
    this.setupEventListeners();
  }

  // ============================================================================
  // API Calls - Type-Safe
  // ============================================================================

  /**
   * Call a backend function with automatic loading/error state management
   * 
   * @example
   * ```typescript
   * // Using API contract (recommended)
   * const users = await backend.call<User[]>(ApiContract.Users.GET_ALL);
   * 
   * // With arguments
   * const userId = await backend.call<number>(ApiContract.Users.CREATE, [
   *   'John', 'john@example.com', 'User', 'Active'
   * ]);
   * ```
   */
  async call<T>(
    functionName: ApiFunctionName,
    args: unknown[] = [],
    options?: { timeoutMs?: number; skipLoading?: boolean }
  ): Promise<ApiResponse<T>> {
    // Security: Validate function name against allowlist
    if (!this.isValidFunctionName(functionName)) {
      throw new Error(`Invalid backend function: ${functionName}`);
    }
    
    const skipLoading = options?.skipLoading ?? false;
    
    if (!skipLoading) {
      this.loading.set(true);
      this.error.set(null);
      this.callCount.update(count => count + 1);
    }

    return new Promise((resolve, reject) => {
      const timeoutMs = options?.timeoutMs ?? this.defaultTimeout;
      const responseEventName = `${functionName}_response`;

      const handler = (event: CustomEvent<ApiResponse<T>>) => {
        clearTimeout(timeoutId);
        window.removeEventListener(responseEventName, handler as EventListener);

        if (!skipLoading) {
          this.loading.set(false);
          this.lastCallTime.set(Date.now());
        }

        if (!event.detail.success) {
          const errorMsg = event.detail.error ?? 'Unknown error';
          if (!skipLoading) {
            this.error.set(errorMsg);
          }
        }

        resolve(event.detail);
      };

      const timeoutId = setTimeout(() => {
        window.removeEventListener(responseEventName, handler as EventListener);
        if (!skipLoading) {
          this.loading.set(false);
          this.error.set(`Request timeout after ${timeoutMs}ms`);
        }

        reject({
          success: false,
          error: `Request timeout after ${timeoutMs}ms`,
        });
      }, timeoutMs);

      try {
        const backendFn = (window as unknown as Record<string, unknown>)[functionName];

        if (typeof backendFn !== 'function') {
          clearTimeout(timeoutId);
          window.removeEventListener(responseEventName, handler as EventListener);
          if (!skipLoading) {
            this.loading.set(false);
            this.error.set(`Backend function not found: ${functionName}`);
          }

          reject({
            success: false,
            error: `Backend function not found: ${functionName}`,
          });
          return;
        }

        backendFn(...args);
      } catch (error) {
        clearTimeout(timeoutId);
        window.removeEventListener(responseEventName, handler as EventListener);
        if (!skipLoading) {
          this.loading.set(false);
          const errorMsg = error instanceof Error ? error.message : String(error);
          this.error.set(errorMsg);
        }

        reject({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  }

  /**
   * Call backend and throw on error (returns data directly, not ApiResponse)
   * 
   * @example
   * ```typescript
   * const users = await backend.callOrThrow(ApiContract.Users.GET_ALL);
   * ```
   */
  async callOrThrow<T>(
    functionName: ApiFunctionName,
    args: unknown[] = []
  ): Promise<T> {
    const response = await this.call<T>(functionName, args);
    if (!response.success) {
      throw new Error(response.error ?? 'Unknown error');
    }
    return response.data as T;
  }

  // ============================================================================
  // Convenience Methods - Type-Safe Wrappers
  // ============================================================================

  // User Operations
  async getUsers() {
    return this.callOrThrow<User[]>(ApiContract.Users.GET_ALL);
  }

  async getUserStats() {
    return this.callOrThrow<UserStats>(ApiContract.Users.GET_STATS);
  }

  async createUser(name: string, email: string, role: string, status: string) {
    return this.callOrThrow<number>(ApiContract.Users.CREATE, [name, email, role, status]);
  }

  async updateUser(id: number, name: string, email: string, role: string, status: string) {
    return this.callOrThrow(ApiContract.Users.UPDATE, [id, name, email, role, status]);
  }

  async deleteUser(id: number) {
    return this.callOrThrow(ApiContract.Users.DELETE, [id]);
  }

  // Product Operations
  async getProducts() {
    return this.callOrThrow<Product[]>(ApiContract.Products.GET_ALL);
  }

  async createProduct(
    name: string,
    description: string,
    price: number,
    category: string,
    stock: number
  ) {
    return this.callOrThrow<number>(ApiContract.Products.CREATE, [
      name,
      description,
      price,
      category,
      stock,
    ]);
  }

  async updateProduct(
    id: number,
    name: string,
    description: string,
    price: number,
    category: string,
    stock: number
  ) {
    return this.callOrThrow(ApiContract.Products.UPDATE, [
      id,
      name,
      description,
      price,
      category,
      stock,
    ]);
  }

  async deleteProduct(id: number) {
    return this.callOrThrow(ApiContract.Products.DELETE, [id]);
  }

  async getCategoryStats() {
    return this.callOrThrow<CategoryStats[]>(ApiContract.Products.GET_CATEGORY_STATS);
  }

  // Order Operations
  async getOrders() {
    return this.callOrThrow<Order[]>(ApiContract.Orders.GET_ALL);
  }

  async createOrder(
    userId: number,
    productId: number,
    quantity: number,
    totalPrice: number,
    status: string
  ) {
    return this.callOrThrow<number>(ApiContract.Orders.CREATE, [
      userId,
      productId,
      quantity,
      totalPrice,
      status,
    ]);
  }

  async updateOrder(id: number, quantity: number, totalPrice: number, status: string) {
    return this.callOrThrow(ApiContract.Orders.UPDATE, [id, quantity, totalPrice, status]);
  }

  async deleteOrder(id: number) {
    return this.callOrThrow(ApiContract.Orders.DELETE, [id]);
  }

  // Analytics Operations
  async getSalesTrend(days: number) {
    return this.callOrThrow<SalesTrend[]>(ApiContract.Analytics.GET_SALES_TREND, [days]);
  }

  async getTopProducts(limit: number) {
    return this.callOrThrow<ProductStats[]>(ApiContract.Analytics.GET_TOP_PRODUCTS, [limit]);
  }

  async getRevenueByPeriod(period: 'daily' | 'monthly' | 'quarterly') {
    return this.callOrThrow<RevenueData[]>(ApiContract.Analytics.GET_REVENUE_BY_PERIOD, [
      period,
    ]);
  }

  // Database Management Operations
  async getDatabaseInfo() {
    return this.callOrThrow<DatabaseInfo>(ApiContract.Database.GET_INFO);
  }

  async createBackup() {
    return this.callOrThrow<BackupResponse>(ApiContract.Database.CREATE_BACKUP);
  }

  async listBackups() {
    return this.callOrThrow<BackupInfo[]>(ApiContract.Database.LIST_BACKUPS);
  }

  async restoreBackup(backupPath: string) {
    return this.callOrThrow(ApiContract.Database.RESTORE_BACKUP, [backupPath]);
  }

  async verifyDatabaseIntegrity() {
    return this.callOrThrow<IntegrityStatus>(ApiContract.Database.VERIFY_INTEGRITY);
  }

  // ============================================================================
  // Event System
  // ============================================================================

  /**
   * Subscribe to backend events
   * 
   * @example
   * ```typescript
   * const unsubscribe = backend.subscribe('user.created', (data) => {
   *   console.log('New user created:', data);
   * });
   * 
   * // Later...
   * unsubscribe();
   * ```
   */
  subscribe(event: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Publish an event to backend
   */
  async publish(event: string, data: unknown): Promise<void> {
    try {
      await this.call(ApiContract.System.PUBLISH_EVENT, [event, data], {
        skipLoading: true,
      });
    } catch {
      // Ignore publish errors (fire and forget)
    }
  }

  /**
   * Emit a local event (triggers local handlers)
   */
  emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data, event));
    }
  }

  // ============================================================================
  // State Management
  // ============================================================================

  /**
   * Clear error state
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.loading.set(false);
    this.error.set(null);
    this.lastCallTime.set(null);
    this.callCount.set(0);
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  /**
   * Validate function name against allowlist
   * Security: Prevents arbitrary function execution
   */
  private isValidFunctionName(name: string): boolean {
    // Allow only known API contract functions
    const allowedFunctions = new Set<ApiFunctionName>([
      // Users
      ApiContract.Users.GET_ALL,
      ApiContract.Users.GET_BY_ID,
      ApiContract.Users.CREATE,
      ApiContract.Users.UPDATE,
      ApiContract.Users.DELETE,
      ApiContract.Users.GET_STATS,
      // Products
      ApiContract.Products.GET_ALL,
      ApiContract.Products.GET_BY_ID,
      ApiContract.Products.CREATE,
      ApiContract.Products.UPDATE,
      ApiContract.Products.DELETE,
      ApiContract.Products.GET_CATEGORY_STATS,
      // Orders
      ApiContract.Orders.GET_ALL,
      ApiContract.Orders.GET_BY_ID,
      ApiContract.Orders.CREATE,
      ApiContract.Orders.UPDATE,
      ApiContract.Orders.DELETE,
      // Analytics
      ApiContract.Analytics.GET_SALES_TREND,
      ApiContract.Analytics.GET_TOP_PRODUCTS,
      ApiContract.Analytics.GET_REVENUE_BY_PERIOD,
      // Database
      ApiContract.Database.GET_INFO,
      ApiContract.Database.CREATE_BACKUP,
      ApiContract.Database.LIST_BACKUPS,
      ApiContract.Database.RESTORE_BACKUP,
      ApiContract.Database.VERIFY_INTEGRITY,
      ApiContract.Database.CLEANUP_BACKUPS,
      // System
      ApiContract.System.GET_STATS,
      ApiContract.System.PUBLISH_EVENT,
      ApiContract.System.GET_EVENT_HISTORY,
    ]);
    
    return allowedFunctions.has(name as ApiFunctionName);
  }

  private setupEventListeners(): void {
    // Listen for backend events and emit locally
    window.addEventListener('backend-event', ((event: CustomEvent) => {
      const { event: eventName, data } = event.detail;
      this.emit(eventName, data);
    }) as EventListener);
  }
}

// ============================================================================
// Type Definitions (should be imported from shared types in production)
// ============================================================================

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  todayCount: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

interface CategoryStats {
  category: string;
  productCount: number;
  avgPrice: number;
  totalStock: number;
  minPrice: number;
  maxPrice: number;
}

interface Order {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface SalesTrend {
  date: string;
  orderCount: number;
  totalQuantity: number;
  totalRevenue: number;
  avgOrderValue: number;
}

interface ProductStats {
  id: number;
  name: string;
  category: string;
  orderCount: number;
  totalSold: number;
  totalRevenue: number;
}

interface RevenueData {
  period: string;
  revenue: number;
  transactions: number;
}

interface DatabaseInfo {
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

interface BackupInfo {
  path: string;
  size: number;
  created: number;
  modified: number;
  modifiedFormatted: string;
}

interface BackupResponse {
  backupPath: string;
  message: string;
}

interface IntegrityStatus {
  isValid: boolean;
  message: string;
  lastVerified: number;
  lastVerifiedFormatted: string;
}
