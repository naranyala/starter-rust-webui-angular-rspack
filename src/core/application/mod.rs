//! Application Layer - Use Cases and Business Logic
//!
//! This layer contains the application's business logic and use cases.
//! It orchestrates the domain entities and infrastructure services to
//! implement specific application features.
//!
//! # Structure
//!
//! - `services` - Business logic services (UserService, ProductService, etc.)
//! - `handlers` - WebUI event handlers that delegate to services

pub mod handlers;
pub mod services;
