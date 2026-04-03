// Startup Phase
// Initializes database, seeds sample data, builds ServiceRegistry.

use log::{error, info};
use std::sync::Arc;

use crate::app::bootstrap::Bootstrap;
use crate::core::errors::{AppResult, AppError, ErrorValue, ErrorCode};
use crate::core::infrastructure::error_handler;
use crate::core::database::Database;
use crate::core::service_registry::{self, ServiceRegistry};

pub struct Startup {
    pub registry: Arc<ServiceRegistry>,
}

pub fn run(bootstrap: &Bootstrap) -> AppResult<Startup> {
    let config = &bootstrap.config;
    let db_path = config.get_db_path();
    info!("Database path: {}", db_path);

    let db = match Database::new(db_path) {
        Ok(db) => {
            info!("Database connection pool initialized");
            if let Err(e) = db.init() {
                let err = AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed,
                        format!("Failed to initialize database schema: {}", e)),
                );
                error_handler::record_app_error("STARTUP", &err);
                return Err(err);
            }

            seed_sample_data(&db, config);

            let stats = db.pool_stats();
            info!("Database pool: connections={}, idle={}", stats.connections, stats.idle_connections);
            Arc::new(db)
        }
        Err(e) => {
            error_handler::record_app_error("STARTUP", &e);
            error!("Failed to initialize database: {}", e);
            return Err(e);
        }
    };

    // Build the typed ServiceRegistry — all services are wired here once
    let registry = ServiceRegistry::new(config.clone(), db);
    service_registry::init_registry(registry).map_err(|e| {
        AppError::Configuration(
            ErrorValue::new(ErrorCode::InternalError, format!("Failed to init registry: {:?}", e)),
        )
    })?;
    info!("ServiceRegistry initialized");

    let registry = service_registry::get_registry();
    Ok(Startup { registry })
}

fn seed_sample_data(db: &Database, config: &crate::core::infrastructure::config::AppConfig) {
    if !config.should_create_sample_data() {
        return;
    }
    if let Ok(inserted) = db.insert_sample_data_if_empty() {
        if inserted { info!("Sample users created"); }
    }
    if let Ok(inserted) = db.insert_sample_products_if_empty() {
        if inserted { info!("Sample products created"); }
    }
    if let Ok(inserted) = db.insert_sample_orders_if_empty() {
        if inserted { info!("Sample orders created"); }
    }
}
