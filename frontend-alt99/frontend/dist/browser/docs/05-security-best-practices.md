# Security Best Practices for CRUD Integrations

Production security patterns for SQLite and DuckDB CRUD operations with Rust backend and Angular frontend.

---

## 🎯 Overview

This guide covers essential security practices for production CRUD applications:
- Input validation
- SQL injection prevention
- Error handling
- Authentication & authorization
- Data protection
- Audit logging

---

## 🔒 Input Validation

### Backend Validation (Rust)

**Always validate inputs before database operations:**

```rust
// ✅ GOOD: Comprehensive validation
pub fn insert_user(&self, name: &str, email: &str, role: &str, status: &str) -> AppResult<i64> {
    // Required field validation
    if name.is_empty() {
        return Err(AppError::Validation(
            ErrorValue::new(ErrorCode::MissingRequiredField, "Name is required")
                .with_field("name"),
        ));
    }
    
    if name.len() > 100 {
        return Err(AppError::Validation(
            ErrorValue::new(ErrorCode::InvalidValue, "Name must be less than 100 characters")
                .with_field("name"),
        ));
    }
    
    // Email format validation
    if email.is_empty() || !email.contains('@') || !email.contains('.') {
        return Err(AppError::Validation(
            ErrorValue::new(ErrorCode::InvalidValue, "Invalid email format")
                .with_field("email"),
        ));
    }
    
    // Whitelist validation for enums
    let valid_roles = ["User", "Admin", "Manager"];
    if !valid_roles.contains(&role) {
        return Err(AppError::Validation(
            ErrorValue::new(ErrorCode::InvalidValue, "Invalid role")
                .with_field("role"),
        ));
    }
    
    let valid_statuses = ["Active", "Inactive", "Suspended"];
    if !valid_statuses.contains(&status) {
        return Err(AppError::Validation(
            ErrorValue::new(ErrorCode::InvalidValue, "Invalid status")
                .with_field("status"),
        ));
    }
    
    // Proceed with database operation
    let conn = self.get_conn()?;
    // ...
}

// ✅ GOOD: Numeric validation
pub fn insert_product(&self, name: &str, price: f64, stock: i64) -> AppResult<i64> {
    if price <= 0.0 {
        return Err(AppError::Validation(
            ErrorValue::new(ErrorCode::InvalidValue, "Price must be positive")
                .with_field("price"),
        ));
    }
    
    if price > 1_000_000.0 {
        return Err(AppError::Validation(
            ErrorValue::new(ErrorCode::InvalidValue, "Price exceeds maximum allowed")
                .with_field("price"),
        ));
    }
    
    if stock < 0 {
        return Err(AppError::Validation(
            ErrorValue::new(ErrorCode::InvalidValue, "Stock cannot be negative")
                .with_field("stock"),
        ));
    }
    
    // ...
}
```

### Frontend Validation (TypeScript)

**Validate on both client and server:**

```typescript
// ✅ GOOD: Frontend validation
async createUser(user: CreateUserDto): Promise<number> {
  // Required fields
  if (!user.name?.trim()) {
    throw new Error('Name is required');
  }
  
  if (user.name.length > 100) {
    throw new Error('Name must be less than 100 characters');
  }
  
  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!user.email || !emailRegex.test(user.email)) {
    throw new Error('Invalid email format');
  }
  
  // Whitelist validation
  const validRoles = ['User', 'Admin', 'Manager'];
  if (user.role && !validRoles.includes(user.role)) {
    throw new Error('Invalid role');
  }
  
  // Numeric validation
  if (user.price && (user.price <= 0 || user.price > 1_000_000)) {
    throw new Error('Price must be between 0 and 1,000,000');
  }
  
  return this.api.callOrThrow('createUser', [
    user.name.trim(),
    user.email.trim(),
    user.role ?? 'User',
    user.status ?? 'Active'
  ]);
}
```

---

## 🛡️ SQL Injection Prevention

### Always Use Parameterized Queries

```rust
// ✅ GOOD: Parameterized query (rusqlite)
conn.execute(
    "INSERT INTO users (name, email, role, status) VALUES (?, ?, ?, ?)",
    params![name, email, role, status],
)?;

// ✅ GOOD: Parameterized query (duckdb)
conn.execute(
    "SELECT * FROM products WHERE category = ? AND price < ?",
    params![category, max_price],
)?;

// ❌ BAD: String concatenation (VULNERABLE!)
let query = format!(
    "SELECT * FROM users WHERE email = '{}'",
    email  // SQL injection vulnerability!
);
conn.execute(&query, [])?;

// ❌ BAD: Format string in WHERE clause
let query = format!(
    "DELETE FROM users WHERE id = {}",
    user_id  // SQL injection if user_id is not sanitized!
);
```

### Dynamic Query Building

```rust
// ✅ GOOD: Safe dynamic query building
pub fn search_users(&self, query: &str, role: Option<&str>) -> AppResult<Vec<User>> {
    let conn = self.get_conn()?;
    
    let mut sql = String::from(
        "SELECT id, name, email, role, status, created_at FROM users WHERE 1=1"
    );
    let mut params: Vec<&dyn rusqlite::ToSql> = Vec::new();
    
    // Safe parameterized search
    if !query.is_empty() {
        sql.push_str(" AND (name LIKE ? OR email LIKE ?)");
        let search_pattern = format!("%{}%", query);
        params.push(&search_pattern);
        params.push(&search_pattern);
    }
    
    // Safe optional filter
    if let Some(r) = role {
        sql.push_str(" AND role = ?");
        params.push(r);
    }
    
    sql.push_str(" ORDER BY id");
    
    let mut stmt = conn.prepare(&sql)?;
    let users = stmt.query_map(params.as_slice(), |row| {
        // ...
    })?;
    
    users.collect()
}
```

---

## 🔐 Error Handling

### Don't Expose Internal Errors

```rust
// ✅ GOOD: Generic error messages to frontend
pub fn get_user(&self, id: i64) -> AppResult<Option<User>> {
    match self.get_user_by_id(id) {
        Ok(user) => Ok(user),
        Err(e) => {
            // Log detailed error internally
            log::error!("Database error fetching user {}: {}", id, e);
            
            // Return generic error to frontend
            Err(AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to fetch user")
                    .with_context("user_id", id.to_string()),
            ))
        }
    }
}

// ❌ BAD: Exposing internal error details
pub fn get_user_bad(&self, id: i64) -> AppResult<Option<User>> {
    let user = self.get_user_by_id(id)?;  // Exposes SQL, connection strings, etc.
    Ok(user)
}
```

### Frontend Error Handling

```typescript
// ✅ GOOD: User-friendly error messages
async deleteUser(id: number): Promise<void> {
  try {
    await this.api.callOrThrow('deleteUser', [id]);
  } catch (error) {
    // Log technical details
    this.logger.error('Delete user failed', error);
    
    // Show user-friendly message
    if (error.message.includes('foreign key')) {
      this.showMessage('Cannot delete user with associated orders');
    } else if (error.message.includes('not found')) {
      this.showMessage('User not found');
    } else {
      this.showMessage('Failed to delete user. Please try again.');
    }
  }
}
```

---

## 🔑 Authentication & Authorization

### Role-Based Access Control (RBAC)

```rust
// ✅ GOOD: Role-based authorization
pub fn handle_delete_user(event: &Event) {
    let window = event.get_window();
    
    // Check authentication
    let Some(user) = get_current_user() else {
        send_error_response(window, "user_delete_response", "Authentication required");
        return;
    };
    
    // Check authorization
    if user.role != "Admin" {
        send_error_response(window, "user_delete_response", 
            "Insufficient permissions. Admin access required.");
        return;
    }
    
    // Proceed with operation
    let params = parse_event_params(event);
    let id = params.get(0).and_then(|s| s.parse::<i64>().ok()).unwrap_or(0);
    
    let Some(db) = get_db() else {
        send_error_response(window, "user_delete_response", "Database not available");
        return;
    };
    
    let result = db.delete(id);
    handle_db_result(window, "user_delete_response", result);
}
```

### Frontend Route Guards

```typescript
// ✅ GOOD: Route guard for admin routes
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  canActivate(): boolean {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }
    
    if (user.role !== 'Admin') {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    
    return true;
  }
}

// Route configuration
const routes: Routes = [
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      { path: 'users', component: UserManagementComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];
```

---

## 🔒 Data Protection

### Sensitive Data Encryption

```rust
// ✅ GOOD: Encrypt sensitive data before storage
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, KeyInit};

pub fn store_sensitive_data(&self, user_id: i64, data: &str) -> AppResult<()> {
    let conn = self.get_conn()?;
    
    // Encrypt data
    let key = get_encryption_key();  // From secure key management
    let cipher = Aes256Gcm::new_from_slice(&key)?;
    let nonce = generate_nonce();
    let ciphertext = cipher.encrypt(&nonce, data.as_bytes())?;
    
    // Store encrypted data
    conn.execute(
        "INSERT INTO sensitive_data (user_id, encrypted_data, nonce) VALUES (?, ?, ?)",
        params![user_id, ciphertext, nonce.as_slice()],
    )?;
    
    Ok(())
}
```

### Password Hashing

```rust
// ✅ GOOD: Hash passwords with bcrypt
use bcrypt::{hash, verify, DEFAULT_COST};

pub fn create_user_with_password(
    &self, 
    name: &str, 
    email: &str, 
    password: &str
) -> AppResult<i64> {
    // Validate password strength
    if password.len() < 12 {
        return Err(AppError::Validation(
            ErrorValue::new(ErrorCode::InvalidValue, "Password must be at least 12 characters")
                .with_field("password"),
        ));
    }
    
    // Hash password
    let hashed = hash(password, DEFAULT_COST)
        .map_err(|e| AppError::Internal(format!("Failed to hash password: {}", e)))?;
    
    let conn = self.get_conn()?;
    conn.execute(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        params![name, email, hashed],
    )?;
    
    Ok(conn.last_insert_rowid())
}

pub fn verify_password(&self, user_id: i64, password: &str) -> AppResult<bool> {
    let conn = self.get_conn()?;
    let hash: String = conn.query_row(
        "SELECT password_hash FROM users WHERE id = ?",
        [user_id],
        |row| row.get(0),
    )?;
    
    Ok(verify(password, &hash).unwrap_or(false))
}
```

---

## 📝 Audit Logging

### Log All CRUD Operations

```rust
// ✅ GOOD: Comprehensive audit logging
pub fn delete_user(&self, id: i64, deleted_by: &str) -> AppResult<usize> {
    let conn = self.get_conn()?;
    
    // Log before deletion
    let user = self.get_user_by_id(id)?;
    if let Some(u) = user {
        log::info!(
            target: "audit",
            "USER_DELETED: id={}, name={}, email={}, deleted_by={}, timestamp={}",
            id,
            u.name,
            u.email,
            deleted_by,
            chrono::Local::now().format("%Y-%m-%d %H:%M:%S")
        );
        
        // Insert audit trail record
        conn.execute(
            "INSERT INTO audit_log (action, entity_type, entity_id, user_id, timestamp, details) 
             VALUES (?, ?, ?, ?, ?, ?)",
            params![
                "DELETE",
                "user",
                id,
                deleted_by,
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
                format!("Deleted user: {}", u.email)
            ],
        )?;
    }
    
    let rows = conn.execute("DELETE FROM users WHERE id = ?", [id])?;
    Ok(rows)
}
```

### Frontend Audit Logging

```typescript
// ✅ GOOD: Log user actions
async deleteUser(user: User): Promise<void> {
  if (!confirm(`Delete ${user.name}?`)) return;
  
  const currentUser = this.authService.getCurrentUser();
  
  // Log action
  this.logger.audit('USER_DELETE_ATTEMPT', {
    targetUserId: user.id,
    targetUserEmail: user.email,
    performedBy: currentUser?.email,
    timestamp: new Date().toISOString()
  });
  
  try {
    await this.service.deleteUser(user.id);
    
    this.logger.audit('USER_DELETE_SUCCESS', {
      targetUserId: user.id,
      performedBy: currentUser?.email
    });
  } catch (error) {
    this.logger.audit('USER_DELETE_FAILED', {
      targetUserId: user.id,
      error: error.message,
      performedBy: currentUser?.email
    });
    throw error;
  }
}
```

---

## 🔐 Connection Security

### Database File Permissions

```rust
// ✅ GOOD: Set restrictive file permissions
#[cfg(unix)]
pub fn set_database_permissions(path: &str) -> AppResult<()> {
    use std::os::unix::fs::PermissionsExt;
    
    let metadata = std::fs::metadata(path)?;
    let mut permissions = metadata.permissions();
    
    // Owner read/write only (600)
    permissions.set_mode(0o600);
    std::fs::set_permissions(path, permissions)?;
    
    Ok(())
}
```

### Connection String Security

```rust
// ✅ GOOD: Use environment variables for sensitive config
use std::env;

pub fn new_from_env() -> AppResult<Self> {
    let db_path = env::var("DATABASE_PATH")
        .unwrap_or_else(|_| "app.db".to_string());
    
    let max_pool_size = env::var("DB_MAX_POOL_SIZE")
        .unwrap_or_else(|_| "10".to_string())
        .parse::<u32>()
        .unwrap_or(10);
    
    // Don't log connection strings with credentials
    log::info!("Initializing database connection pool");
    
    Self::with_config(&db_path, DbPoolConfig {
        max_size: max_pool_size,
        ..Default::default()
    })
}
```

---

## 🚨 Security Checklist

### Before Production Deployment

- [ ] All SQL queries use parameterized statements
- [ ] Input validation on both frontend and backend
- [ ] Error messages don't expose internal details
- [ ] Authentication required for all write operations
- [ ] Authorization checks for sensitive operations
- [ ] Audit logging enabled for CRUD operations
- [ ] Database file permissions restricted
- [ ] Connection strings in environment variables
- [ ] Password hashing with bcrypt/argon2
- [ ] HTTPS enabled for remote connections
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Dependency vulnerabilities scanned

---

## 📁 Related Documentation

- **[SQLite CRUD Guide](02-sqlite-crud-production.md)** - SQLite implementation
- **[DuckDB CRUD Guide](03-duckdb-crud-production.md)** - DuckDB implementation
- **[API Reference](04-api-reference.md)** - Complete API documentation
- **[Deployment Guide](06-deployment-production.md)** - Production deployment

---

**Last Updated:** 2026-03-31  
**Status:** ✅ Production Ready
