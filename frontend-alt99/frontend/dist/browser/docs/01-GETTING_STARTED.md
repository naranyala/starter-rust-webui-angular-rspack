# Getting Started with Production CRUD Integrations

A focused guide for implementing production-ready DuckDB and SQLite CRUD operations in Rust with Angular frontend.

---

## 🎯 Purpose

This documentation provides **production-ready patterns** for integrating DuckDB and SQLite databases with a Rust backend and Angular frontend. Skip the theory—get straight to implementation.

---

## 📋 Prerequisites

### Required Tools

```bash
# Rust 1.93+
rustc --version

# Bun 1.3+ (or npm)
bun --version

# Platform dependencies
# Linux:
sudo apt install libwebkit2gtk-4.1-dev  # WebUI dependency
# macOS:
xcode-select --install
```

### Project Setup

```bash
# Clone and install
git clone <repository-url>
cd starter-rust-webui-angular-rspack
cd frontend && bun install && cd ..

# Build and run
./run.sh
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              Frontend (Angular 21)                       │
├─────────────────────────────────────────────────────────┤
│  Components → Services → API Calls                       │
└─────────────────────────────────────────────────────────┘
                        ↕ WebUI Bridge (JSON-RPC)
┌─────────────────────────────────────────────────────────┐
│              Backend (Rust)                              │
├─────────────────────────────────────────────────────────┤
│  Presentation (WebUI Handlers)                           │
│  Application (Use Cases)                                 │
│  Infrastructure (DB, Repositories)                       │
│  Domain (Entities, Traits)                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Project Structure

```
src/
├── core/
│   ├── domain/
│   │   ├── entities.rs      # User, Product, Order
│   │   └── traits.rs        # Repository traits
│   ├── application/
│   │   └── handlers.rs      # Business logic
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── connection.rs    # DB connection pool
│   │   │   ├── models.rs        # DB models
│   │   │   ├── users.rs         # User CRUD ops
│   │   │   ├── products.rs      # Product CRUD ops
│   │   │   ├── orders.rs        # Order CRUD ops
│   │   │   └── repositories.rs  # Trait implementations
│   │   └── di.rs            # Dependency injection
│   └── presentation/
│       └── webui/handlers/
│           └── db_handlers.rs # WebUI event handlers

frontend/src/
├── core/
│   ├── api.service.ts       # RPC communication
│   └── logger.service.ts    # Logging
└── views/
    ├── duckdb/              # DuckDB components
    └── sqlite/              # SQLite components
```

---

## 🚀 Quick Start: Choose Your Database

### SQLite (Transaction-Focused)

**Best for:** OLTP, CRUD operations, embedded applications

```bash
# Already configured in Cargo.toml
# Just build and run
./run.sh
```

### DuckDB (Analytics-Focused)

**Best for:** OLAP, analytics, data processing

```bash
# Add DuckDB dependency
cargo add duckdb

# Build with DuckDB feature
./run.sh --build
```

---

## 📊 Database Comparison

| Feature | SQLite | DuckDB |
|---------|--------|--------|
| **Use Case** | Transactions | Analytics |
| **Query Type** | Row-based | Column-based |
| **Concurrency** | Single writer | Single writer |
| **Performance** | Fast CRUD | Fast aggregations |
| **Size** | ~1MB | ~5MB |
| **Best For** | User management | Data analysis |

---

## 🔧 Core Patterns

### Repository Pattern

```rust
// Domain trait
pub trait UserRepository {
    fn get_all(&self) -> AppResult<Vec<User>>;
    fn get_by_id(&self, id: i64) -> AppResult<Option<User>>;
    fn create(&self, name: &str, email: &str, role: &str, status: &str) -> AppResult<i64>;
    fn update(&self, id: i64, name: Option<&str>, email: Option<&str>, 
              role: Option<&str>, status: Option<&str>) -> AppResult<usize>;
    fn delete(&self, id: i64) -> AppResult<usize>;
}
```

### Service Layer (Frontend)

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  async getUsers(): Promise<User[]> {
    return this.api.callOrThrow<User[]>('getUsers');
  }

  async createUser(user: CreateUserDto): Promise<number> {
    return this.api.callOrThrow<number>('createUser', [
      user.name, user.email, user.role, user.status
    ]);
  }
}
```

---

## 📁 Next Steps

1. **[SQLite CRUD Guide](02-sqlite-crud-production.md)** - Complete SQLite implementation
2. **[DuckDB CRUD Guide](03-duckdb-crud-production.md)** - Complete DuckDB implementation
3. **[API Reference](04-api-reference.md)** - Complete API documentation
4. **[Security Guide](05-security-best-practices.md)** - Security patterns
5. **[Deployment Guide](06-deployment-production.md)** - Production deployment

---

## 🎯 Common Operations

### Initialize Database

```rust
// In main.rs or initialization
let db = Database::new("app.db")?;
db.init()?;  // Creates tables, indexes
```

### Connection Pooling

```rust
// r2d2 pool configuration
let manager = ConnectionManager::<SqliteConnection>::new("app.db");
let pool = Pool::builder()
    .max_size(10)
    .min_idle(Some(2))
    .build(manager)?;
```

### Error Handling

```rust
// Always use AppResult, never unwrap
fn get_user(&self, id: i64) -> AppResult<Option<User>> {
    // Proper error propagation
    self.get_user_by_id(id)
        .map_err(|e| AppError::DatabaseError(e.to_string()))
}
```

---

## 📞 Getting Help

- Check application logs: `logs/application.log`
- Use DevTools panel for debugging
- Review [Security Guide](05-security-best-practices.md)
- See [API Reference](04-api-reference.md)

---

**Last Updated:** 2026-03-31  
**Status:** ✅ Production Ready
