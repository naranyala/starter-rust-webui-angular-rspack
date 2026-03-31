//! Database Management Service
//! 
//! Provides database management operations including:
//! - Backup and restore
//! - Data persistence verification
//! - Database statistics
//! - Safe data cleanup operations

use crate::core::error::{AppError, AppResult, ErrorCode, ErrorValue};
use crate::core::infrastructure::database::Database;
use log::{error, info};
use std::fs;
use std::path::Path;
use std::sync::Arc;

/// Database management service
pub struct DatabaseManagementService {
    db: Arc<Database>,
    db_path: String,
    backup_dir: String,
}

impl DatabaseManagementService {
    /// Create a new database management service
    pub fn new(db: Arc<Database>, db_path: String) -> Self {
        let backup_dir = std::env::var("DATABASE_BACKUP_DIR")
            .unwrap_or_else(|_| "./backups".to_string());
        
        Self {
            db,
            db_path,
            backup_dir,
        }
    }

    /// Create backup directory if it doesn't exist
    fn ensure_backup_dir(&self) -> AppResult<()> {
        let path = Path::new(&self.backup_dir);
        if !path.exists() {
            fs::create_dir_all(path).map_err(|e| {
                AppError::Database(
                    ErrorValue::new(
                        ErrorCode::DbQueryFailed,
                        "Failed to create backup directory",
                    )
                    .with_cause(e.to_string()),
                )
            })?;
            info!("Created backup directory: {}", self.backup_dir);
        }
        Ok(())
    }

    /// Create a database backup
    /// 
    /// Returns the backup file path
    pub fn create_backup(&self) -> AppResult<String> {
        self.ensure_backup_dir()?;
        
        let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
        let db_filename = Path::new(&self.db_path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("database.db");
        let backup_filename = format!("backup_{}_{}", timestamp, db_filename);
        let backup_path = Path::new(&self.backup_dir).join(&backup_filename);

        info!("Creating database backup: {:?}", backup_path);

        // Simple file copy for backup (works with connection pool)
        fs::copy(&self.db_path, &backup_path).map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to create database backup")
                    .with_cause(e.to_string()),
            )
        })?;

        let backup_size = fs::metadata(&backup_path)
            .map(|m| m.len())
            .unwrap_or(0);

        info!(
            "Database backup created: {:?} ({} bytes)",
            backup_path, backup_size
        );

        Ok(backup_path.to_string_lossy().to_string())
    }

    /// Restore database from backup
    pub fn restore_from_backup(&self, backup_path: &str) -> AppResult<()> {
        let backup_file = Path::new(backup_path);
        
        if !backup_file.exists() {
            return Err(AppError::NotFound(
                ErrorValue::new(ErrorCode::ResourceNotFound, "Backup file not found")
                    .with_context("backup_path", backup_path),
            ));
        }

        info!("Restoring database from backup: {:?}", backup_file);

        // Create backup before restore (safety measure)
        let pre_restore_backup = self.create_backup()?;
        info!("Pre-restore backup created: {}", pre_restore_backup);

        // Copy backup to database location
        fs::copy(backup_path, &self.db_path).map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to restore database")
                    .with_cause(e.to_string()),
            )
        })?;

        info!("Database restored successfully from: {}", backup_path);

        Ok(())
    }

    /// List available backups
    pub fn list_backups(&self) -> AppResult<Vec<BackupInfo>> {
        let backup_dir = Path::new(&self.backup_dir);
        
        if !backup_dir.exists() {
            return Ok(Vec::new());
        }

        let mut backups = Vec::new();

        for entry in fs::read_dir(backup_dir).map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to read backup directory")
                    .with_cause(e.to_string()),
            )
        })? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_file() && path.extension().map_or(false, |ext| ext == "db") {
                let metadata = fs::metadata(&path).map_err(|e| {
                    AppError::Database(
                        ErrorValue::new(
                            ErrorCode::DbQueryFailed,
                            "Failed to read backup metadata",
                        )
                        .with_cause(e.to_string()),
                    )
                })?;

                // Convert SystemTime to Unix timestamp
                let created = metadata.created()
                    .ok()
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_secs())
                    .unwrap_or(0);
                let modified = metadata.modified()
                    .ok()
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_secs())
                    .unwrap_or(0);

                backups.push(BackupInfo {
                    path: path.to_string_lossy().to_string(),
                    size: metadata.len(),
                    created,
                    modified,
                });
            }
        }

        // Sort by modified time (newest first)
        backups.sort_by(|a, b| b.modified.cmp(&a.modified));

        Ok(backups)
    }

    /// Delete old backups (keep last N backups)
    pub fn cleanup_old_backups(&self, keep_count: usize) -> AppResult<usize> {
        let backups = self.list_backups()?;
        
        if backups.len() <= keep_count {
            return Ok(0);
        }

        let mut deleted_count = 0;

        for backup in backups.iter().skip(keep_count) {
            if let Err(e) = fs::remove_file(&backup.path) {
                error!("Failed to delete old backup {:?}: {}", backup.path, e);
            } else {
                info!("Deleted old backup: {:?}", backup.path);
                deleted_count += 1;
            }
        }

        Ok(deleted_count)
    }

    /// Get database statistics
    pub fn get_database_info(&self) -> AppResult<DatabaseInfo> {
        let db_path = Path::new(&self.db_path);
        
        let metadata = fs::metadata(db_path).map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to read database metadata")
                    .with_cause(e.to_string()),
            )
        })?;

        // Convert SystemTime to Unix timestamp
        let created = metadata.created()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs())
            .unwrap_or(0);
        let modified = metadata.modified()
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|d| d.as_secs())
            .unwrap_or(0);

        let conn = self.db.get_conn()?;
        
        // Get table counts
        let user_count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM users",
            [],
            |row| row.get(0),
        ).unwrap_or(0);

        let product_count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM products",
            [],
            |row| row.get(0),
        ).unwrap_or(0);

        let order_count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM orders",
            [],
            |row| row.get(0),
        ).unwrap_or(0);

        Ok(DatabaseInfo {
            path: self.db_path.clone(),
            size: metadata.len(),
            created,
            modified,
            user_count,
            product_count,
            order_count,
            backup_count: self.list_backups()?.len(),
        })
    }

    /// Verify database integrity
    pub fn verify_integrity(&self) -> AppResult<DatabaseIntegrity> {
        let conn = self.db.get_conn()?;
        
        // Run SQLite integrity check
        let integrity_result: String = conn.query_row(
            "PRAGMA integrity_check",
            [],
            |row| row.get(0),
        ).map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Integrity check failed")
                    .with_cause(e.to_string()),
            )
        })?;

        let is_valid = integrity_result == "ok";

        Ok(DatabaseIntegrity {
            is_valid,
            message: integrity_result,
            last_verified: chrono::Local::now().timestamp() as u64,
        })
    }
}

/// Backup file information
#[derive(Debug, Clone)]
pub struct BackupInfo {
    pub path: String,
    pub size: u64,
    pub created: u64,
    pub modified: u64,
}

/// Database information
#[derive(Debug, Clone)]
pub struct DatabaseInfo {
    pub path: String,
    pub size: u64,
    pub created: u64,
    pub modified: u64,
    pub user_count: i64,
    pub product_count: i64,
    pub order_count: i64,
    pub backup_count: usize,
}

/// Database integrity check result
#[derive(Debug, Clone)]
pub struct DatabaseIntegrity {
    pub is_valid: bool,
    pub message: String,
    pub last_verified: u64,
}

// Helper implementations
impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Database(
            ErrorValue::new(ErrorCode::DbQueryFailed, "I/O error")
                .with_cause(err.to_string()),
        )
    }
}
