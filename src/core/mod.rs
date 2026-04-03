// src/core/mod.rs
// Service-oriented architecture — no DDD layers.
//
// Structure:
//   errors          — Error types (ErrorCode, ErrorValue, AppError)
//   models          — Data models (User, Product, Order, stats, API response)
//   config          — AppConfig (TOML configuration)
//   database        — Database connection pool + CRUD (infrastructure)
//   services        — Business logic (UserService, ProductService, etc.)
//   service_registry — Typed DI container
//   infrastructure  — Logging, error tracking, event bus, ctrlc handler
//   presentation    — WebUI handlers

pub mod errors;
pub mod infrastructure;
pub mod presentation;
pub mod service_registry;
pub mod services;

// Re-export database (connection pool + models + CRUD) from infrastructure
pub use infrastructure::database as database;
