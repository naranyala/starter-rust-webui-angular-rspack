/**
 * API Contract — Centralized backend function definitions.
 *
 * This is the single source of truth for all backend function names.
 * Used by ApiService for whitelist enforcement and by components
 * for type-safe backend calls.
 *
 * Keep this in sync with Rust handler `window.bind("...")` registrations.
 */

export const API_CONTRACT = {
  // User CRUD
  getUsers: 'getUsers',
  getUserStats: 'getUserStats',
  createUser: 'createUser',
  updateUser: 'updateUser',
  deleteUser: 'deleteUser',
  forceDeleteUser: 'forceDeleteUser',

  // Product CRUD
  getProducts: 'getProducts',
  createProduct: 'createProduct',
  updateProduct: 'updateProduct',
  deleteProduct: 'deleteProduct',
  getCategoryStats: 'getCategoryStats',

  // Order CRUD
  getOrders: 'getOrders',
  createOrder: 'createOrder',
  updateOrder: 'updateOrder',
  deleteOrder: 'deleteOrder',

  // Analytics
  getSalesTrend: 'getSalesTrend',
  getTopProducts: 'getTopProducts',
  getRevenueByPeriod: 'getRevenueByPeriod',

  // Database management
  getDatabaseInfo: 'getDatabaseInfo',
  createBackup: 'createBackup',
  listBackups: 'listBackups',
  restoreBackup: 'restoreBackup',
  verifyDatabaseIntegrity: 'verifyDatabaseIntegrity',
  cleanupOldBackups: 'cleanupOldBackups',

  // Error monitoring
  get_error_stats: 'get_error_stats',
  get_recent_errors: 'get_recent_errors',
  clear_error_history: 'clear_error_history',

  // Database monitoring
  get_db_pool_stats: 'get_db_pool_stats',

  // DevTools
  get_backend_stats: 'get_backend_stats',
  get_backend_logs: 'get_backend_logs',
  create_backend_error: 'create_backend_error',

  // System info
  get_system_info: 'get_system_info',

  // Event bus
  'event:publish': 'event:publish',
  'event:history': 'event:history',
  'event:stats': 'event:stats',
  'event:clear_history': 'event:clear_history',
  publishEvent: 'publishEvent',

  // Shared state
  setSharedState: 'setSharedState',
  getSharedState: 'getSharedState',

  // Message queue
  enqueueMessage: 'enqueueMessage',

  // Broadcast
  broadcast: 'broadcast',

  // Core / testing
  ping: 'ping',
  getData: 'getData',
  emitEvent: 'emitEvent',

  // UI
  open_folder: 'open_folder',
  organize_images: 'organize_images',
  increment_counter: 'increment_counter',
  reset_counter: 'reset_counter',
  window_state_change: 'window_state_change',

  // Logging
  log_message: 'log_message',
} as const;

/** All allowed backend function names — used by ApiService whitelist. */
export const ALLOWED_FUNCTIONS: string[] = Object.values(API_CONTRACT);

export type ApiFunctionName = typeof API_CONTRACT[keyof typeof API_CONTRACT];
