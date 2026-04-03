//! Database Module - SQLite with Connection Pooling
//!
//! This module provides persistent database storage with:
//! - Connection pooling for performance
//! - Transaction support for data integrity
//! - Backup and restore capabilities
//! - Data persistence (data is NOT deleted on restart)
//!
//! # Data Persistence
//!
//! All data stored in SQLite is persistent and will survive application restarts.
//! Sample data is only inserted on first run (when database is empty).
//! Users must explicitly delete data through the UI.
//!
//! # Modules
//!
//! - `connection` - Database connection management
//! - `models` - Data models and DTOs
//! - `users` - User CRUD operations
//! - `products` - Product CRUD operations
//! - `orders` - Order CRUD operations
//! - `management` - Database management (backup, restore, integrity)

pub mod connection;
pub mod management;
pub mod models;
pub mod orders;
pub mod products;
pub mod users;

pub use connection::Database;
pub use management::{BackupInfo, DatabaseInfo, DatabaseIntegrity, DatabaseManagementService};
