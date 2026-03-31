# Data Persistence Guide

## Overview

This guide explains how data persistence is implemented in the SQLite and DuckDB demos, ensuring that:
1. **Data persists** across application restarts
2. **Sample data** is only inserted on first run (when database is empty)
3. **Delete operations** require explicit user confirmation with type-to-validate
4. **Backup/Restore** functionality is available for data protection

---

## Backend Implementation

### 1. Data Persistence

**Location:** `src/core/infrastructure/database/`

The database layer ensures data persistence through:

#### SQLite Database
- Database file stored at `config/app.db` (configurable)
- Connection pooling with r2d2 for performance
- Sample data only inserted when database is empty

```rust
// src/core/infrastructure/database/users.rs
pub fn insert_sample_data_if_empty(&self) -> DbResult<bool> {
    let existing_count = self.get_user_count()?;
    
    if existing_count > 0 {
        info!("Database already has {} users, skipping sample data insertion", existing_count);
        return Ok(false); // Data persists - don't insert samples
    }

    // Only insert sample data if database is empty
    info!("Database is empty, inserting sample data...");
    // ... insert sample users
    Ok(true)
}
```

#### Key Features:
- ✅ **Automatic persistence**: All CRUD operations save to disk
- ✅ **First-run detection**: Sample data only inserted when `COUNT(*) = 0`
- ✅ **No auto-deletion**: Data remains until explicitly deleted
- ✅ **Connection pooling**: Efficient database access

### 2. Database Management Service

**Location:** `src/core/infrastructure/database/management.rs`

Provides backup, restore, and integrity checking:

```rust
pub struct DatabaseManagementService {
    db: Arc<Database>,
    db_path: String,
    backup_dir: String,
}

impl DatabaseManagementService {
    pub fn create_backup(&self) -> AppResult<String>;
    pub fn restore_from_backup(&self, backup_path: &str) -> AppResult<()>;
    pub fn list_backups(&self) -> AppResult<Vec<BackupInfo>>;
    pub fn verify_integrity(&self) -> AppResult<DatabaseIntegrity>;
}
```

### 3. WebUI Handlers

**Location:** `src/core/presentation/webui/handlers/db_management_handlers.rs`

Exposes database management functions to the frontend:

| Handler | Description |
|---------|-------------|
| `getDatabaseInfo` | Get database statistics and info |
| `createBackup` | Create a database backup |
| `listBackups` | List available backups |
| `restoreBackup` | Restore from a backup |
| `verifyDatabaseIntegrity` | Check database integrity |
| `cleanupOldBackups` | Remove old backups |

---

## Frontend Implementation

### 1. Type-to-Confirm Delete Validation

Both SQLite and DuckDB demos now require users to **type a confirmation phrase** before deleting data.

#### SQLite User Delete
```typescript
// User must type: DELETE {EMAIL}
const confirmText = `DELETE ${user.email.toUpperCase()}`;
```

#### DuckDB Product Delete
```typescript
// User must type: DELETE {PRODUCT_NAME}
const confirmText = `DELETE ${product.name.toUpperCase()}`;
```

#### Features:
- ⚠️ **Warning message** explaining consequences
- 📝 **Type-to-confirm** input field
- 🔒 **Button disabled** until exact match
- ❌ **Cancel option** always available
- 🎨 **Visual feedback** on input match

### 2. Database Management UI

**Location:** `frontend/src/views/database/database-management.component.ts`

A dedicated interface for database administration:

#### Features:
- 📊 **Database Statistics**
  - Total users, products, orders
  - Database size and path
  - Backup count
  - Persistence status

- 💾 **Backup Management**
  - Create new backups
  - List available backups
  - Restore from backups
  - Cleanup old backups

- ✅ **Integrity Checking**
  - Verify database integrity
  - Display last verified timestamp
  - Show integrity status

- ℹ️ **Persistence Information**
  - Educational content about data persistence
  - Best practices for backups

---

## Usage Guide

### Accessing Database Management

1. Start the application:
   ```bash
   ./run.sh
   ```

2. Navigate to **"Database Mgmt"** (🗃️) in the left panel menu

### Creating a Backup

1. Go to Database Management
2. Click **"Create Backup"**
3. Backup is saved to `./backups/` directory
4. Confirmation shows backup path

### Restoring from Backup

1. Go to Database Management
2. Find the backup in **"Available Backups"** list
3. Click **"Restore"**
4. Confirm the restoration
5. A pre-restore backup is automatically created

### Verifying Integrity

1. Go to Database Management
2. Click **"Verify Now"**
3. Results show:
   - ✅ Healthy - Database is valid
   - ❌ Issues Detected - Problems found

### Deleting Data (with Validation)

1. Navigate to SQLite Users or DuckDB Products
2. Click the delete button (🗑️) for an item
3. **Read the warning message**
4. **Type the confirmation text** exactly as shown:
   - For users: `DELETE {EMAIL}`
   - For products: `DELETE {PRODUCT_NAME}`
5. Click **"Delete Permanently"** (enabled only when text matches)

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Startup                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Check if database exists and has data                      │
│  - If COUNT(*) > 0: Skip sample data (data persists)        │
│  - If COUNT(*) = 0: Insert sample data (first run)          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Normal Operation                          │
│  - All CRUD operations persist to disk                      │
│  - Data survives application restarts                       │
│  - Users must explicitly delete data                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Delete Operation                          │
│  1. User clicks delete button                               │
│  2. Type-to-confirm modal appears                           │
│  3. User types confirmation text                            │
│  4. Delete button enabled when text matches                 │
│  5. Data permanently deleted from database                  │
└─────────────────────────────────────────────────────────────┘
```

---

## File Locations

### Database Files
```
./app.db                          # SQLite database file
./backups/                        # Backup directory
  backup_20240331_120000_app.db   # Example backup file
```

### Configuration
```toml
# config/app.config.toml
[database]
path = "app.db"
create_sample_data = true  # Only inserts if database is empty
```

### Source Files
```
src/
├── core/
│   └── infrastructure/
│       └── database/
│           ├── connection.rs        # Database connection
│           ├── management.rs        # Backup/restore service
│           ├── users.rs             # User CRUD (persistence-aware)
│           ├── products.rs          # Product CRUD (persistence-aware)
│           └── orders.rs            # Order CRUD (persistence-aware)
└── presentation/
    └── webui/
        └── handlers/
            └── db_management_handlers.rs  # WebUI handlers

frontend/src/
├── views/
│   ├── sqlite/
│   │   └── sqlite-user-demo.component.ts    # Type-to-confirm delete
│   ├── duckdb/
│   │   └── duckdb-products-demo.component.ts # Type-to-confirm delete
│   └── database/
│       └── database-management.component.ts  # Management UI
```

---

## Best Practices

### For Users
1. ✅ **Regular Backups**: Create backups before major changes
2. ✅ **Verify Integrity**: Run integrity check weekly
3. ✅ **Keep Multiple Backups**: Don't delete old backups immediately
4. ✅ **Confirm Carefully**: Read delete confirmations carefully

### For Developers
1. ✅ **Use `insert_sample_data_if_empty()`**: Never use deprecated methods
2. ✅ **Always Validate Deletes**: Require explicit confirmation
3. ✅ **Log Operations**: Track all data modifications
4. ✅ **Handle Errors Gracefully**: Show user-friendly error messages

---

## Troubleshooting

### Data Lost After Restart
**Cause:** Database file not persisted
**Solution:** 
- Check `config/app.config.toml` for correct `db_path`
- Ensure application has write permissions to database directory
- Verify database file exists: `ls -la app.db`

### Cannot Delete Data
**Cause:** Type-to-confirm text doesn't match exactly
**Solution:**
- Copy the confirmation text exactly (case-sensitive)
- Include all characters including spaces
- Check for typos

### Backup Creation Fails
**Cause:** Backup directory doesn't exist or no permissions
**Solution:**
```bash
mkdir -p ./backups
chmod 755 ./backups
```

### Integrity Check Fails
**Cause:** Database corruption
**Solution:**
1. Restore from last known good backup
2. If no backup exists, export data and recreate database

---

## Security Considerations

### Delete Validation
- Type-to-confirm prevents accidental deletions
- Confirmation text includes item identifier (email/name)
- Delete button disabled until exact match
- Cancel option always available

### Backup Security
- Backups stored locally by default
- Consider encrypting backups for production
- Implement backup retention policies
- Regular cleanup of old backups

---

## Summary

✅ **Data Persistence**: All data persists across restarts
✅ **Sample Data**: Only inserted on first run
✅ **Delete Validation**: Type-to-confirm required
✅ **Backup/Restore**: Full database management UI
✅ **Integrity Checking**: Verify database health
✅ **User Education**: Clear information about persistence

The system is designed to **protect user data** while providing **flexible management tools** for advanced users.
