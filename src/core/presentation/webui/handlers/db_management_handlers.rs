//! Database Management WebUI Handlers
//!
//! Provides WebUI event handlers for database management operations:
//! - Backup creation
//! - Backup restoration
//! - Database information
//! - Integrity verification
//!
//! These handlers allow users to manage database persistence through the UI.

use crate::core::error::{AppError, ErrorCode, ErrorValue};
use crate::core::infrastructure::database::{
    Database, DatabaseInfo, DatabaseIntegrity, DatabaseManagementService, BackupInfo
};
use log::{error, info};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use webui_rs::webui;

lazy_static::lazy_static! {
    static ref DB_INSTANCE: Mutex<Option<Arc<Database>>> = Mutex::new(None);
    static ref DB_SERVICE: Mutex<Option<Arc<DatabaseManagementService>>> = Mutex::new(None);
}

/// Initialize database management handlers
pub fn init_database_management(db: Arc<Database>, db_path: String) {
    let mut db_instance = DB_INSTANCE.lock().unwrap();
    *db_instance = Some(Arc::clone(&db));
    
    let service = Arc::new(DatabaseManagementService::new(db, db_path));
    let mut db_service = DB_SERVICE.lock().unwrap();
    *db_service = Some(service);
    
    info!("Database management handlers initialized");
}

fn get_db_service() -> Option<Arc<DatabaseManagementService>> {
    DB_SERVICE.lock().unwrap().clone()
}

/// Send a success response to the frontend
fn send_success_response<T: Serialize>(window: webui::Window, event_name: &str, data: T) {
    let response = crate::core::infrastructure::database::models::ApiResponse::success(data);
    dispatch_event(window, event_name, &response);
}

/// Send an error response to the frontend
fn send_error_response(window: webui::Window, event_name: &str, err: &AppError) {
    let error_data = err_to_error_data(err);
    let response = crate::core::infrastructure::database::models::ApiResponse::<serde_json::Value>::error(error_data);
    dispatch_event(window, event_name, &response);
}

/// Convert AppError to ErrorData
fn err_to_error_data(err: &AppError) -> crate::core::infrastructure::database::models::ErrorData {
    let error_value = err.to_value();
    crate::core::infrastructure::database::models::ErrorData::new(
        &format!("{:?}", error_value.code),
        &error_value.message,
    )
    .with_field(error_value.field.as_deref().unwrap_or(""))
    .with_context("cause", error_value.cause.as_deref().unwrap_or(""))
}

/// Helper to dispatch a custom event to the frontend
fn dispatch_event<T: Serialize>(window: webui::Window, event_name: &str, detail: &T) {
    let js = format!(
        "window.dispatchEvent(new CustomEvent('{}', {{ detail: {} }}))",
        event_name,
        serde_json::to_string(detail).unwrap_or_else(|_| "{}".to_string())
    );
    webui::Window::from_id(window.id).run_js(&js);
}

/// Handle database operation result
fn handle_result<T: Serialize, F: FnOnce() -> Result<T, AppError>>(
    window: webui::Window,
    event_name: &str,
    operation: F,
) {
    match operation() {
        Ok(data) => send_success_response(window, event_name, data),
        Err(e) => {
            error!("Operation failed: {}", e);
            send_error_response(window, event_name, &e);
        }
    }
}

/// Backup information for frontend
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BackupInfoDto {
    pub path: String,
    pub size: u64,
    pub created: u64,
    pub modified: u64,
    pub modified_formatted: String,
}

impl From<BackupInfo> for BackupInfoDto {
    fn from(info: BackupInfo) -> Self {
        use chrono::DateTime;
        let modified_formatted = DateTime::from_timestamp(info.modified as i64, 0)
            .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
            .unwrap_or_else(|| "Unknown".to_string());
        
        Self {
            path: info.path,
            size: info.size,
            created: info.created,
            modified: info.modified,
            modified_formatted,
        }
    }
}

/// Database management API response
#[derive(Debug, Serialize, Deserialize)]
pub struct DbManagementResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T: Serialize> DbManagementResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message),
        }
    }
}

/// Setup database management handlers
pub fn setup_db_management_handlers(window: &mut webui::Window) {
    // Get database information
    window.bind("getDatabaseInfo", |event| {
        info!("getDatabaseInfo: Fetching database information");
        let window = event.get_window();
        
        handle_result(window, "db_info_response", || {
            let Some(service) = get_db_service() else {
                return Err(AppError::DependencyInjection(
                    ErrorValue::new(ErrorCode::InternalError, "Database service not initialized")
                ));
            };
            
            let info = service.get_database_info()?;
            Ok(DbManagementResponse::success(DbInfoDto::from(info)))
        });
    });

    // Create database backup
    window.bind("createBackup", |event| {
        info!("createBackup: Creating database backup");
        let window = event.get_window();
        
        handle_result(window, "backup_response", || {
            let Some(service) = get_db_service() else {
                return Err(AppError::DependencyInjection(
                    ErrorValue::new(ErrorCode::InternalError, "Database service not initialized")
                ));
            };
            
            let backup_path = service.create_backup()?;
            Ok(DbManagementResponse::success(serde_json::json!({
                "backup_path": backup_path,
                "message": "Backup created successfully"
            })))
        });
    });

    // List available backups
    window.bind("listBackups", |event| {
        info!("listBackups: Listing available backups");
        let window = event.get_window();
        
        handle_result(window, "backups_response", || {
            let Some(service) = get_db_service() else {
                return Err(AppError::DependencyInjection(
                    ErrorValue::new(ErrorCode::InternalError, "Database service not initialized")
                ));
            };
            
            let backups = service.list_backups()?;
            let backup_dtos: Vec<BackupInfoDto> = backups.into_iter().map(Into::into).collect();
            Ok(DbManagementResponse::success(backup_dtos))
        });
    });

    // Restore from backup
    window.bind("restoreBackup", |event| {
        info!("restoreBackup: Restoring from backup");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        
        let parts: Vec<&str> = element_name.split(':').collect();
        let backup_path = parts.get(1).copied().unwrap_or("");
        
        handle_result(window, "backup_response", || {
            if backup_path.is_empty() {
                return Err(AppError::Validation(
                    ErrorValue::new(ErrorCode::ValidationFailed, "Backup path is required")
                        .with_field("backup_path")
                ));
            }
            
            let Some(service) = get_db_service() else {
                return Err(AppError::DependencyInjection(
                    ErrorValue::new(ErrorCode::InternalError, "Database service not initialized")
                ));
            };
            
            service.restore_from_backup(backup_path)?;
            Ok(DbManagementResponse::success(serde_json::json!({
                "message": "Database restored successfully"
            })))
        });
    });

    // Verify database integrity
    window.bind("verifyDatabaseIntegrity", |event| {
        info!("verifyDatabaseIntegrity: Verifying database integrity");
        let window = event.get_window();
        
        handle_result(window, "integrity_response", || {
            let Some(service) = get_db_service() else {
                return Err(AppError::DependencyInjection(
                    ErrorValue::new(ErrorCode::InternalError, "Database service not initialized")
                ));
            };
            
            let integrity = service.verify_integrity()?;
            Ok(DbManagementResponse::success(IntegrityDto::from(integrity)))
        });
    });

    // Cleanup old backups
    window.bind("cleanupOldBackups", |event| {
        info!("cleanupOldBackups: Cleaning up old backups");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        
        let parts: Vec<&str> = element_name.split(':').collect();
        let keep_count: usize = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(5);
        
        handle_result(window, "backup_response", || {
            let Some(service) = get_db_service() else {
                return Err(AppError::DependencyInjection(
                    ErrorValue::new(ErrorCode::InternalError, "Database service not initialized")
                ));
            };
            
            let deleted = service.cleanup_old_backups(keep_count)?;
            Ok(DbManagementResponse::success(serde_json::json!({
                "deleted_count": deleted,
                "message": format!("Deleted {} old backup(s)", deleted)
            })))
        });
    });

    info!("Database management handlers configured");
}

/// Database information DTO for frontend
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DbInfoDto {
    pub path: String,
    pub size: u64,
    pub size_formatted: String,
    pub created: u64,
    pub modified: u64,
    pub user_count: i64,
    pub product_count: i64,
    pub order_count: i64,
    pub backup_count: usize,
    pub is_persistent: bool,
}

impl From<DatabaseInfo> for DbInfoDto {
    fn from(info: DatabaseInfo) -> Self {
        Self {
            path: info.path.clone(),
            size: info.size,
            size_formatted: format_size(info.size),
            created: info.created,
            modified: info.modified,
            user_count: info.user_count,
            product_count: info.product_count,
            order_count: info.order_count,
            backup_count: info.backup_count,
            is_persistent: true, // SQLite is always persistent
        }
    }
}

/// Integrity check result DTO
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IntegrityDto {
    pub is_valid: bool,
    pub message: String,
    pub last_verified: u64,
    pub last_verified_formatted: String,
}

impl From<DatabaseIntegrity> for IntegrityDto {
    fn from(integrity: DatabaseIntegrity) -> Self {
        use chrono::DateTime;
        let last_verified_formatted = DateTime::from_timestamp(integrity.last_verified as i64, 0)
            .map(|dt| dt.format("%Y-%m-%d %H:%M:%S").to_string())
            .unwrap_or_else(|| "Unknown".to_string());
        
        Self {
            is_valid: integrity.is_valid,
            message: integrity.message,
            last_verified: integrity.last_verified,
            last_verified_formatted,
        }
    }
}

/// Format file size in human-readable format
fn format_size(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.2} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.2} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} bytes", bytes)
    }
}
