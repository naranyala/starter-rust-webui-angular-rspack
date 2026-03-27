// src/core/infrastructure/database/mod.rs
// Database module - SQLite with connection pooling

pub mod connection;
pub mod models;
pub mod users;
pub mod products;
pub mod orders;

pub use connection::Database;
