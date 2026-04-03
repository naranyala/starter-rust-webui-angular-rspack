//! Services — rich business logic layer.
//! Each service owns a Database connection and provides validated CRUD + queries.

pub mod analytics_service;
pub mod order_service;
pub mod product_service;
pub mod sysinfo_service;
pub mod user_service;

pub use analytics_service::AnalyticsService;
pub use order_service::OrderService;
pub use product_service::ProductService;
pub use sysinfo_service::SysInfoService;
pub use user_service::UserService;
