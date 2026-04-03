// WebUI Router
// Centralized handler registration.
// All bindings go through the ServiceRegistry.

use std::sync::Arc;
use webui_rs::webui;

use crate::core::presentation::webui::handlers::{
    db_handlers, db_management_handlers, error_handlers, event_bus_handlers,
    logging_handlers, sysinfo_handlers, ui_handlers, window_state_handler,
};
use crate::core::service_registry::ServiceRegistry;

/// Register every handler with the WebUI window.
pub fn register_all(window: &mut webui::Window, _registry: &Arc<ServiceRegistry>) {
    ui_handlers::setup_ui_handlers(window);
    ui_handlers::setup_counter_handlers(window);
    db_handlers::setup_db_handlers(window);
    db_management_handlers::setup_db_management_handlers(window);
    sysinfo_handlers::setup_sysinfo_handlers(window);
    logging_handlers::setup_logging_handlers(window);
    event_bus_handlers::setup_event_bus_handlers(window);
    window_state_handler::setup_window_state_handlers(window);
    error_handlers::setup_error_handlers(window);
    error_handlers::setup_devtools_handlers(window);
}
