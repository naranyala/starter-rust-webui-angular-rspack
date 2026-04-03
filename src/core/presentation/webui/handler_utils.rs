//! WebUI Handler Utilities — shared helpers for all handler modules.
//!
//! Extracted to eliminate copy-paste duplication across handler files:
//! - `send_success_response`, `send_error_response`, `err_to_error_data`
//! - `dispatch_event`, `handle_result`, `parse_params`
//! - `read_event_payload` (safe FFI wrapper)

use crate::core::errors::AppError;
use crate::core::infrastructure::database::models::{ApiResponse, ErrorData};
use crate::core::infrastructure::error_handler;
use log::error;
use std::ffi::CStr;
use webui_rs::webui;

// ─── Response Helpers ───────────────────────────────────────────────────────

/// Send a success JSON response to the frontend.
pub fn send_success_response<T: serde::Serialize>(
    window: webui::Window,
    event_name: &str,
    data: T,
) {
    dispatch_event(window, event_name, &ApiResponse::success(data));
}

/// Send an error response to the frontend.
pub fn send_error_response(window: webui::Window, event_name: &str, err: &AppError) {
    dispatch_event(window, event_name, &ApiResponse::<serde_json::Value>::error(err_to_error_data(err)));
}

/// Convert AppError to ErrorData for API responses.
pub fn err_to_error_data(err: &AppError) -> ErrorData {
    let ev = err.to_value();
    ErrorData::new(&format!("{:?}", ev.code), &ev.message)
        .with_field(ev.field.as_deref().unwrap_or(""))
        .with_context("cause", ev.cause.as_deref().unwrap_or(""))
}

// ─── Event Dispatch ─────────────────────────────────────────────────────────

/// Dispatch a JSON-serializable custom event to the frontend.
pub fn dispatch_event<T: serde::Serialize>(window: webui::Window, event_name: &str, detail: &T) {
    let js = format!(
        "window.dispatchEvent(new CustomEvent('{}', {{ detail: {} }}))",
        event_name,
        serde_json::to_string(detail).unwrap_or_else(|_| "{}".to_string()),
    );
    webui::Window::from_id(window.id).run_js(&js);
}

// ─── Result Handling ────────────────────────────────────────────────────────

/// Execute an operation and dispatch success/error to frontend.
pub fn handle_result<T: serde::Serialize, F: FnOnce() -> Result<T, AppError>>(
    window: webui::Window,
    event_name: &str,
    source_label: &'static str,
    operation: F,
) {
    match operation() {
        Ok(data) => send_success_response(window, event_name, data),
        Err(e) => {
            error!("{} failed: {}", source_label, e);
            error_handler::record_app_error(source_label, &e);
            send_error_response(window, event_name, &e);
        }
    }
}

// ─── Parameter Parsing ──────────────────────────────────────────────────────

/// Split colon-delimited element name into parts.
/// E.g. "createUser:John:john@example.com:User:Active" → ["createUser", "John", ...]
pub fn parse_params(element_name: &str) -> Vec<&str> {
    element_name.split(':').collect()
}

// ─── FFI Helpers ────────────────────────────────────────────────────────────

/// Safely read the element name from a WebUI event.
/// Wraps the unsafe `CStr::from_ptr(event.element)` call.
pub fn element_name(event: &webui_rs::webui::Event) -> String {
    // SAFETY: `event.element` is guaranteed to be a valid, null-terminated
    // C string pointer by the WebUI FFI contract for all bound event handlers.
    unsafe {
        CStr::from_ptr(event.element)
            .to_string_lossy()
            .into_owned()
    }
}

/// Read a JSON payload from a WebUI event (for events that pass a string arg).
///
/// # Safety
/// The WebUI runtime guarantees that the string pointer for event argument 0
/// is valid and null-terminated when this handler is invoked.
pub fn read_event_payload(event: &webui_rs::webui::Event) -> Option<String> {
    let ptr = unsafe {
        webui_rs::webui::bindgen::webui_interface_get_string_at(event.window, event.event_number, 0)
    };
    if ptr.is_null() {
        return None;
    }
    // SAFETY: ptr is valid (checked above) and points to a null-terminated C string.
    Some(unsafe { CStr::from_ptr(ptr).to_string_lossy().into_owned() })
}
