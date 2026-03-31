# CRUD API Reference

Complete API reference for SQLite and DuckDB CRUD operations with Rust backend and Angular frontend.

---

## 📋 Table of Contents

1. [Backend WebUI Events](#backend-webui-events)
2. [Frontend Services](#frontend-services)
3. [Data Models](#data-models)
4. [Error Codes](#error-codes)
5. [Response Format](#response-format)

---

## Backend WebUI Events

### SQLite User Operations

| Event | Handler | Parameters | Response | Description |
|-------|---------|------------|----------|-------------|
| `getUsers` | `handle_get_users` | - | `User[]` | Get all users |
| `getUserById` | `handle_get_user_by_id` | `id: i64` | `User` | Get user by ID |
| `createUser` | `handle_create_user` | `name, email, role, status` | `i64` | Create new user |
| `updateUser` | `handle_update_user` | `id, name, email, role, status` | `usize` | Update user |
| `deleteUser` | `handle_delete_user` | `id: i64` | `usize` | Delete user |
| `searchUsers` | `handle_search_users` | `query: String` | `User[]` | Search users |

### SQLite Product Operations

| Event | Handler | Parameters | Response | Description |
|-------|---------|------------|----------|-------------|
| `getProducts` | `handle_get_products` | - | `Product[]` | Get all products |
| `getProductById` | `handle_get_product_by_id` | `id: i64` | `Product` | Get product by ID |
| `createProduct` | `handle_create_product` | `name, description, price, category, stock` | `i64` | Create product |
| `updateProduct` | `handle_update_product` | `id, name, description, price, category, stock` | `usize` | Update product |
| `deleteProduct` | `handle_delete_product` | `id: i64` | `usize` | Delete product |

### SQLite Order Operations

| Event | Handler | Parameters | Response | Description |
|-------|---------|------------|----------|-------------|
| `getOrders` | `handle_get_orders` | - | `Order[]` | Get all orders |
| `getOrderById` | `handle_get_order_by_id` | `id: i64` | `Order` | Get order by ID |
| `createOrder` | `handle_create_order` | `user_id, product_id, quantity, total_price, status` | `i64` | Create order |
| `updateOrder` | `handle_update_order` | `id, quantity, total_price, status` | `usize` | Update order |
| `deleteOrder` | `handle_delete_order` | `id: i64` | `usize` | Delete order |

### DuckDB Analytics Operations

| Event | Handler | Parameters | Response | Description |
|-------|---------|------------|----------|-------------|
| `getCategoryStats` | `handle_get_category_stats` | - | `CategoryStats[]` | Get category statistics |
| `getSalesTrend` | `handle_get_sales_trend` | `days: i32` | `SalesTrend[]` | Get sales trend |
| `getTopProducts` | `handle_get_top_products` | `limit: i32` | `ProductStats[]` | Get top products |
| `getRevenueByPeriod` | `handle_get_revenue_by_period` | `period: String` | `RevenueData[]` | Get revenue by period |
| `batchInsertProducts` | `handle_batch_insert` | `Product[]` | `usize` | Batch insert products |

---

## Frontend Services

### ApiService (Core)

**File:** `frontend/src/core/api.service.ts`

```typescript
interface WebUIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  // Generic call with error handling
  async call<T>(functionName: string, args: unknown[] = []): Promise<WebUIResponse<T>>
  
  // Call and throw on error
  async callOrThrow<T>(functionName: string, args: unknown[] = []): Promise<T>
}
```

### SqliteService

**File:** `frontend/src/views/sqlite/sqlite.service.ts`

```typescript
class SqliteService {
  // User operations
  async getUsers(): Promise<User[]>
  async createUser(user: CreateUserDto): Promise<number>
  async updateUser(id: number, updates: UpdateUserDto): Promise<void>
  async deleteUser(id: number): Promise<void>
  
  // Product operations
  async getProducts(): Promise<Product[]>
  async createProduct(product: CreateProductDto): Promise<number>
  async updateProduct(id: number, updates: UpdateProductDto): Promise<void>
  async deleteProduct(id: number): Promise<void>
  
  // Order operations
  async getOrders(): Promise<Order[]>
  async createOrder(order: CreateOrderDto): Promise<number>
  async updateOrder(id: number, updates: UpdateOrderDto): Promise<void>
  async deleteOrder(id: number): Promise<void>
}
```

### DuckDbService

**File:** `frontend/src/views/duckdb/duckdb.service.ts`

```typescript
class DuckDbService {
  // CRUD operations
  async getProducts(): Promise<Product[]>
  async createProduct(product: Partial<Product>): Promise<number>
  async updateProduct(id: number, updates: Partial<Product>): Promise<void>
  async deleteProduct(id: number): Promise<void>
  
  // Analytics operations
  async getCategoryStats(): Promise<CategoryStats[]>
  async getSalesTrend(days: number = 30): Promise<SalesTrend[]>
  async getTopProducts(limit: number = 10): Promise<ProductStats[]>
  async getRevenueByPeriod(period: 'daily' | 'monthly' | 'quarterly'): Promise<RevenueData[]>
}
```

---

## Data Models

### User

```typescript
interface User {
  id: number;           // Auto-increment primary key
  name: string;         // Required, min 1 char
  email: string;        // Required, unique, valid email format
  role: string;         // Default: 'User', Options: 'User', 'Admin', 'Manager'
  status: string;       // Default: 'Active', Options: 'Active', 'Inactive', 'Suspended'
  created_at: string;   // ISO 8601 format
}
```

### Product

```typescript
interface Product {
  id: number;           // Auto-increment primary key
  name: string;         // Required, min 1 char
  description: string;  // Optional
  price: number;        // Required, must be > 0
  category: string;     // Required
  stock: number;        // Default: 0, must be >= 0
}
```

### Order

```typescript
interface Order {
  id: number;           // Auto-increment primary key
  user_id: number;      // Foreign key to users
  product_id: number;   // Foreign key to products
  quantity: number;     // Default: 1, must be > 0
  total_price: number;  // Required, must be > 0
  status: string;       // Default: 'Pending'
  created_at: string;   // ISO 8601 format
}
```

### CategoryStats (DuckDB)

```typescript
interface CategoryStats {
  category: string;     // Category name
  product_count: number;    // Number of products in category
  avg_price: number;    // Average price
  total_stock: number;  // Total stock across all products
  min_price: number;    // Minimum price in category
  max_price: number;    // Maximum price in category
}
```

### SalesTrend (DuckDB)

```typescript
interface SalesTrend {
  date: string;         // Date (YYYY-MM-DD)
  order_count: number;  // Number of orders
  total_quantity: number;   // Total items sold
  total_revenue: number;    // Total revenue
  avg_order_value: number;  // Average order value
}
```

### ProductStats (DuckDB)

```typescript
interface ProductStats {
  id: number;           // Product ID
  name: string;         // Product name
  category: string;     // Category
  order_count: number;  // Number of orders
  total_sold: number;   // Total quantity sold
  total_revenue: number;    // Total revenue generated
}
```

### RevenueData (DuckDB)

```typescript
interface RevenueData {
  period: string;       // Period identifier
  revenue: number;      // Total revenue
  transactions: number; // Number of transactions
}
```

---

## DTOs (Data Transfer Objects)

### CreateUserDto

```typescript
interface CreateUserDto {
  name: string;         // Required
  email: string;        // Required
  role?: string;        // Optional, default: 'User'
  status?: string;      // Optional, default: 'Active'
}
```

### UpdateUserDto

```typescript
interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}
```

### CreateProductDto

```typescript
interface CreateProductDto {
  name: string;         // Required
  description?: string;
  price: number;        // Required, > 0
  category: string;     // Required
  stock?: number;       // Optional, default: 0
}
```

### UpdateProductDto

```typescript
interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;       // Must be > 0
  category?: string;
  stock?: number;       // Must be >= 0
}
```

---

## Error Codes

### Database Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `DB_CONNECTION_FAILED` | 500 | Failed to connect to database |
| `DB_QUERY_FAILED` | 500 | SQL query execution failed |
| `DB_ALREADY_EXISTS` | 409 | Record already exists (unique constraint) |
| `DB_NOT_FOUND` | 404 | Record not found |
| `DB_FOREIGN_KEY_VIOLATION` | 400 | Foreign key constraint violated |

### Validation Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_REQUIRED_FIELD` | 400 | Required field is missing |
| `INVALID_VALUE` | 400 | Field value is invalid |
| `INVALID_EMAIL_FORMAT` | 400 | Email format is invalid |
| `NEGATIVE_VALUE` | 400 | Value cannot be negative |

### System Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `TIMEOUT` | 408 | Request timeout |

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin",
    "status": "Active",
    "created_at": "2026-03-31T10:00:00Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "User with this email already exists",
  "code": "DB_ALREADY_EXISTS",
  "details": {
    "field": "email",
    "value": "john@example.com"
  }
}
```

### Array Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Product 1",
      "price": 99.99,
      "category": "Electronics",
      "stock": 50
    },
    {
      "id": 2,
      "name": "Product 2",
      "price": 149.99,
      "category": "Electronics",
      "stock": 30
    }
  ]
}
```

---

## Usage Examples

### Frontend: Create User

```typescript
async createUser(): Promise<void> {
  try {
    const userId = await this.api.callOrThrow<number>('createUser', [
      'John Doe',
      'john@example.com',
      'Admin',
      'Active'
    ]);
    this.logger.info('User created with ID:', userId);
  } catch (error) {
    this.logger.error('Failed to create user', error);
  }
}
```

### Frontend: Get Analytics

```typescript
async loadAnalytics(): Promise<void> {
  const [stats, trend, topProducts] = await Promise.all([
    this.duckDb.getCategoryStats(),
    this.duckDb.getSalesTrend(30),
    this.duckDb.getTopProducts(10)
  ]);
  
  this.categoryStats.set(stats);
  this.salesTrend.set(trend);
  this.topProducts.set(topProducts);
}
```

### Backend: Handle Event

```rust
pub fn handle_create_user(event: &Event) {
    let window = event.get_window();
    let params = parse_event_params(event);
    
    let Some(db) = get_db() else {
        send_error_response(window, "user_create_response", "Database not available");
        return;
    };
    
    let name = params.get(0).map(|s| s.as_str()).unwrap_or("");
    let email = params.get(1).map(|s| s.as_str()).unwrap_or("");
    let role = params.get(2).map(|s| s.as_str()).unwrap_or("User");
    let status = params.get(3).map(|s| s.as_str()).unwrap_or("Active");
    
    let result = db.create(name, email, role, status);
    handle_db_result(window, "user_create_response", result);
}
```

---

## Rate Limiting

| Operation | Limit | Window |
|-----------|-------|--------|
| Read (GET) | 1000 | per minute |
| Write (CREATE/UPDATE/DELETE) | 100 | per minute |
| Analytics | 50 | per minute |
| Batch Operations | 10 | per minute |

---

## Pagination

For large datasets, use pagination:

```typescript
interface PaginationParams {
  page: number;       // Page number (1-based)
  pageSize: number;   // Items per page (default: 20, max: 100)
  sortBy?: string;    // Sort field
  sortOrder?: 'asc' | 'desc';  // Sort order
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### Example: Paginated Users

```typescript
async getUsersPaginated(params: PaginationParams): Promise<PaginatedResponse<User>> {
  return this.api.callOrThrow('getUsersPaginated', [
    params.page,
    params.pageSize,
    params.sortBy ?? 'id',
    params.sortOrder ?? 'asc'
  ]);
}
```

---

## Related Documentation

- **[SQLite CRUD Guide](02-sqlite-crud-production.md)** - SQLite implementation details
- **[DuckDB CRUD Guide](03-duckdb-crud-production.md)** - DuckDB implementation details
- **[Security Guide](05-security-best-practices.md)** - Security patterns
- **[Deployment Guide](06-deployment-production.md)** - Production deployment

---

**Last Updated:** 2026-03-31  
**Status:** ✅ Production Ready
