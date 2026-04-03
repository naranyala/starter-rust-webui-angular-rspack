use log::{debug, error, info};
use serde::{Deserialize, Serialize};
use crate::core::presentation::webui::handler_utils;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WindowState {
    Focused,
    Blurred,
    Minimized,
    Maximized,
    Restored,
    Closed,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct WindowStateEvent {
    pub window_id: String,
    pub state: WindowState,
    pub title: String,
    pub timestamp: String,
}

pub fn setup_window_state_handlers(window: &mut webui_rs::webui::Window) {
    window.bind("window_state_change", |event| {
        let data = match handler_utils::read_event_payload(&event) {
            Some(payload) => payload,
            None => {
                error!("window_state_change missing payload");
                return;
            }
        };

        match serde_json::from_str::<WindowStateEvent>(&data) {
            Ok(event_data) => {
                let state_msg = match event_data.state {
                    WindowState::Focused => "focused (became active)",
                    WindowState::Blurred => "blurred (lost focus)",
                    WindowState::Minimized => "minimized",
                    WindowState::Maximized => "maximized",
                    WindowState::Restored => "restored",
                    WindowState::Closed => "closed",
                };

                info!(
                    "Window State Change | ID: {} | Title: '{}' | State: {} | Time: {}",
                    event_data.window_id, event_data.title, state_msg, event_data.timestamp
                );

                debug!("Full window state event: {:?}", event_data);
            }
            Err(e) => {
                error!("Failed to parse window state event: {}", e);
            }
        }
    });

    info!("Window state handlers initialized");
}
