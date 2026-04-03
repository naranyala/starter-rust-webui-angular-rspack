use log::{debug, error, info, warn};
use serde::{Deserialize, Serialize};
use crate::core::presentation::webui::handler_utils;

#[derive(Debug, Deserialize, Serialize)]
pub struct FrontendLogEntry {
    pub message: String,
    pub level: String,
    #[serde(default)]
    pub meta: serde_json::Value,
    #[serde(default)]
    pub category: String,
    #[serde(alias = "sessionId")]
    pub session_id: String,
    #[serde(alias = "frontendTimestamp")]
    pub frontend_timestamp: String,
}

pub fn setup_logging_handlers(window: &mut webui_rs::webui::Window) {
    window.bind("log_message", |event| {
        let data = match handler_utils::read_event_payload(&event) {
            Some(payload) => payload,
            None => {
                error!("log_message missing payload");
                return;
            }
        };

        match serde_json::from_str::<FrontendLogEntry>(&data) {
            Ok(entry) => {
                let _target = format!("frontend::{}", entry.category);
                let msg = format!("Session {}: {}", entry.session_id, entry.message);

                match entry.level.to_uppercase().as_str() {
                    "ERROR" => {
                        error!("{}", msg);
                        debug!("Frontend metadata: {:?}", entry.meta);
                    }
                    "WARN" => {
                        warn!("{}", msg);
                    }
                    "DEBUG" => {
                        debug!("{}", msg);
                    }
                    "TRACE" => {
                        debug!("TRACE {}", msg);
                    }
                    _ => {
                        info!("{}", msg);
                    }
                }
            }
            Err(e) => {
                error!("Failed to parse frontend log entry: {}", e);
            }
        }
    });

    window.bind("get_backend_logs", |_event| {
        info!("Frontend requested backend logs");
    });

    info!("Logging handlers initialized");
}
