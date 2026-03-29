// src/core/infrastructure/database/mod.rs
// Database module - SQLite with connection pooling
// Repository traits are implemented in repositories.rs

pub mod connection;
pub mod models;
pub mod orders;
pub mod products;
pub mod repositories;
pub mod users;

pub use connection::Database;
pub use repositories::FileConfigRepository;
