# Production Deployment Guide for CRUD Integrations

Complete guide for deploying SQLite and DuckDB CRUD applications to production environments.

---

## 🎯 Overview

This guide covers:
- Build configuration for production
- Database migration strategies
- Environment configuration
- Deployment pipelines
- Monitoring and maintenance
- Backup and recovery

---

## 📦 Build Configuration

### Cargo.toml Production Profile

```toml
[package]
name = "rustwebui-app"
version = "1.0.0"
edition = "2021"

[dependencies]
# SQLite
rusqlite = { version = "0.32", features = ["bundled"] }
r2d2 = "0.8"
r2d2_sqlite = "0.25"

# DuckDB (optional)
duckdb = { version = "1.0", features = ["bundled"] }

# Core
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
chrono = { version = "0.4", features = ["serde"] }
log = "0.4"

[profile.release]
opt-level = 3           # Maximum optimization
lto = true              # Link-time optimization
codegen-units = 1       # Single codegen unit for better optimization
strip = true            # Strip debug symbols
panic = "abort"         # Abort on panic (smaller binary)

[profile.release-with-debug]
inherits = "release"
strip = false           # Keep debug symbols for profiling
debug = true
```

### Build Commands

```bash
# Development build
./run.sh --build

# Release build (optimized)
./run.sh --release

# Release with debug symbols (for profiling)
cargo build --profile release-with-debug

# Cross-platform build
cargo build --release --target x86_64-unknown-linux-gnu
```

### Frontend Production Build

```bash
cd frontend

# Production build with Rspack
bun run build

# Analyze bundle size
bun run build --analyze

# Verify build
bun run lint
bun run test
```

---

## 🗄️ Database Migration

### Migration Script Structure

**File:** `migrations/001_initial_schema.sql`

```sql
-- Migration: 001_initial_schema
-- Date: 2026-03-31
-- Description: Initial database schema

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

-- Orders table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

-- Migration tracking
CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO _migrations (name) VALUES ('001_initial_schema');
```

### Migration Runner

**File:** `src/core/infrastructure/database/migrations.rs`

```rust
use rusqlite::Connection;
use std::fs;
use std::path::Path;

pub fn run_migrations(conn: &Connection) -> AppResult<()> {
    let migrations_dir = Path::new("migrations");
    
    if !migrations_dir.exists() {
        log::warn!("Migrations directory not found");
        return Ok(());
    }
    
    let mut files: Vec<_> = fs::read_dir(migrations_dir)?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |ext| ext == "sql"))
        .collect();
    
    files.sort_by_key(|e| e.path());
    
    for file in files {
        let path = file.path();
        let name = path.file_stem()
            .unwrap()
            .to_string_lossy()
            .to_string();
        
        // Check if migration already applied
        let exists: bool = conn.query_row(
            "SELECT COUNT(*) > 0 FROM _migrations WHERE name = ?",
            [&name],
            |row| row.get(0),
        )?;
        
        if exists {
            log::info!("Skipping already applied migration: {}", name);
            continue;
        }
        
        // Read and execute migration
        let sql = fs::read_to_string(&path)?;
        conn.execute_batch(&sql)?;
        
        log::info!("Applied migration: {}", name);
    }
    
    Ok(())
}
```

---

## ⚙️ Environment Configuration

### Environment Variables

```bash
# Application
APP_ENV=production
APP_NAME="Rust WebUI CRUD"
APP_VERSION=1.0.0

# Database
DATABASE_PATH=/var/lib/myapp/app.db
DB_MAX_POOL_SIZE=20
DB_MIN_IDLE=5
DB_CONNECTION_TIMEOUT=30

# DuckDB (if using)
DUCKDB_PATH=/var/lib/myapp/analytics.db
DUCKDB_THREADS=4

# Logging
RUST_LOG=info
LOG_FILE=/var/log/myapp/application.log
LOG_MAX_SIZE_MB=100
LOG_MAX_FILES=10

# Security
ENCRYPTION_KEY=your-encryption-key-here  # From secure vault
JWT_SECRET=your-jwt-secret-here          # From secure vault

# Feature flags
ENABLE_DUCKDB=true
ENABLE_ANALYTICS=true
ENABLE_AUDIT_LOG=true
```

### Configuration File

**File:** `config/production.toml`

```toml
[app]
name = "Rust WebUI CRUD"
version = "1.0.0"
environment = "production"

[database]
path = "/var/lib/myapp/app.db"
max_pool_size = 20
min_idle = 5
connection_timeout_secs = 30

[duckdb]
enabled = true
path = "/var/lib/myapp/analytics.db"
threads = 4

[logging]
level = "info"
file = "/var/log/myapp/application.log"
max_size_mb = 100
max_files = 10

[security]
audit_log_enabled = true
rate_limit_per_minute = 100

[backup]
enabled = true
schedule = "0 2 * * *"  # Daily at 2 AM
retention_days = 30
backup_dir = "/var/backups/myapp"
```

---

## 🚀 Deployment Pipeline

### Docker Deployment

**File:** `Dockerfile`

```dockerfile
# Build stage
FROM rust:1.75-slim as builder

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy source
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY build.rs ./

# Build release
RUN cargo build --release --locked

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-0 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -r -u 1000 appuser

WORKDIR /app

# Copy binary
COPY --from=builder /app/target/release/rustwebui-app /app/

# Copy config and migrations
COPY config/ /app/config/
COPY migrations/ /app/migrations/

# Create directories
RUN mkdir -p /var/lib/myapp /var/log/myapp /var/backups/myapp \
    && chown -R appuser:appuser /app /var/lib/myapp /var/log/myapp /var/backups/myapp

USER appuser

EXPOSE 8080

CMD ["./rustwebui-app"]
```

### Docker Compose

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - APP_ENV=production
      - DATABASE_PATH=/var/lib/myapp/app.db
      - RUST_LOG=info
    volumes:
      - app-data:/var/lib/myapp
      - app-logs:/var/log/myapp
      - app-backups:/var/backups/myapp
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  app-data:
  app-logs:
  app-backups:
```

### Systemd Service (Linux)

**File:** `/etc/systemd/system/rustwebui-app.service`

```ini
[Unit]
Description=Rust WebUI CRUD Application
After=network.target

[Service]
Type=simple
User=appuser
Group=appuser
WorkingDirectory=/opt/rustwebui-app
ExecStart=/opt/rustwebui-app/rustwebui-app
Environment=RUST_LOG=info
Environment=DATABASE_PATH=/var/lib/rustwebui-app/app.db
Restart=always
RestartSec=10

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/rustwebui-app /var/log/rustwebui-app

[Install]
WantedBy=multi-user.target
```

### Deployment Commands

```bash
# Build and deploy
./build-dist.sh build-release

# Install systemd service
sudo cp target/release/rustwebui-app /opt/rustwebui-app/
sudo cp rustwebui-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable rustwebui-app
sudo systemctl start rustwebui-app

# Check status
sudo systemctl status rustwebui-app

# View logs
sudo journalctl -u rustwebui-app -f
```

---

## 📊 Monitoring

### Health Check Endpoint

```rust
// WebUI handler for health check
pub fn handle_health_check(event: &Event) {
    let window = event.get_window();
    
    let response = HealthResponse {
        status: "healthy",
        version: env!("CARGO_PKG_VERSION"),
        database: check_database_health(),
        uptime: get_uptime(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    
    send_response(window, "health_response", &response);
}

fn check_database_health() -> String {
    match get_db() {
        Some(db) => {
            match db.get_user_count() {
                Ok(_) => "connected".to_string(),
                Err(e) => format!("error: {}", e),
            }
        }
        None => "not_available".to_string(),
    }
}
```

### Metrics Collection

```rust
use std::sync::atomic::{AtomicU64, Ordering};

static REQUESTS_TOTAL: AtomicU64 = AtomicU64::new(0);
static REQUESTS_FAILED: AtomicU64 = AtomicU64::new(0);
static QUERY_DURATION_MS: AtomicU64 = AtomicU64::new(0);

pub fn record_request(success: bool, duration_ms: u64) {
    REQUESTS_TOTAL.fetch_add(1, Ordering::Relaxed);
    if !success {
        REQUESTS_FAILED.fetch_add(1, Ordering::Relaxed);
    }
    QUERY_DURATION_MS.fetch_add(duration_ms, Ordering::Relaxed);
}

pub fn get_metrics() -> Metrics {
    let total = REQUESTS_TOTAL.load(Ordering::Relaxed);
    let failed = REQUESTS_FAILED.load(Ordering::Relaxed);
    let duration = QUERY_DURATION_MS.load(Ordering::Relaxed);
    
    Metrics {
        requests_total: total,
        requests_failed: failed,
        requests_success_rate: if total > 0 { 
            ((total - failed) as f64 / total as f64 * 100.0) 
        } else { 
            0.0 
        },
        avg_query_duration_ms: if total > 0 { 
            duration as f64 / total as f64 
        } else { 
            0.0 
        },
    }
}
```

### Log Aggregation

```bash
# View recent errors
tail -f /var/log/myapp/application.log | grep -i error

# Count errors by type
grep "ERROR" /var/log/myapp/application.log | cut -d':' -f2 | sort | uniq -c

# Log statistics
wc -l /var/log/myapp/application.log
du -h /var/log/myapp/application.log
```

---

## 💾 Backup and Recovery

### Automated Backup Script

**File:** `scripts/backup.sh`

```bash
#!/bin/bash

set -e

BACKUP_DIR="/var/backups/myapp"
DATA_DIR="/var/lib/myapp"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
echo "Backing up database..."
cp "$DATA_DIR/app.db" "$BACKUP_DIR/app_$DATE.db"
cp "$DATA_DIR/analytics.db" "$BACKUP_DIR/analytics_$DATE.db"

# Compress backup
echo "Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "backup_$DATE.tar.gz" app_$DATE.db analytics_$DATE.db
rm app_$DATE.db analytics_$DATE.db

# Remove old backups
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

### Cron Job for Automated Backups

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/rustwebui-app/scripts/backup.sh >> /var/log/myapp/backup.log 2>&1
```

### Restore from Backup

```bash
#!/bin/bash

set -e

BACKUP_FILE="$1"
DATA_DIR="/var/lib/myapp"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: restore.sh <backup.tar.gz>"
    exit 1
fi

# Stop application
systemctl stop rustwebui-app

# Extract backup
echo "Extracting backup..."
tar -xzf "$BACKUP_FILE" -C /tmp

# Restore database
echo "Restoring database..."
cp /tmp/app_*.db "$DATA_DIR/app.db"
cp /tmp/analytics_*.db "$DATA_DIR/analytics.db"

# Set permissions
chown appuser:appuser "$DATA_DIR"/*.db

# Start application
systemctl start rustwebui-app

echo "Restore completed successfully"
```

---

## 🔒 Security Hardening

### Production Security Checklist

- [ ] Run as non-root user
- [ ] Restrict database file permissions (600)
- [ ] Enable firewall (only required ports open)
- [ ] Use HTTPS for remote connections
- [ ] Enable audit logging
- [ ] Configure log rotation
- [ ] Set up automated backups
- [ ] Enable rate limiting
- [ ] Remove debug endpoints
- [ ] Scan for vulnerabilities

### File Permissions

```bash
# Set restrictive permissions
sudo chown -R appuser:appuser /opt/rustwebui-app
sudo chmod 750 /opt/rustwebui-app
sudo chmod 600 /var/lib/myapp/*.db
sudo chmod 640 /opt/rustwebui-app/config/*.toml
```

---

## 📁 Related Documentation

- **[SQLite CRUD Guide](02-sqlite-crud-production.md)** - SQLite implementation
- **[DuckDB CRUD Guide](03-duckdb-crud-production.md)** - DuckDB implementation
- **[API Reference](04-api-reference.md)** - Complete API documentation
- **[Security Guide](05-security-best-practices.md)** - Security patterns

---

**Last Updated:** 2026-03-31  
**Status:** ✅ Production Ready
