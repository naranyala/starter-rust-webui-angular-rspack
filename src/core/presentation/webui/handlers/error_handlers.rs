//! Error & DevTools WebUI Handlers
//!
//! Uses ServiceRegistry for database monitoring — no separate global state.

use crate::core::errors::ErrorCode;
use crate::core::infrastructure::error_handler;
use crate::core::presentation::webui::handler_utils;
use crate::core::service_registry;
use log::info;
use webui_rs::webui;

pub fn setup_error_handlers(window: &mut webui::Window) {
    window.bind("get_error_stats", |_event| {
        info!("get_error_stats called from frontend");
        let summary = error_handler::get_error_tracker().get_summary();
        let response = serde_json::json!({
            "total": summary.total,
            "errors": summary.errors,
            "warnings": summary.warnings,
            "critical": summary.critical,
        });
        handler_utils::dispatch_event(
            webui::Window::from_id(_event.get_window().id),
            "error_stats_response",
            &response,
        );
    });

    window.bind("get_recent_errors", |event| {
        info!("get_recent_errors called from frontend");
        let element_name = handler_utils::element_name(&event);
        let limit: usize = element_name
            .split(':')
            .nth(1)
            .and_then(|s| s.parse().ok())
            .unwrap_or(10);

        let errors = error_handler::get_error_tracker().get_recent(limit);
        let errors_json: Vec<serde_json::Value> = errors
            .iter()
            .map(|e| {
                serde_json::json!({
                    "id": e.id,
                    "timestamp": e.timestamp,
                    "severity": format!("{:?}", e.severity),
                    "source": e.source,
                    "code": format!("{:?}", e.code),
                    "message": e.message,
                    "details": e.details,
                    "context": e.context.iter().cloned().collect::<std::collections::HashMap<_, _>>(),
                })
            })
            .collect();

        handler_utils::dispatch_event(
            webui::Window::from_id(event.get_window().id),
            "recent_errors_response",
            &serde_json::json!({ "errors": errors_json, "count": errors.len() }),
        );
    });

    window.bind("clear_error_history", |_event| {
        info!("clear_error_history called from frontend");
        error_handler::get_error_tracker().clear();
        handler_utils::dispatch_event(
            webui::Window::from_id(_event.get_window().id),
            "error_history_cleared",
            &serde_json::json!({ "success": true, "message": "Error history cleared" }),
        );
    });

    info!("Error handlers set up successfully");
}

pub fn setup_db_monitoring_handlers(window: &mut webui::Window) {
    window.bind("get_db_pool_stats", |_event| {
        info!("get_db_pool_stats called from frontend");
        let db = &service_registry::get_registry().database;
        let stats = db.pool_stats();
        let response = serde_json::json!({
            "connections": stats.connections,
            "idle_connections": stats.idle_connections,
            "utilization": stats.utilization(),
        });
        handler_utils::dispatch_event(
            webui::Window::from_id(_event.get_window().id),
            "db_pool_stats_response",
            &response,
        );
    });
    info!("Database monitoring handlers set up");
}

pub fn setup_devtools_handlers(window: &mut webui::Window) {
    window.bind("get_backend_stats", |_event| {
        info!("get_backend_stats called from frontend");
        handler_utils::dispatch_event(
            webui::Window::from_id(_event.get_window().id),
            "backend_stats_response",
            &serde_json::json!({ "uptime": 0 }),
        );
    });

    window.bind("get_backend_logs", |event| {
        info!("get_backend_logs called from frontend");
        let element_name = handler_utils::element_name(&event);
        let limit: usize = element_name
            .split(':')
            .nth(1)
            .and_then(|s| s.parse().ok())
            .unwrap_or(20);

        let errors = error_handler::get_error_tracker().get_recent(limit);
        let logs: Vec<serde_json::Value> = errors
            .iter()
            .map(|e| {
                serde_json::json!({
                    "timestamp": e.timestamp,
                    "level": match e.severity {
                        error_handler::ErrorSeverity::Critical | error_handler::ErrorSeverity::Error => "error",
                        error_handler::ErrorSeverity::Warning => "warn",
                        error_handler::ErrorSeverity::Info => "info",
                    },
                    "source": e.source,
                    "message": e.message,
                    "context": e.context.iter().cloned().collect::<std::collections::HashMap<_, _>>(),
                })
            })
            .collect();

        handler_utils::dispatch_event(
            webui::Window::from_id(event.get_window().id),
            "backend_logs_response",
            &serde_json::json!({ "logs": logs, "count": logs.len() }),
        );
    });

    window.bind("create_backend_error", |_event| {
        info!("create_backend_error called from frontend - generating test error");
        let test_error = error_handler::ErrorEntry::new(
            error_handler::ErrorSeverity::Warning,
            "DEVTOOLS_TEST",
            ErrorCode::ValidationFailed,
            "This is a test error from DevTools".to_string(),
        )
        .with_details("Triggered via DevTools action".to_string());
        error_handler::get_error_tracker().record(test_error);
        handler_utils::dispatch_event(
            webui::Window::from_id(_event.get_window().id),
            "backend_test_error",
            &serde_json::json!({ "success": true, "message": "Test error created" }),
        );
    });

    info!("DevTools backend handlers set up");
}
