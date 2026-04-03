//! Database Management WebUI Handlers
//!
//! Uses ServiceRegistry directly — no separate global state.

use crate::core::errors::{AppError, ErrorCode, ErrorValue};
use crate::core::infrastructure::database::{BackupInfo, DatabaseInfo, DatabaseIntegrity};
use crate::core::presentation::webui::handler_utils;
use crate::core::service_registry;
use chrono::DateTime;
use log::info;
use serde::{Deserialize, Serialize};
use webui_rs::webui;

// ─── DTOs ───────────────────────────────────────────────────────────────────

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

#[derive(Debug, Serialize, Deserialize)]
pub struct DbManagementResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T: Serialize> DbManagementResponse<T> {
    pub fn success(data: T) -> Self {
        Self { success: true, data: Some(data), error: None }
    }
    pub fn error(message: String) -> Self {
        Self { success: false, data: None, error: Some(message) }
    }
}

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
            is_persistent: true,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IntegrityDto {
    pub is_valid: bool,
    pub message: String,
    pub last_verified: u64,
    pub last_verified_formatted: String,
}

impl From<DatabaseIntegrity> for IntegrityDto {
    fn from(integrity: DatabaseIntegrity) -> Self {
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

// ─── Handlers ───────────────────────────────────────────────────────────────

pub fn setup_db_management_handlers(window: &mut webui::Window) {
    window.bind("getDatabaseInfo", |event| {
        info!("getDatabaseInfo: Fetching database information");
        let window = event.get_window();
        handler_utils::handle_result(window, "db_info_response", "getDatabaseInfo", || {
            let svc = &service_registry::get_registry().db_management;
            svc.get_database_info()
                .map(|info| DbManagementResponse::success(DbInfoDto::from(info)))
        });
    });

    window.bind("createBackup", |event| {
        info!("createBackup: Creating database backup");
        let window = event.get_window();
        handler_utils::handle_result(window, "backup_response", "createBackup", || {
            let svc = &service_registry::get_registry().db_management;
            svc.create_backup()
                .map(|path| DbManagementResponse::success(serde_json::json!({
                    "backup_path": path,
                    "message": "Backup created successfully"
                })))
        });
    });

    window.bind("listBackups", |event| {
        info!("listBackups: Listing available backups");
        let window = event.get_window();
        handler_utils::handle_result(window, "backups_response", "listBackups", || {
            let svc = &service_registry::get_registry().db_management;
            svc.list_backups()
                .map(|backups| DbManagementResponse::success(
                    backups.into_iter().map(BackupInfoDto::from).collect::<Vec<_>>(),
                ))
        });
    });

    window.bind("restoreBackup", |event| {
        info!("restoreBackup: Restoring from backup");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let backup_path = parts.get(1).copied().unwrap_or("");

        handler_utils::handle_result(window, "backup_response", "restoreBackup", || {
            if backup_path.is_empty() {
                return Err(AppError::Validation(
                    ErrorValue::new(ErrorCode::ValidationFailed, "Backup path is required")
                        .with_field("backup_path"),
                ));
            }
            let svc = &service_registry::get_registry().db_management;
            svc.restore_from_backup(backup_path)
                .map(|()| DbManagementResponse::success(serde_json::json!({
                    "message": "Database restored successfully"
                })))
        });
    });

    window.bind("verifyDatabaseIntegrity", |event| {
        info!("verifyDatabaseIntegrity: Verifying database integrity");
        let window = event.get_window();
        handler_utils::handle_result(window, "integrity_response", "verifyDatabaseIntegrity", || {
            let svc = &service_registry::get_registry().db_management;
            svc.verify_integrity()
                .map(|integrity| DbManagementResponse::success(IntegrityDto::from(integrity)))
        });
    });

    window.bind("cleanupOldBackups", |event| {
        info!("cleanupOldBackups: Cleaning up old backups");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let keep_count: usize = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(5);

        handler_utils::handle_result(window, "backup_response", "cleanupOldBackups", || {
            let svc = &service_registry::get_registry().db_management;
            svc.cleanup_old_backups(keep_count)
                .map(|deleted| DbManagementResponse::success(serde_json::json!({
                    "deleted_count": deleted,
                    "message": format!("Deleted {} old backup(s)", deleted)
                })))
        });
    });

    info!("Database management handlers configured");
}
