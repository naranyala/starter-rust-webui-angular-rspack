//! ServiceRegistry — typed dependency injection.
//!
//! All services are constructed at startup and held here.
//! Handlers receive `Arc<ServiceRegistry>` and call services directly.
//! No type-erased HashMaps, no runtime resolution — pure compile-time safety.

use std::sync::Arc;

use crate::core::errors::AppResult;
use crate::core::services::{
    AnalyticsService, OrderService, ProductService, SysInfoService, UserService,
};
use crate::core::database::Database;
use crate::core::infrastructure::config::AppConfig;
use crate::core::infrastructure::database::DatabaseManagementService;

pub struct ServiceRegistry {
    pub config: Arc<AppConfig>,
    pub database: Arc<Database>,
    pub user_service: Arc<UserService>,
    pub product_service: Arc<ProductService>,
    pub order_service: Arc<OrderService>,
    pub analytics_service: Arc<AnalyticsService>,
    pub db_management: Arc<DatabaseManagementService>,
    pub sysinfo: Arc<SysInfoService>,
}

impl ServiceRegistry {
    /// Build the registry from a Database instance and config.
    pub fn new(config: AppConfig, database: Arc<Database>) -> Self {
        let config = Arc::new(config);
        let db_management = Arc::new(DatabaseManagementService::new(
            Arc::clone(&database),
            config.get_db_path().to_string(),
        ));

        let user_service = Arc::new(UserService::new(Arc::clone(&database)));
        let product_service = Arc::new(ProductService::new(Arc::clone(&database)));
        let order_service = Arc::new(OrderService::new(Arc::clone(&database), Arc::clone(&user_service), Arc::clone(&product_service)));

        Self {
            config,
            database: Arc::clone(&database),
            user_service,
            product_service,
            order_service,
            analytics_service: Arc::new(AnalyticsService::new(Arc::clone(&database))),
            db_management,
            sysinfo: Arc::new(SysInfoService),
        }
    }
}

/// Global singleton — set once during startup, read-only afterwards.
use std::sync::OnceLock;

static GLOBAL_REGISTRY: OnceLock<Arc<ServiceRegistry>> = OnceLock::new();

/// Initialize the global service registry.
pub fn init_registry(registry: ServiceRegistry) -> AppResult<()> {
    GLOBAL_REGISTRY
        .set(Arc::new(registry))
        .map_err(|_| {
            crate::core::errors::AppError::Configuration(
                crate::core::errors::ErrorValue::new(
                    crate::core::errors::ErrorCode::InternalError,
                    "ServiceRegistry already initialized",
                ),
            )
        })
}

/// Get the global registry. Panics if not yet initialized.
pub fn get_registry() -> Arc<ServiceRegistry> {
    GLOBAL_REGISTRY
        .get()
        .expect("ServiceRegistry not initialized. Call init_registry() first.")
        .clone()
}
