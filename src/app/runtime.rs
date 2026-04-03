// Runtime Phase
// Creates the WebUI window, registers handlers, serves frontend, enters event loop.

use log::{error, info, warn};
use std::ffi::CString;
use std::fs;
use std::net::TcpListener;
use std::path::PathBuf;
use std::sync::Arc;
use webui_rs::webui;
use webui_rs::webui::bindgen::webui_set_port;

use crate::app::startup::Startup;
use crate::core::errors::{AppError, AppResult, ErrorCode, ErrorValue};
use crate::core::infrastructure::ctrlc_handler;
use crate::core::infrastructure::error_handler;
use crate::core::presentation::webui::router;

include!(concat!(env!("OUT_DIR"), "/embedded_frontend.rs"));

pub fn run(startup: &Startup) -> AppResult<()> {
    let registry = &startup.registry;
    let config = &registry.config;

    let mut my_window = webui::Window::new();

    let (port_ok, port) = resolve_webui_port(&mut my_window);
    if port_ok {
        info!("WebUI port set to {}", port);
    } else {
        info!("WebUI port not set, using default");
    }

    // Register ALL handlers through the centralized router
    router::register_all(&mut my_window, registry);

    let window_title = config.get_window_title();
    info!("Window title: {}", window_title);

    let (dist_dir, index_path) = match resolve_frontend_dist() {
        Some(paths) => paths,
        None => {
            error!("Could not locate frontend dist/index.html");
            error!("Run `./run.sh --build-frontend` and ensure dist/index.html exists.");
            return Err(AppError::Configuration(
                ErrorValue::new(
                    ErrorCode::ConfigNotFound,
                    "Frontend dist directory not found. Run ./run.sh --build-frontend.",
                ),
            ));
        }
    };

    let root_folder = dist_dir.to_str().unwrap_or("dist");
    info!("Setting WebUI root folder to: {}", root_folder);

    let c_string = CString::new(root_folder).map_err(|e| {
        AppError::Serialization(
            ErrorValue::new(
                ErrorCode::SerializationFailed,
                format!("Failed to create CString for root folder: {}", e),
            ),
        )
    })?;

    unsafe {
        webui_rs::webui::bindgen::webui_set_root_folder(my_window.id, c_string.as_ptr());
    }

    info!("Loading UI from {}", index_path.display());
    my_window.show("index.html");

    if port_ok {
        let js = format!(
            "window.__WEBUI_PORT = {0}; window.dispatchEvent(new CustomEvent('webui:port', {{ detail: {{ port: {0} }} }}));",
            port
        );
        my_window.run_js(&js);
    }

    info!("Application started, waiting for events...");
    info!("=============================================");

    ctrlc_handler::setup_shutdown_handler(Arc::clone(&registry.database));

    webui::wait();

    error_handler::print_error_summary();
    info!("Application shutting down...");
    info!("=============================================");

    Ok(())
}

fn resolve_webui_port(window: &mut webui::Window) -> (bool, u16) {
    let port = TcpListener::bind("127.0.0.1:0")
        .ok()
        .and_then(|listener| listener.local_addr().ok())
        .map(|addr| addr.port());
    let port_ok = port
        .map(|p| unsafe { webui_set_port(window.id, p as usize) })
        .unwrap_or(false);
    (port_ok, port.unwrap_or(0))
}

fn resolve_frontend_dist() -> Option<(PathBuf, PathBuf)> {
    let mut candidates: Vec<PathBuf> = Vec::new();

    if let Ok(custom_dist) = std::env::var("RUSTWEBUI_DIST_DIR") {
        candidates.push(PathBuf::from(custom_dist));
    }

    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            candidates.push(exe_dir.join("dist"));
            candidates.push(exe_dir.join("dist").join("browser"));
            if let Some(target_dir) = exe_dir.parent() {
                candidates.push(target_dir.join("dist"));
                candidates.push(target_dir.join("dist").join("browser"));
            }
        }
    }

    candidates.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("dist"));
    candidates.push(
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("dist").join("browser"),
    );

    if let Ok(cwd) = std::env::current_dir() {
        candidates.push(cwd.join("dist"));
        candidates.push(cwd.join("dist").join("browser"));
    }

    for dist_dir in candidates {
        let index_path = dist_dir.join("index.html");
        if index_path.exists() {
            info!("Resolved frontend dist: {}", dist_dir.display());
            return Some((dist_dir, index_path));
        }
    }

    materialize_embedded_frontend_dist()
}

fn materialize_embedded_frontend_dist() -> Option<(PathBuf, PathBuf)> {
    if !EMBEDDED_FRONTEND_AVAILABLE {
        warn!("Embedded frontend assets unavailable");
        return None;
    }

    let base = std::env::temp_dir().join(format!("rustwebui-embedded-{}", std::process::id()));
    let dist_dir = base.join("dist");
    let js_dir = dist_dir.join("static").join("js");

    if let Err(e) = fs::create_dir_all(&js_dir) {
        warn!("Failed to create embedded dist directory: {}", e);
        return None;
    }

    let writes = [
        (dist_dir.join("index.html"), EMBEDDED_INDEX_HTML),
        (js_dir.join("main.js"), EMBEDDED_MAIN_JS),
        (js_dir.join("winbox.min.js"), EMBEDDED_WINBOX_JS),
        (js_dir.join("webui.js"), EMBEDDED_WEBUI_JS),
    ];

    for (path, contents) in writes {
        if let Err(e) = fs::write(&path, contents) {
            warn!("Failed to write embedded asset {}: {}", path.display(), e);
            return None;
        }
    }

    Some((dist_dir.clone(), dist_dir.join("index.html")))
}
