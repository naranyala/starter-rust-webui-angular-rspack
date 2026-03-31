# Production-Ready DuckDB CRUD Integration

Complete guide for implementing DuckDB CRUD operations with Rust backend and Angular frontend for analytics-focused applications.

---

## 🎯 Overview

DuckDB is an **analytics-focused (OLAP)** embedded database perfect for:
- Data analytics and reporting
- Business intelligence dashboards
- Large-scale data processing
- Columnar data analysis
- Complex aggregations

---

## 📦 Dependencies

### Cargo.toml

```toml
[dependencies]
# Core DuckDB
duckdb = { version = "1.0", features = ["bundled"] }

# Date/Time
chrono = "0.4"

# Error handling
thiserror = "1.0"

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Logging
log = "0.4"
```

### Install DuckDB

```bash
cargo add duckdb --features bundled
```

---

## 🏗️ Architecture

### Layer Structure

```
Domain Layer (traits.rs)
    ↓ implements
Infrastructure Layer (duckdb_connection.rs, duckdb_products.rs, duckdb_analytics.rs)
    ↓ exposes to
Presentation Layer (webui/handlers/duckdb_handlers.rs)
    ↓ communicates via
WebUI Bridge (JSON-RPC)
    ↓ calls from
Frontend (api.service.ts → duckdb components)
```

---

## 🗄️ Database Schema

### Production Schema for Analytics

```sql
-- Products table (optimized for analytics)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table with denormalized data for fast analytics
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    product_id INTEGER NOT NULL,
    product_name VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    region VARCHAR,
    customer_segment VARCHAR
);

-- Sales facts table for OLAP
CREATE TABLE IF NOT EXISTS sales_facts (
    id INTEGER PRIMARY KEY,
    date_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    profit DECIMAL(10,2) NOT NULL
);

-- Dimension tables
CREATE TABLE IF NOT EXISTS date_dim (
    date_id INTEGER PRIMARY KEY,
    full_date DATE NOT NULL,
    day INTEGER,
    month INTEGER,
    quarter INTEGER,
    year INTEGER,
    month_name VARCHAR,
    day_of_week INTEGER
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_category ON orders(category);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_facts(date_id);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales_facts(product_id);
```

---

## 🔧 Backend Implementation

### 1. Connection Setup

**File:** `src/core/infrastructure/database/duckdb_connection.rs`

```rust
use duckdb::{Connection, params};
use log::{info, error};
use std::sync::{Arc, Mutex};
use crate::core::error::{AppError, AppResult, ErrorCode, ErrorValue};

/// DuckDB wrapper with connection management
pub struct DuckDb {
    conn: Arc<Mutex<Connection>>,
}

impl DuckDb {
    pub fn new(db_path: &str) -> AppResult<Self> {
        info!("Initializing DuckDB connection: {}", db_path);
        
        let conn = Connection::open(db_path).map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbConnectionFailed, "Failed to open DuckDB")
                    .with_cause(e.to_string())
                    .with_context("db_path", db_path.to_string()),
            )
        })?;
        
        info!("DuckDB connection established");
        
        Ok(Self { 
            conn: Arc::new(Mutex::new(conn)) 
        })
    }
    
    pub fn get_conn(&self) -> AppResult<std::sync::MutexGuard<Connection>> {
        self.conn.lock().map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbConnectionFailed, "Failed to get DuckDB connection")
                    .with_cause(e.to_string()),
            )
        })
    }
    
    pub fn init(&self) -> AppResult<()> {
        let conn = self.get_conn()?;
        
        // Enable WAL mode for better concurrency
        conn.execute("PRAGMA journal_mode=WAL", [])?;
        
        // Create tables
        conn.execute_batch(include_str!("schemas/duckdb_schema.sql"))?;
        
        info!("DuckDB schema initialized");
        Ok(())
    }
}
```

### 2. Repository Pattern for DuckDB

**File:** `src/core/domain/traits.rs`

```rust
pub trait ProductRepository {
    fn get_all(&self) -> AppResult<Vec<Product>>;
    fn get_by_id(&self, id: i64) -> AppResult<Option<Product>>;
    fn create(&self, name: &str, description: &str, price: f64, 
              category: &str, stock: i64) -> AppResult<i64>;
    fn update(&self, id: i64, name: Option<&str>, description: Option<&str>,
              price: Option<f64>, category: Option<&str>, stock: Option<i64>) -> AppResult<usize>;
    fn delete(&self, id: i64) -> AppResult<usize>;
}

pub trait AnalyticsRepository {
    fn get_category_stats(&self) -> AppResult<Vec<CategoryStats>>;
    fn get_sales_trend(&self, days: i32) -> AppResult<Vec<SalesTrend>>;
    fn get_top_products(&self, limit: i32) -> AppResult<Vec<ProductStats>>;
    fn get_revenue_by_period(&self, period: &str) -> AppResult<Vec<RevenueData>>;
}
```

### 3. CRUD Operations Implementation

**File:** `src/core/infrastructure/database/duckdb_products.rs`

```rust
use duckdb::{params, types::Value};
use crate::core::domain::entities::{Product, CategoryStats, SalesTrend};
use crate::core::error::{AppError, AppResult, ErrorCode, ErrorValue};
use super::duckdb_connection::DuckDb;

impl ProductRepository for DuckDb {
    fn create(&self, name: &str, description: &str, price: f64, 
              category: &str, stock: i64) -> AppResult<i64> {
        // Validation
        if name.is_empty() {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::MissingRequiredField, "Name is required")
                    .with_field("name"),
            ));
        }
        
        if price <= 0.0 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::InvalidValue, "Price must be positive")
                    .with_field("price"),
            ));
        }
        
        let conn = self.get_conn()?;
        
        conn.execute(
            "INSERT INTO products (name, description, price, category, stock) 
             VALUES (?, ?, ?, ?, ?)",
            params![name, description, price, category, stock],
        )?;
        
        Ok(conn.last_insert_rowid())
    }
    
    fn get_all(&self) -> AppResult<Vec<Product>> {
        let conn = self.get_conn()?;
        
        let mut stmt = conn.prepare(
            "SELECT id, name, description, price, category, stock, created_at 
             FROM products ORDER BY id"
        )?;
        
        let products = stmt.query_map([], |row| {
            Ok(Product {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                price: row.get(3)?,
                category: row.get(4)?,
                stock: row.get(5)?,
            })
        })?;
        
        products.collect()
    }
    
    fn update(&self, id: i64, name: Option<&str>, description: Option<&str>,
              price: Option<f64>, category: Option<&str>, stock: Option<i64>) -> AppResult<usize> {
        let conn = self.get_conn()?;
        
        // Build dynamic update
        let mut updates = Vec::new();
        let mut param_values: Vec<Value> = Vec::new();
        
        if let Some(n) = name {
            updates.push("name = ?");
            param_values.push(Value::Text(n.to_string()));
        }
        if let Some(d) = description {
            updates.push("description = ?");
            param_values.push(Value::Text(d.to_string()));
        }
        if let Some(p) = price {
            updates.push("price = ?");
            param_values.push(Value::Double(p));
        }
        if let Some(c) = category {
            updates.push("category = ?");
            param_values.push(Value::Text(c.to_string()));
        }
        if let Some(s) = stock {
            updates.push("stock = ?");
            param_values.push(Value::Integer(s));
        }
        
        if updates.is_empty() {
            return Ok(0);
        }
        
        param_values.push(Value::Integer(id));
        let params: Vec<&dyn duckdb::ToSql> = param_values.iter().map(|v| v as _).collect();
        
        let query = format!("UPDATE products SET {} WHERE id = ?", updates.join(", "));
        let rows = conn.execute(&query, params.as_slice())?;
        
        Ok(rows)
    }
    
    fn delete(&self, id: i64) -> AppResult<usize> {
        let conn = self.get_conn()?;
        let rows = conn.execute("DELETE FROM products WHERE id = ?", [id])?;
        Ok(rows)
    }
}
```

### 4. Analytics Operations (DuckDB Strength)

**File:** `src/core/infrastructure/database/duckdb_analytics.rs`

```rust
use crate::core::domain::entities::{CategoryStats, SalesTrend, ProductStats, RevenueData};
use super::duckdb_connection::DuckDb;

impl AnalyticsRepository for DuckDb {
    fn get_category_stats(&self) -> AppResult<Vec<CategoryStats>> {
        let conn = self.get_conn()?;
        
        // DuckDB excels at analytical queries
        let mut stmt = conn.prepare("
            SELECT 
                category,
                COUNT(*) as product_count,
                AVG(price) as avg_price,
                SUM(stock) as total_stock,
                MIN(price) as min_price,
                MAX(price) as max_price
            FROM products
            GROUP BY category
            ORDER BY product_count DESC
        ")?;
        
        let stats = stmt.query_map([], |row| {
            Ok(CategoryStats {
                category: row.get(0)?,
                product_count: row.get(1)?,
                avg_price: row.get(2)?,
                total_stock: row.get(3)?,
                min_price: row.get(4)?,
                max_price: row.get(5)?,
            })
        })?;
        
        stats.collect()
    }
    
    fn get_sales_trend(&self, days: i32) -> AppResult<Vec<SalesTrend>> {
        let conn = self.get_conn()?;
        
        // Time-series analytics (DuckDB strength)
        let mut stmt = conn.prepare("
            SELECT 
                DATE(order_date) as sale_date,
                COUNT(*) as order_count,
                SUM(quantity) as total_quantity,
                SUM(total_amount) as total_revenue,
                AVG(total_amount) as avg_order_value
            FROM orders
            WHERE order_date >= DATE('now', ?)
            GROUP BY DATE(order_date)
            ORDER BY sale_date DESC
        ")?;
        
        let trend = stmt.query_map([format!("-{} days", days)], |row| {
            Ok(SalesTrend {
                date: row.get(0)?,
                order_count: row.get(1)?,
                total_quantity: row.get(2)?,
                total_revenue: row.get(3)?,
                avg_order_value: row.get(4)?,
            })
        })?;
        
        trend.collect()
    }
    
    fn get_top_products(&self, limit: i32) -> AppResult<Vec<ProductStats>> {
        let conn = self.get_conn()?;
        
        let mut stmt = conn.prepare("
            SELECT 
                p.id,
                p.name,
                p.category,
                COUNT(o.id) as order_count,
                SUM(o.quantity) as total_sold,
                SUM(o.total_amount) as total_revenue
            FROM products p
            LEFT JOIN orders o ON p.id = o.product_id
            GROUP BY p.id, p.name, p.category
            ORDER BY total_revenue DESC NULLS LAST
            LIMIT ?
        ")?;
        
        let products = stmt.query_map([limit], |row| {
            Ok(ProductStats {
                id: row.get(0)?,
                name: row.get(1)?,
                category: row.get(2)?,
                order_count: row.get(3)?,
                total_sold: row.get(4)?,
                total_revenue: row.get(5)?,
            })
        })?;
        
        products.collect()
    }
    
    fn get_revenue_by_period(&self, period: &str) -> AppResult<Vec<RevenueData>> {
        let conn = self.get_conn()?;
        
        let query = match period {
            "daily" => "
                SELECT 
                    DATE(order_date) as period,
                    SUM(total_amount) as revenue,
                    COUNT(*) as transactions
                FROM orders
                GROUP BY DATE(order_date)
                ORDER BY period DESC
            ",
            "monthly" => "
                SELECT 
                    STRFTIME(order_date, '%Y-%m') as period,
                    SUM(total_amount) as revenue,
                    COUNT(*) as transactions
                FROM orders
                GROUP BY STRFTIME(order_date, '%Y-%m')
                ORDER BY period DESC
            ",
            "quarterly" => "
                SELECT 
                    STRFTIME(order_date, '%Y-Q%q') as period,
                    SUM(total_amount) as revenue,
                    COUNT(*) as transactions
                FROM orders
                GROUP BY STRFTIME(order_date, '%Y-Q%q')
                ORDER BY period DESC
            ",
            _ => return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::InvalidValue, "Invalid period")
                    .with_field("period"),
            )),
        };
        
        let mut stmt = conn.prepare(query)?;
        let revenue = stmt.query_map([], |row| {
            Ok(RevenueData {
                period: row.get(0)?,
                revenue: row.get(1)?,
                transactions: row.get(2)?,
            })
        })?;
        
        revenue.collect()
    }
}
```

### 5. Batch Operations (High Performance)

**File:** `src/core/infrastructure/database/duckdb_batch.rs`

```rust
use crate::core::domain::entities::Product;

impl DuckDb {
    /// High-performance batch insert using DuckDB's columnar format
    pub fn batch_insert_products(&self, products: &[Product]) -> AppResult<usize> {
        let conn = self.get_conn()?;
        let transaction = conn.transaction()?;
        
        {
            let mut stmt = transaction.prepare("
                INSERT INTO products (name, description, price, category, stock) 
                VALUES (?, ?, ?, ?, ?)
            ")?;
            
            for product in products {
                stmt.execute(params![
                    product.name,
                    product.description,
                    product.price,
                    product.category,
                    product.stock
                ])?;
            }
        }
        
        transaction.commit()?;
        Ok(products.len())
    }
    
    /// Bulk data import from CSV (DuckDB specialty)
    pub fn import_from_csv(&self, table: &str, csv_path: &str) -> AppResult<usize> {
        let conn = self.get_conn()?;
        
        let query = format!(
            "INSERT INTO {} SELECT * FROM read_csv_auto('{}')",
            table, csv_path
        );
        
        let result = conn.execute(&query, [])?;
        Ok(result)
    }
    
    /// Bulk data import from Parquet (columnar format)
    pub fn import_from_parquet(&self, table: &str, parquet_path: &str) -> AppResult<usize> {
        let conn = self.get_conn()?;
        
        let query = format!(
            "INSERT INTO {} SELECT * FROM read_parquet('{}')",
            table, parquet_path
        );
        
        let result = conn.execute(&query, [])?;
        Ok(result)
    }
}
```

### 6. WebUI Event Handlers

**File:** `src/core/presentation/webui/handlers/duckdb_handlers.rs`

```rust
use webui::Event;
use crate::core::infrastructure::di::get_duckdb;
use crate::core::error::{send_error_response, handle_db_result};

// CREATE Product
pub fn handle_create_product(event: &Event) {
    let window = event.get_window();
    let params = parse_event_params(event);
    
    let Some(db) = get_duckdb() else {
        send_error_response(window, "product_create_response", "Database not available");
        return;
    };
    
    let name = params.get(0).map(|s| s.as_str()).unwrap_or("");
    let description = params.get(1).map(|s| s.as_str()).unwrap_or("");
    let price = params.get(2).and_then(|s| s.parse::<f64>().ok()).unwrap_or(0.0);
    let category = params.get(3).map(|s| s.as_str()).unwrap_or("");
    let stock = params.get(4).and_then(|s| s.parse::<i64>().ok()).unwrap_or(0);
    
    let result = db.create(name, description, price, category, stock);
    handle_db_result(window, "product_create_response", result);
}

// READ Products
pub fn handle_get_products(event: &Event) {
    let window = event.get_window();
    
    let Some(db) = get_duckdb() else {
        send_error_response(window, "products_response", "Database not available");
        return;
    };
    
    let result = db.get_all();
    handle_db_result(window, "products_response", result);
}

// ANALYTICS: Category Stats
pub fn handle_get_category_stats(event: &Event) {
    let window = event.get_window();
    
    let Some(db) = get_duckdb() else {
        send_error_response(window, "category_stats_response", "Database not available");
        return;
    };
    
    let result = db.get_category_stats();
    handle_db_result(window, "category_stats_response", result);
}

// ANALYTICS: Sales Trend
pub fn handle_get_sales_trend(event: &Event) {
    let window = event.get_window();
    let params = parse_event_params(event);
    
    let Some(db) = get_duckdb() else {
        send_error_response(window, "sales_trend_response", "Database not available");
        return;
    };
    
    let days = params.get(0).and_then(|s| s.parse::<i32>().ok()).unwrap_or(30);
    
    let result = db.get_sales_trend(days);
    handle_db_result(window, "sales_trend_response", result);
}

// ANALYTICS: Top Products
pub fn handle_get_top_products(event: &Event) {
    let window = event.get_window();
    let params = parse_event_params(event);
    
    let Some(db) = get_duckdb() else {
        send_error_response(window, "top_products_response", "Database not available");
        return;
    };
    
    let limit = params.get(0).and_then(|s| s.parse::<i32>().ok()).unwrap_or(10);
    
    let result = db.get_top_products(limit);
    handle_db_result(window, "top_products_response", result);
}
```

---

## 💻 Frontend Implementation

### 1. Service Layer

**File:** `frontend/src/views/duckdb/duckdb.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { LoggerService } from '../../core/logger.service';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

export interface CategoryStats {
  category: string;
  product_count: number;
  avg_price: number;
  total_stock: number;
  min_price: number;
  max_price: number;
}

export interface SalesTrend {
  date: string;
  order_count: number;
  total_quantity: number;
  total_revenue: number;
  avg_order_value: number;
}

export interface ProductStats {
  id: number;
  name: string;
  category: string;
  order_count: number;
  total_sold: number;
  total_revenue: number;
}

@Injectable({ providedIn: 'root' })
export class DuckDbService {
  private readonly api = inject(ApiService);
  private readonly logger = inject(LoggerService);

  // CRUD Operations
  async getProducts(): Promise<Product[]> {
    return this.api.callOrThrow<Product[]>('getProducts');
  }

  async createProduct(product: Partial<Product>): Promise<number> {
    return this.api.callOrThrow<number>('createProduct', [
      product.name,
      product.description ?? '',
      product.price ?? 0,
      product.category ?? '',
      product.stock ?? 0
    ]);
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<void> {
    await this.api.callOrThrow('updateProduct', [
      id,
      updates.name ?? null,
      updates.description ?? null,
      updates.price ?? null,
      updates.category ?? null,
      updates.stock ?? null
    ]);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.api.callOrThrow('deleteProduct', [id]);
  }

  // Analytics Operations
  async getCategoryStats(): Promise<CategoryStats[]> {
    return this.api.callOrThrow<CategoryStats[]>('getCategoryStats');
  }

  async getSalesTrend(days: number = 30): Promise<SalesTrend[]> {
    return this.api.callOrThrow<SalesTrend[]>('getSalesTrend', [days]);
  }

  async getTopProducts(limit: number = 10): Promise<ProductStats[]> {
    return this.api.callOrThrow<ProductStats[]>('getTopProducts', [limit]);
  }

  async getRevenueByPeriod(period: 'daily' | 'monthly' | 'quarterly'): Promise<any[]> {
    return this.api.callOrThrow<any[]>('getRevenueByPeriod', [period]);
  }
}
```

### 2. Analytics Component

**File:** `frontend/src/views/duckdb/duckdb-analytics.component.ts`

```typescript
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DuckDbService, CategoryStats, ProductStats } from './duckdb.service';
import { LoggerService } from '../../core/logger.service';

@Component({
  selector: 'app-duckdb-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-container">
      <h2>🦆 DuckDB Analytics Dashboard</h2>
      
      <!-- Analytics Cards -->
      <div class="analytics-cards">
        <div class="card">
          <div class="card-icon">📦</div>
          <div class="card-content">
            <div class="card-value">{{ totalProducts() }}</div>
            <div class="card-label">Total Products</div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-icon">🏷️</div>
          <div class="card-content">
            <div class="card-value">{{ categories().length }}</div>
            <div class="card-label">Categories</div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <div class="card-value">\${{ avgPrice() }}</div>
            <div class="card-label">Avg Price</div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <div class="card-value">{{ totalStock() }}</div>
            <div class="card-label">Total Stock</div>
          </div>
        </div>
      </div>
      
      <!-- Category Stats Table -->
      <div class="stats-section">
        <h3>Category Statistics</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Products</th>
              <th>Avg Price</th>
              <th>Total Stock</th>
              <th>Price Range</th>
            </tr>
          </thead>
          <tbody>
            @for (stat of categoryStats(); track stat.category) {
              <tr>
                <td>
                  <span class="category-badge">{{ stat.category }}</span>
                </td>
                <td>{{ stat.product_count }}</td>
                <td>\${{ stat.avg_price | number:'1.2-2' }}</td>
                <td>{{ stat.total_stock }}</td>
                <td>\${{ stat.min_price }} - \${{ stat.max_price }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      
      <!-- Top Products -->
      <div class="stats-section">
        <h3>Top Products by Revenue</h3>
        <div class="product-list">
          @for (product of topProducts(); track product.id; let i = $index) {
            <div class="product-item">
              <div class="rank">#{{ i + 1 }}</div>
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-category">{{ product.category }}</div>
              </div>
              <div class="product-metrics">
                <div class="metric">
                  <span class="metric-label">Sold</span>
                  <span class="metric-value">{{ product.total_sold }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Revenue</span>
                  <span class="metric-value">\${{ product.total_revenue | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container {
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100%;
    }
    
    h2 {
      color: #fff;
      font-size: 24px;
      margin-bottom: 24px;
    }
    
    h3 {
      color: #e2e8f0;
      font-size: 18px;
      margin-bottom: 16px;
    }
    
    .analytics-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }
    
    .card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
    }
    
    .card-icon {
      font-size: 40px;
    }
    
    .card-value {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
    }
    
    .card-label {
      font-size: 13px;
      color: #94a3b8;
    }
    
    .stats-section {
      background: rgba(30, 41, 59, 0.5);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }
    
    th {
      color: #94a3b8;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
    }
    
    td {
      color: #e2e8f0;
    }
    
    .category-badge {
      padding: 4px 12px;
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .product-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .product-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 8px;
    }
    
    .rank {
      font-size: 20px;
      font-weight: 700;
      color: #06b6d4;
      width: 40px;
    }
    
    .product-info {
      flex: 1;
    }
    
    .product-name {
      color: #fff;
      font-weight: 600;
    }
    
    .product-category {
      color: #94a3b8;
      font-size: 13px;
    }
    
    .product-metrics {
      display: flex;
      gap: 24px;
    }
    
    .metric {
      text-align: right;
    }
    
    .metric-label {
      display: block;
      color: #94a3b8;
      font-size: 12px;
    }
    
    .metric-value {
      display: block;
      color: #fff;
      font-weight: 600;
      font-size: 16px;
    }
  `]
})
export class DuckdbAnalyticsComponent implements OnInit {
  private readonly service = inject(DuckDbService);
  private readonly logger = inject(LoggerService);

  categoryStats = signal<CategoryStats[]>([]);
  topProducts = signal<ProductStats[]>([]);
  products = signal<any[]>([]);

  get totalProducts(): number {
    return this.products().length;
  }

  get categories(): string[] {
    return [...new Set(this.products().map(p => p.category))];
  }

  get avgPrice(): string {
    const products = this.products();
    if (products.length === 0) return '0.00';
    const avg = products.reduce((sum, p) => sum + p.price, 0) / products.length;
    return avg.toFixed(2);
  }

  get totalStock(): number {
    return this.products().reduce((sum, p) => sum + p.stock, 0);
  }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      const [products, categoryStats, topProducts] = await Promise.all([
        this.service.getProducts(),
        this.service.getCategoryStats(),
        this.service.getTopProducts(10)
      ]);
      
      this.products.set(products);
      this.categoryStats.set(categoryStats);
      this.topProducts.set(topProducts);
    } catch (error) {
      this.logger.error('Failed to load analytics data', error);
    }
  }
}
```

---

## ✅ Testing

### Backend Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    fn create_test_db() -> DuckDb {
        let db = DuckDb::new(":memory:").unwrap();
        db.init().unwrap();
        db
    }
    
    #[test]
    fn test_create_product() {
        let db = create_test_db();
        let id = db.create("Laptop", "High-end laptop", 999.99, "Electronics", 50).unwrap();
        assert!(id > 0);
    }
    
    #[test]
    fn test_category_stats() {
        let db = create_test_db();
        db.create("Product1", "", 100.0, "Cat1", 10).unwrap();
        db.create("Product2", "", 200.0, "Cat1", 20).unwrap();
        db.create("Product3", "", 150.0, "Cat2", 15).unwrap();
        
        let stats = db.get_category_stats().unwrap();
        assert_eq!(stats.len(), 2);
        assert_eq!(stats[0].category, "Cat1");
        assert_eq!(stats[0].product_count, 2);
    }
    
    #[test]
    fn test_batch_insert() {
        let db = create_test_db();
        let products = vec![
            Product { name: "P1".into(), /* ... */ },
            Product { name: "P2".into(), /* ... */ },
        ];
        let count = db.batch_insert_products(&products).unwrap();
        assert_eq!(count, 2);
    }
}
```

---

## 🚀 Performance Optimization

### 1. Columnar Storage Benefits

```rust
// DuckDB stores data columnarly - perfect for aggregations
// Query only the columns you need
let query = "SELECT category, SUM(price) FROM products GROUP BY category";
// Only reads 'category' and 'price' columns, not entire rows
```

### 2. Parallel Query Execution

```rust
// DuckDB automatically parallelizes queries
conn.execute("PRAGMA threads=4", [])?;  // Use 4 threads
```

### 3. Import Large Datasets

```rust
// Import from Parquet (columnar format)
db.import_from_parquet("sales", "/data/sales_2024.parquet")?;

// Import from CSV
db.import_from_csv("products", "/data/products.csv")?;
```

---

## 📊 DuckDB vs SQLite

| Feature | DuckDB | SQLite |
|---------|--------|--------|
| **Use Case** | OLAP/Analytics | OLTP/Transactions |
| **Storage** | Columnar | Row-based |
| **Best For** | Aggregations | CRUD operations |
| **Query Speed** | Fast analytics | Fast point queries |
| **Concurrency** | Single writer | Single writer |
| **Import** | Parquet, CSV | SQL INSERT |
| **Memory** | In-memory processing | Disk-based |

---

## 📁 Related Documentation

- **[SQLite CRUD Guide](02-sqlite-crud-production.md)** - Transaction-focused database
- **[API Reference](04-api-reference.md)** - Complete API documentation
- **[Security Guide](05-security-best-practices.md)** - Security patterns
- **[Deployment Guide](06-deployment-production.md)** - Production deployment

---

**Last Updated:** 2026-03-31  
**Status:** ✅ Production Ready
