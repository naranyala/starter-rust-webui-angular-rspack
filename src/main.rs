use log::{error, info, warn};
use std::fs;
use std::net::TcpListener;
use std::path::PathBuf;
use std::sync::Arc;
use webui_rs::webui;
use webui_rs::webui::bindgen::webui_set_port;

// MVVM: Core - Domain, Application, Infrastructure, Presentation
mod core;
use core::{
    error::ErrorCode,
    infrastructure::{config::AppConfig, ctrlc_handler, database::Database, di, error_handler, logging},
    presentation,
};

include!(concat!(env!("OUT_DIR"), "/embedded_frontend.rs"));

#[allow(unused_variables)]
fn main() {
    // Initialize enhanced error handling with panic hook
    error_handler::init_error_handling();

    // Initialize dependency injection container
    if let Err(e) = di::init_container() {
        eprintln!("Failed to initialize DI container: {}", e);
        error_handler::record_error(
            error_handler::ErrorSeverity::Critical,
            "MAIN",
            ErrorCode::InternalError,
            format!("Failed to initialize DI container: {}", e),
            None,
        );
        return;
    }
    info!("Dependency injection container initialized");

    let container = di::get_container();

    // Load application configuration
    let config = match AppConfig::load() {
        Ok(config) => {
            println!("Configuration loaded successfully!");
            println!(
                "Application: {} v{}",
                config.get_app_name(),
                config.get_version()
            );
            config
        }
        Err(e) => {
            eprintln!("Failed to load configuration: {}", e);
            eprintln!("Using default configuration");
            AppConfig::default()
        }
    };

    // Register configuration in the container
    if let Err(e) = container.register_singleton(config.clone()) {
        eprintln!("Failed to register config in DI container: {}", e);
        return;
    }

    // Initialize logging system with config settings
    if let Err(e) = logging::init_logging_with_config(
        Some(config.get_log_file()),
        config.get_log_level(),
        config.is_append_log(),
    ) {
        eprintln!("Failed to initialize logger: {}", e);
        return;
    }

    info!("=============================================");
    info!(
        "Starting: {} v{}",
        config.get_app_name(),
        config.get_version()
    );
    info!("=============================================");

    // Get communication settings from config
    let transport = config.get_transport();
    let serialization = config.get_serialization();

    // Display backend-frontend communication configuration
    info!("═══════════════════════════════════════════════════════");
    info!("  BACKEND-FRONTEND COMMUNICATION");
    info!("═══════════════════════════════════════════════════════");
    info!("");
    info!("  TRANSPORT LAYER:");
    info!("  ┌──────────────────┬────────────────────────────────┐");
    info!("  │ Option           │ Description                    │");
    info!("  ├──────────────────┼────────────────────────────────┤");
    let webview_active = if transport == "webview_ffi" {
        "✓ [ACTIVE]"
    } else {
        "  "
    };
    info!(
        "  │ webview_ffi      │ Native WebView binding{}    │",
        webview_active
    );
    let http_active = if transport == "http_rest" {
        "✓ [ACTIVE]"
    } else {
        "  "
    };
    info!(
        "  │ http_rest        │ HTTP/REST API{}             │",
        http_active
    );
    let ws_active = if transport == "websocket" {
        "✓ [ACTIVE]"
    } else {
        "  "
    };
    info!(
        "  │ websocket        │ WebSocket connection{}       │",
        ws_active
    );
    info!("  └──────────────────┴────────────────────────────────┘");
    info!("");
    info!("  SERIALIZATION FORMAT:");
    info!("  ┌──────────────┬────────┬────────┬─────────────────────┐");
    info!("  │ Format       │ Size   │ Speed  │ Description         │");
    info!("  ├──────────────┼────────┼────────┼─────────────────────┤");
    let json_active = if serialization == "json" {
        "✓ [ACTIVE]"
    } else {
        "   "
    };
    info!(
        "  │ JSON         │ 1.0x   │ 1.0x   │ Human readable{}    │",
        json_active
    );
    let msgpack_active = if serialization == "messagepack" {
        "✓ [ACTIVE]"
    } else {
        "   "
    };
    info!(
        "  │ MessagePack  │ ~0.7x  │ ~1.5x  │ Binary, compact{}   │",
        msgpack_active
    );
    let cbor_active = if serialization == "cbor" {
        "✓ [ACTIVE]"
    } else {
        "   "
    };
    info!(
        "  │ CBOR         │ ~0.6x  │ ~1.6x  │ RFC 7049{}          │",
        cbor_active
    );
    info!("  └──────────────┴────────┴────────┴─────────────────────┘");
    info!("");
    info!(
        "  SELECTED: {} + {}",
        match transport {
            "webview_ffi" => "WebView FFI (Native Binding)",
            "http_rest" => "HTTP/REST",
            "websocket" => "WebSocket",
            _ => "WebView FFI",
        },
        match serialization {
            "json" => "JSON (serde_json)",
            "messagepack" => "MessagePack (rmp-serde)",
            "cbor" => "CBOR (serde_cbor)",
            _ => "JSON",
        }
    );
    info!("");
    info!("  DATA FLOW:");
    match transport {
        "webview_ffi" => {
            info!(
                "    Frontend JS ──[{}]──> window.bind() ──> Rust Backend",
                serialization.to_uppercase()
            );
            info!(
                "    Rust Backend ─[{}]──> window.run_js() ──> Frontend JS",
                serialization.to_uppercase()
            );
        }
        "http_rest" => {
            info!("    Frontend JS ──[HTTP/JSON]──> REST API ──> Rust Backend");
            info!("    Rust Backend ─[HTTP/JSON]──> REST API ──> Frontend JS");
        }
        "websocket" => {
            info!("    Frontend JS ──[WS/JSON]──> WebSocket Server ──> Rust Backend");
            info!("    Rust Backend ─[WS/JSON]──> WebSocket Server ──> Frontend JS");
        }
        _ => {}
    }
    info!("═══════════════════════════════════════════════════════");

    info!("Application starting...");

    // Get database path from config
    let db_path = config.get_db_path();
    info!("Database path: {}", db_path);

    // Initialize SQLite database with connection pooling
    let db = match Database::new(db_path) {
        Ok(db) => {
            info!("Database connection pool initialized successfully");
            if let Err(e) = db.init() {
                error_handler::record_error(
                    error_handler::ErrorSeverity::Critical,
                    "MAIN",
                    ErrorCode::DbQueryFailed,
                    format!("Failed to initialize database schema: {}", e),
                    None,
                );
                return;
            }
            if config.should_create_sample_data() {
                // Seed sample users
                if let Err(e) = db.insert_sample_data() {
                    error_handler::record_app_error("MAIN", &e);
                }
                // Seed sample products
                if let Err(e) = db.insert_sample_products() {
                    error_handler::record_app_error("MAIN", &e);
                }
                // Seed sample orders
                if let Err(e) = db.insert_sample_orders() {
                    error_handler::record_app_error("MAIN", &e);
                }
                info!("Sample data created (users, products, orders)");
            }
            // Log pool stats
            let stats = db.pool_stats();
            info!(
                "Database pool stats: connections={}, idle={}",
                stats.connections, stats.idle_connections
            );
            Arc::new(db)
        }
        Err(e) => {
            error_handler::record_app_error("MAIN", &e);
            eprintln!("Failed to initialize database: {}", e);
            return;
        }
    };

    // Register database and repository services in the container
    if let Err(e) = di::register_infrastructure_services(Arc::clone(&db)) {
        eprintln!(
            "Failed to register infrastructure services in DI container: {}",
            e
        );
        return;
    }
    info!("Infrastructure services registered in DI container (Database, repositories)");

    // Initialize database handlers with the database instance
    presentation::db_handlers::init_database(Arc::clone(&db));
    presentation::error_handlers::init_database_monitoring(Arc::clone(&db));

    // Create a new window
    let mut my_window = webui::Window::new();

    // Randomize WebUI server port
    let port = TcpListener::bind("127.0.0.1:0")
        .ok()
        .and_then(|listener| listener.local_addr().ok())
        .map(|addr| addr.port());

    let port_ok = port
        .map(|p| unsafe { webui_set_port(my_window.id, p as usize) })
        .unwrap_or(false);

    if port_ok {
        info!("WebUI port set to {}", port.unwrap_or(0));
    } else {
        info!("WebUI port not set, using default");
    }

    // Set up UI event handlers from views layer
    presentation::ui_handlers::setup_ui_handlers(&mut my_window);
    presentation::ui_handlers::setup_counter_handlers(&mut my_window);
    presentation::db_handlers::setup_db_handlers(&mut my_window);
    presentation::sysinfo_handlers::setup_sysinfo_handlers(&mut my_window);
    presentation::logging_handlers::setup_logging_handlers(&mut my_window);
    presentation::event_bus_handlers::setup_event_bus_handlers(&mut my_window);
    presentation::window_state_handler::setup_window_state_handlers(&mut my_window);
    presentation::error_handlers::setup_error_handlers(&mut my_window);
    presentation::error_handlers::setup_db_monitoring_handlers(&mut my_window);
    presentation::error_handlers::setup_devtools_handlers(&mut my_window);

    // Get window settings from config
    let window_title = config.get_window_title();
    info!("Window title: {}", window_title);

    // Show the built application - resolve dist/ robustly for both `cargo run` and packaged binaries
    let (dist_dir, index_path) = match resolve_frontend_dist() {
        Some(paths) => paths,
        None => {
            error!("Could not locate frontend dist/index.html");
            error!("Run `./run.sh --build-frontend` and ensure dist/index.html exists.");
            return;
        }
    };

    // Set root folder for WebUI to serve static files
    let root_folder = dist_dir.to_str().unwrap_or("dist");
    info!("Setting WebUI root folder to: {}", root_folder);
    
    let c_string = match std::ffi::CString::new(root_folder) {
        Ok(s) => s,
        Err(e) => {
            error!("Failed to create C string for root folder: {}", e);
            return;
        }
    };
    
    unsafe {
        webui_rs::webui::bindgen::webui_set_root_folder(my_window.id, c_string.as_ptr());
    }

    info!("Loading application UI from {}", index_path.display());
    // When root folder is set, WebUI should load by route, not absolute file path.
    my_window.show("index.html");

    // Sync WebUI port to frontend
    if port_ok {
        if let Some(port) = port {
            let js = format!(
                "window.__WEBUI_PORT = {}; window.dispatchEvent(new CustomEvent('webui:port', {{ detail: {{ port: {} }} }}));",
                port, port
            );
            my_window.run_js(js);
        }
    }

    info!("Application started successfully, waiting for events...");
    info!("=============================================");

    // Set up graceful shutdown handler
    let db_for_shutdown = Arc::clone(&db);
    ctrlc_handler::setup_shutdown_handler(db_for_shutdown);

    // Wait until all windows are closed
    webui::wait();

    // Print error summary before shutdown
    error_handler::print_error_summary();

    info!("Application shutting down...");
    info!("=============================================");
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
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("dist")
            .join("browser"),
    );

    if let Ok(cwd) = std::env::current_dir() {
        candidates.push(cwd.join("dist"));
        candidates.push(cwd.join("dist").join("browser"));
    }

    for dist_dir in candidates {
        let index_path = dist_dir.join("index.html");
        if index_path.exists() {
            info!("Resolved frontend dist directory: {}", dist_dir.display());
            return Some((dist_dir, index_path));
        }
        warn!(
            "Frontend dist candidate missing index.html: {}",
            dist_dir.display()
        );
    }

    if let Some((dist_dir, index_path)) = materialize_embedded_frontend_dist() {
        info!(
            "Resolved frontend dist from embedded assets: {}",
            dist_dir.display()
        );
        return Some((dist_dir, index_path));
    }

    None
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
            warn!(
                "Failed to write embedded frontend file {}: {}",
                path.display(),
                e
            );
            return None;
        }
    }

    Some((dist_dir.clone(), dist_dir.join("index.html")))
}
