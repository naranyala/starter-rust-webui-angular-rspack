# Production-Ready SQLite CRUD Integration

Complete guide for implementing SQLite CRUD operations with Rust backend and Angular frontend in production environments.

---

## 🎯 Overview

SQLite is a **transaction-focused (OLTP)** embedded database perfect for:
- User management systems
- Configuration storage
- Local-first applications
- Desktop applications
- Mobile applications

---

## 📦 Dependencies

### Cargo.toml

```toml
[dependencies]
# Core SQLite
rusqlite = { version = "0.32", features = ["bundled"] }
r2d2_sqlite = "0.24"
r2d2 = "0.8"

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

---

## 🏗️ Architecture

### Layer Structure

```
Domain Layer (traits.rs)
    ↓ implements
Infrastructure Layer (connection.rs, users.rs, products.rs, orders.rs)
    ↓ exposes to
Presentation Layer (webui/handlers/db_handlers.rs)
    ↓ communicates via
WebUI Bridge (JSON-RPC)
    ↓ calls from
Frontend (api.service.ts → components)
```

---

## 🗄️ Database Schema

### Production Schema with Indexes

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'User',
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
);

-- Orders table with foreign keys
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
```

---

## 🔧 Backend Implementation

### 1. Connection Pool Setup

**File:** `src/core/infrastructure/database/connection.rs`

```rust
use r2d2::{Pool, PooledConnection};
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::Connection;

pub struct Database {
    pool: Pool<SqliteConnectionManager>,
}

impl Database {
    pub fn new(db_path: &str) -> AppResult<Self> {
        let manager = SqliteConnectionManager::file(db_path);
        
        let pool = Pool::builder()
            .max_size(10)           // Max connections
            .min_idle(Some(2))      // Minimum idle connections
            .connection_timeout(Duration::from_secs(30))
            .build(manager)?;
        
        Ok(Self { pool })
    }
    
    pub fn get_conn(&self) -> AppResult<PooledConnection<SqliteConnectionManager>> {
        self.pool.get().map_err(|e| {
            AppError::DatabaseError(format!("Failed to get connection: {}", e))
        })
    }
}
```

### 2. Repository Pattern

**File:** `src/core/domain/traits.rs`

```rust
pub trait UserRepository {
    fn get_all(&self) -> AppResult<Vec<User>>;
    fn get_by_id(&self, id: i64) -> AppResult<Option<User>>;
    fn create(&self, name: &str, email: &str, role: &str, status: &str) -> AppResult<i64>;
    fn update(&self, id: i64, name: Option<&str>, email: Option<&str>, 
              role: Option<&str>, status: Option<&str>) -> AppResult<usize>;
    fn delete(&self, id: i64) -> AppResult<usize>;
}

pub trait ProductRepository {
    fn get_all(&self) -> AppResult<Vec<Product>>;
    fn get_by_id(&self, id: i64) -> AppResult<Option<Product>>;
    fn create(&self, name: &str, description: &str, price: f64, 
              category: &str, stock: i64) -> AppResult<i64>;
    fn update(&self, id: i64, name: Option<&str>, description: Option<&str>,
              price: Option<f64>, category: Option<&str>, stock: Option<i64>) -> AppResult<usize>;
    fn delete(&self, id: i64) -> AppResult<usize>;
}
```

### 3. CRUD Operations Implementation

**File:** `src/core/infrastructure/database/users.rs`

```rust
impl UserRepository for Database {
    fn create(&self, name: &str, email: &str, role: &str, status: &str) -> AppResult<i64> {
        // Validation
        if name.is_empty() {
            return Err(AppError::Validation("Name is required".into()));
        }
        if email.is_empty() {
            return Err(AppError::Validation("Email is required".into()));
        }
        
        let conn = self.get_conn()?;
        let created_at = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        
        conn.execute(
            "INSERT INTO users (name, email, role, status, created_at) 
             VALUES (?, ?, ?, ?, ?)",
            params![name, email, role, status, created_at],
        )?;
        
        Ok(conn.last_insert_rowid())
    }
    
    fn get_all(&self) -> AppResult<Vec<User>> {
        let conn = self.get_conn()?;
        let mut stmt = conn.prepare(
            "SELECT id, name, email, role, status, created_at FROM users ORDER BY id"
        )?;
        
        let users = stmt.query_map([], |row| {
            Ok(User {
                id: row.get(0)?,
                name: row.get(1)?,
                email: row.get(2)?,
                role: row.get(3)?,
                status: row.get(4)?,
                created_at: row.get(5)?,
            })
        })?;
        
        users.collect()
    }
    
    fn update(&self, id: i64, name: Option<&str>, email: Option<&str>,
              role: Option<&str>, status: Option<&str>) -> AppResult<usize> {
        let conn = self.get_conn()?;
        
        let mut updates = Vec::new();
        let mut params: Vec<&dyn rusqlite::ToSql> = Vec::new();
        
        if let Some(n) = name {
            updates.push("name = ?");
            params.push(n);
        }
        if let Some(e) = email {
            updates.push("email = ?");
            params.push(e);
        }
        if let Some(r) = role {
            updates.push("role = ?");
            params.push(r);
        }
        if let Some(s) = status {
            updates.push("status = ?");
            params.push(s);
        }
        
        if updates.is_empty() {
            return Ok(0);
        }
        
        params.push(&id);
        let query = format!("UPDATE users SET {} WHERE id = ?", updates.join(", "));
        
        let rows = conn.execute(&query, params.as_slice())?;
        Ok(rows)
    }
    
    fn delete(&self, id: i64) -> AppResult<usize> {
        let conn = self.get_conn()?;
        let rows = conn.execute("DELETE FROM users WHERE id = ?", [id])?;
        Ok(rows)
    }
}
```

### 4. WebUI Event Handlers

**File:** `src/core/presentation/webui/handlers/db_handlers.rs`

```rust
use webui::Event;
use crate::core::infrastructure::di::get_db;
use crate::core::error::{send_error_response, handle_db_result};

// CREATE User
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

// READ Users
pub fn handle_get_users(event: &Event) {
    let window = event.get_window();
    
    let Some(db) = get_db() else {
        send_error_response(window, "users_response", "Database not available");
        return;
    };
    
    let result = db.get_all();
    handle_db_result(window, "users_response", result);
}

// UPDATE User
pub fn handle_update_user(event: &Event) {
    let window = event.get_window();
    let params = parse_event_params(event);
    
    let Some(db) = get_db() else {
        send_error_response(window, "user_update_response", "Database not available");
        return;
    };
    
    let id = params.get(0).and_then(|s| s.parse::<i64>().ok()).unwrap_or(0);
    let name = params.get(1).map(|s| s.as_str());
    let email = params.get(2).map(|s| s.as_str());
    let role = params.get(3).map(|s| s.as_str());
    let status = params.get(4).map(|s| s.as_str());
    
    let result = db.update(id, name, email, role, status);
    handle_db_result(window, "user_update_response", result);
}

// DELETE User
pub fn handle_delete_user(event: &Event) {
    let window = event.get_window();
    let params = parse_event_params(event);
    
    let Some(db) = get_db() else {
        send_error_response(window, "user_delete_response", "Database not available");
        return;
    };
    
    let id = params.get(0).and_then(|s| s.parse::<i64>().ok()).unwrap_or(0);
    
    let result = db.delete(id);
    handle_db_result(window, "user_delete_response", result);
}
```

---

## 💻 Frontend Implementation

### 1. API Service

**File:** `frontend/src/core/api.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { LoggerService } from './logger.service';

export interface WebUIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly logger = inject(LoggerService);

  async call<T>(functionName: string, args: unknown[] = []): Promise<WebUIResponse<T>> {
    return new Promise((resolve, reject) => {
      const callbackId = `cb_${Date.now()}_${Math.random()}`;
      
      // @ts-ignore - WebUI bridge
      window.api_call(callbackId, functionName, JSON.stringify(args), (response: string) => {
        try {
          const result: WebUIResponse<T> = JSON.parse(response);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e}`));
        }
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error(`Request timeout: ${functionName}`));
      }, 30000);
    });
  }

  async callOrThrow<T>(functionName: string, args: unknown[] = []): Promise<T> {
    const response = await this.call<T>(functionName, args);
    if (!response.success) {
      throw new Error(response.error ?? 'Unknown error');
    }
    return response.data as T;
  }
}
```

### 2. Service Layer

**File:** `frontend/src/views/sqlite/sqlite.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { LoggerService } from '../../core/logger.service';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role?: string;
  status?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class SqliteService {
  private readonly api = inject(ApiService);
  private readonly logger = inject(LoggerService);

  async getUsers(): Promise<User[]> {
    return this.api.callOrThrow<User[]>('getUsers');
  }

  async createUser(user: CreateUserDto): Promise<number> {
    return this.api.callOrThrow<number>('createUser', [
      user.name,
      user.email,
      user.role ?? 'User',
      user.status ?? 'Active'
    ]);
  }

  async updateUser(id: number, updates: UpdateUserDto): Promise<void> {
    await this.api.callOrThrow('updateUser', [
      id,
      updates.name ?? null,
      updates.email ?? null,
      updates.role ?? null,
      updates.status ?? null
    ]);
  }

  async deleteUser(id: number): Promise<void> {
    await this.api.callOrThrow('deleteUser', [id]);
  }
}
```

### 3. Component Implementation

**File:** `frontend/src/views/sqlite/sqlite.component.ts`

```typescript
import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SqliteService, User, CreateUserDto, UpdateUserDto } from './sqlite.service';
import { LoggerService } from '../../core/logger.service';

@Component({
  selector: 'app-sqlite-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sqlite-crud-container">
      <!-- Header -->
      <div class="header">
        <h2>🗄️ SQLite User Management</h2>
        <button class="btn-primary" (click)="showCreateForm()">
          ➕ Add User
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-bar">
        <div class="stat">
          <span class="stat-value">{{ users().length }}</span>
          <span class="stat-label">Total Users</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ activeCount() }}</span>
          <span class="stat-label">Active</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ adminCount() }}</span>
          <span class="stat-label">Admins</span>
        </div>
      </div>

      <!-- Create Form -->
      @if (showForm()) {
        <div class="form-overlay" (click)="hideForm()">
          <div class="form-card" (click)="$event.stopPropagation()">
            <h3>{{ editingUser() ? 'Edit User' : 'Create User' }}</h3>
            <form (ngSubmit)="saveUser()">
              <div class="form-group">
                <label>Name *</label>
                <input type="text" [(ngModel)]="formData.name" name="name" required />
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" [(ngModel)]="formData.email" name="email" required />
              </div>
              <div class="form-group">
                <label>Role</label>
                <select [(ngModel)]="formData.role" name="role">
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select [(ngModel)]="formData.status" name="status">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-secondary" (click)="hideForm()">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="saving()">
                  {{ saving() ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- User Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users(); track user.id) {
              <tr>
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge badge-role">{{ user.role }}</span>
                </td>
                <td>
                  <span class="badge" 
                        [class.badge-active]="user.status === 'Active'"
                        [class.badge-inactive]="user.status === 'Inactive'">
                    {{ user.status }}
                  </span>
                </td>
                <td>{{ user.created_at }}</td>
                <td class="actions">
                  <button class="btn-icon" (click)="editUser(user)" title="Edit">
                    ✏️
                  </button>
                  <button class="btn-icon btn-danger" (click)="deleteUser(user)" title="Delete">
                    🗑️
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .sqlite-crud-container {
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100%;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    h2 {
      color: #fff;
      font-size: 24px;
      margin: 0;
    }
    
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .stat {
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border-radius: 8px;
      text-align: center;
    }
    
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
      display: block;
    }
    
    .stat-label {
      font-size: 13px;
      color: #94a3b8;
    }
    
    .form-overlay {
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
    }
    
    .form-card {
      background: #1e293b;
      padding: 32px;
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    label {
      display: block;
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    input, select {
      width: 100%;
      padding: 10px 12px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      color: #fff;
      font-size: 14px;
    }
    
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }
    
    .table-container {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 8px;
      overflow: hidden;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }
    
    th {
      background: rgba(15, 23, 42, 0.8);
      color: #94a3b8;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
    }
    
    td {
      color: #e2e8f0;
      font-size: 14px;
    }
    
    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .badge-role {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }
    
    .badge-active {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
    
    .badge-inactive {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
    }
    
    .btn-primary {
      padding: 10px 20px;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      border: none;
      border-radius: 6px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
    }
    
    .btn-secondary {
      padding: 10px 20px;
      background: rgba(148, 163, 184, 0.2);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      color: #94a3b8;
      cursor: pointer;
    }
    
    .btn-icon {
      padding: 6px 10px;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 16px;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    
    .btn-icon:hover {
      opacity: 1;
    }
    
    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.2);
      border-radius: 4px;
    }
  `]
})
export class SqliteCrudComponent implements OnInit {
  private readonly service = inject(SqliteService);
  private readonly logger = inject(LoggerService);

  users = signal<User[]>([]);
  showForm = signal(false);
  editingUser = signal<User | null>(null);
  saving = signal(false);

  formData: CreateUserDto = {
    name: '',
    email: '',
    role: 'User',
    status: 'Active'
  };

  get activeCount(): number {
    return this.users().filter(u => u.status === 'Active').length;
  }

  get adminCount(): number {
    return this.users().filter(u => u.role === 'Admin').length;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    try {
      const users = await this.service.getUsers();
      this.users.set(users);
    } catch (error) {
      this.logger.error('Failed to load users', error);
    }
  }

  showCreateForm(): void {
    this.editingUser.set(null);
    this.formData = { name: '', email: '', role: 'User', status: 'Active' };
    this.showForm.set(true);
  }

  editUser(user: User): void {
    this.editingUser.set(user);
    this.formData = {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    };
    this.showForm.set(true);
  }

  hideForm(): void {
    this.showForm.set(false);
    this.editingUser.set(null);
  }

  async saveUser(): Promise<void> {
    if (!this.formData.name || !this.formData.email) {
      this.logger.error('Name and email are required');
      return;
    }

    this.saving.set(true);
    try {
      if (this.editingUser()) {
        await this.service.updateUser(this.editingUser()!.id, this.formData);
      } else {
        await this.service.createUser(this.formData);
      }
      await this.loadUsers();
      this.hideForm();
    } catch (error) {
      this.logger.error('Failed to save user', error);
    } finally {
      this.saving.set(false);
    }
  }

  async deleteUser(user: User): Promise<void> {
    if (!confirm(`Delete ${user.name}?`)) return;

    try {
      await this.service.deleteUser(user.id);
      await this.loadUsers();
    } catch (error) {
      this.logger.error('Failed to delete user', error);
    }
  }
}
```

---

## ✅ Testing

### Backend Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    fn create_test_db() -> Database {
        let db = Database::new(":memory:").unwrap();
        db.init().unwrap();
        db
    }
    
    #[test]
    fn test_create_user() {
        let db = create_test_db();
        let id = db.create("Test", "test@example.com", "User", "Active").unwrap();
        assert!(id > 0);
    }
    
    #[test]
    fn test_duplicate_email() {
        let db = create_test_db();
        db.create("User1", "dup@example.com", "User", "Active").unwrap();
        let result = db.create("User2", "dup@example.com", "User", "Active");
        assert!(result.is_err());
    }
    
    #[test]
    fn test_update_user() {
        let db = create_test_db();
        let id = db.create("Original", "update@example.com", "User", "Active").unwrap();
        db.update(id, Some("Updated"), None, None, None).unwrap();
        let user = db.get_by_id(id).unwrap().unwrap();
        assert_eq!(user.name, "Updated");
    }
    
    #[test]
    fn test_delete_user() {
        let db = create_test_db();
        let id = db.create("Delete", "delete@example.com", "User", "Active").unwrap();
        db.delete(id).unwrap();
        assert!(db.get_by_id(id).unwrap().is_none());
    }
}
```

### Frontend Tests

```typescript
describe('SqliteCrudComponent', () => {
  it('should load users on init', async () => {
    const fixture = TestBed.createComponent(SqliteCrudComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(component.users().length).toBeGreaterThan(0);
  });
  
  it('should create user with valid data', async () => {
    component.formData = { name: 'Test', email: 'test@example.com' };
    await component.saveUser();
    
    expect(component.users().some(u => u.email === 'test@example.com')).toBe(true);
  });
});
```

---

## 🚀 Performance Optimization

### 1. Connection Pooling

```rust
// Optimal pool configuration for production
let pool = Pool::builder()
    .max_size(20)        // Adjust based on load
    .min_idle(Some(5))   // Keep connections warm
    .connection_timeout(Duration::from_secs(10))
    .idle_timeout(Some(Duration::from_secs(300)))
    .build(manager)?;
```

### 2. Batch Operations

```rust
pub fn batch_insert_users(&self, users: &[(&str, &str, &str, &str)]) -> AppResult<usize> {
    let conn = self.get_conn()?;
    let transaction = conn.transaction()?;
    
    for (name, email, role, status) in users {
        transaction.execute(
            "INSERT INTO users (name, email, role, status) VALUES (?, ?, ?, ?)",
            params![name, email, role, status],
        )?;
    }
    
    transaction.commit()?;
    Ok(users.len())
}
```

### 3. Prepared Statements

```rust
// Cache prepared statements for frequently used queries
lazy_static! {
    static ref GET_USER_STMT: &'static str = 
        "SELECT id, name, email, role, status, created_at FROM users WHERE id = ?";
}
```

---

## 📊 Monitoring

### Pool Statistics

```rust
pub fn get_pool_stats(&self) -> PoolStats {
    let state = self.pool.state();
    PoolStats {
        connections: state.connections,
        idle_connections: state.idle_connections,
        utilization: (state.connections - state.idle_connections) as f64 
                     / state.connections as f64 * 100.0
    }
}
```

### Query Performance

```rust
use std::time::Instant;

pub fn get_all_users_timed(&self) -> AppResult<(Vec<User>, Duration)> {
    let start = Instant::now();
    let users = self.get_all_users()?;
    let duration = start.elapsed();
    Ok((users, duration))
}
```

---

## 🔒 Security Best Practices

1. **Parameterized Queries** - Always use `params![]` macro
2. **Input Validation** - Validate all inputs before database operations
3. **Error Messages** - Don't expose internal errors to frontend
4. **Connection Limits** - Configure pool size appropriately
5. **File Permissions** - Restrict database file access

---

## 📁 Related Documentation

- **[DuckDB CRUD Guide](03-duckdb-crud-production.md)** - Analytics-focused database
- **[API Reference](04-api-reference.md)** - Complete API documentation
- **[Security Guide](05-security-best-practices.md)** - Security patterns
- **[Deployment Guide](06-deployment-production.md)** - Production deployment

---

**Last Updated:** 2026-03-31  
**Status:** ✅ Production Ready
