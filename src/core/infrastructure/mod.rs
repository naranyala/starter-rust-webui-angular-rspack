// Infrastructure services — pure plumbing (logging, error tracking, event bus, config, ctrlc).
// Business logic lives in core/services/.

pub mod config;
pub mod ctrlc_handler;
pub mod database;
pub mod di;
pub mod error_handler;
pub mod event_bus;
pub mod logging;
