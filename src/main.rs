//! Rust WebUI Application — Entry Point
//!
//! This file is intentionally thin. All orchestration lives in `src/app/`.
//!
//! Architecture: Service-oriented with typed DI (ServiceRegistry).
//! No DDD layers — services own business logic and database access.

// Binary application: many functions called dynamically via window.bind().
#![allow(dead_code)]

mod app;
mod core;

fn main() {
    // 1. Bootstrap: error handling, config, logging
    let bootstrap = match app::bootstrap::run() {
        Ok(b) => b,
        Err(e) => {
            eprintln!("Bootstrap failed: {}", e);
            std::process::exit(1);
        }
    };

    // 2. Startup: database, sample data, service registration
    let startup = match app::startup::run(&bootstrap) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("Startup failed: {}", e);
            std::process::exit(1);
        }
    };

    // 3. Runtime: window creation, handler registration, event loop
    if let Err(e) = app::runtime::run(&startup) {
        eprintln!("Runtime error: {}", e);
        std::process::exit(1);
    }
}
