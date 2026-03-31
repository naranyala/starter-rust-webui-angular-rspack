/**
 * API Contract - Backend Function Names
 * 
 * Centralized definition of all backend function names.
 * Using constants prevents typos and provides a single source of truth.
 * 
 * @example
 * ```typescript
 * // Instead of:
 * await api.callOrThrow('getUsers');
 * 
 * // Use:
 * await api.callOrThrow(ApiContract.Users.GET_ALL);
 * ```
 */

export const ApiContract = {
  // User operations
  Users: {
    GET_ALL: 'getUsers',
    GET_BY_ID: 'getUserById',
    CREATE: 'createUser',
    UPDATE: 'updateUser',
    DELETE: 'deleteUser',
    GET_STATS: 'getUserStats',
  },

  // Product operations
  Products: {
    GET_ALL: 'getProducts',
    GET_BY_ID: 'getProductById',
    CREATE: 'createProduct',
    UPDATE: 'updateProduct',
    DELETE: 'deleteProduct',
    GET_CATEGORY_STATS: 'getCategoryStats',
  },

  // Order operations
  Orders: {
    GET_ALL: 'getOrders',
    GET_BY_ID: 'getOrderById',
    CREATE: 'createOrder',
    UPDATE: 'updateOrder',
    DELETE: 'deleteOrder',
  },

  // Analytics operations
  Analytics: {
    GET_SALES_TREND: 'getSalesTrend',
    GET_TOP_PRODUCTS: 'getTopProducts',
    GET_REVENUE_BY_PERIOD: 'getRevenueByPeriod',
  },

  // Database management operations
  Database: {
    GET_INFO: 'getDatabaseInfo',
    CREATE_BACKUP: 'createBackup',
    LIST_BACKUPS: 'listBackups',
    RESTORE_BACKUP: 'restoreBackup',
    VERIFY_INTEGRITY: 'verifyDatabaseIntegrity',
    CLEANUP_BACKUPS: 'cleanupOldBackups',
  },

  // System operations
  System: {
    GET_STATS: 'getDbStats',
    PUBLISH_EVENT: 'publishEvent',
    GET_EVENT_HISTORY: 'devtools.getLogs',
  },
} as const;

/**
 * Type-safe API function names
 */
export type ApiFunctionName = 
  | typeof ApiContract.Users[keyof typeof ApiContract.Users]
  | typeof ApiContract.Products[keyof typeof ApiContract.Products]
  | typeof ApiContract.Orders[keyof typeof ApiContract.Orders]
  | typeof ApiContract.Analytics[keyof typeof ApiContract.Analytics]
  | typeof ApiContract.Database[keyof typeof ApiContract.Database]
  | typeof ApiContract.System[keyof typeof ApiContract.System];
