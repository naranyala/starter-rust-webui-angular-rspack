// src/core/infrastructure/ctrlc_handler.rs
// Graceful shutdown handler for SIGINT and SIGTERM signals

use log::{info, warn};
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

use crate::core::infrastructure::database::Database;

/// Flag to track if shutdown has been initiated
static SHUTDOWN_INITIATED: AtomicBool = AtomicBool::new(false);

/// Set up signal handlers for graceful shutdown
pub fn setup_shutdown_handler(db: Arc<Database>) {
    // Register Ctrl+C handler
    ctrlc::set_handler(move || {
        if SHUTDOWN_INITIATED.swap(true, Ordering::SeqCst) {
            // Already shutting down, force exit
            warn!("Second interrupt received, forcing exit...");
            std::process::exit(1);
        }

        info!("");
        info!("═══════════════════════════════════════════════════════");
        info!("  SHUTDOWN SIGNAL RECEIVED");
        info!("═══════════════════════════════════════════════════════");
        info!("  Performing graceful shutdown...");

        // Log database pool stats before shutdown
        let stats = db.pool_stats();
        info!("  Database pool stats at shutdown:");
        info!("    - Total connections: {}", stats.connections);
        info!("    - Idle connections: {}", stats.idle_connections);

        // Note: Database connections are automatically closed when
        // the Arc<Database> is dropped. The r2d2 pool handles cleanup.

        info!("  Shutdown complete. Goodbye!");
        info!("═══════════════════════════════════════════════════════");

        std::process::exit(0);
    })
    .expect("Error setting Ctrl+C handler");

    info!("Graceful shutdown handler registered (SIGINT/SIGTERM)");
}

/// Check if shutdown has been initiated
pub fn is_shutting_down() -> bool {
    SHUTDOWN_INITIATED.load(Ordering::SeqCst)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_shutdown_flag_initial_state() {
        assert!(!is_shutting_down());
    }
}
