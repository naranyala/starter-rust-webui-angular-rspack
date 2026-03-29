use crate::core::error::{AppError, ErrorCode, ErrorValue};
use crate::core::infrastructure::database::models::{ApiResponse, ErrorData};
use crate::core::infrastructure::database::Database;
use crate::core::infrastructure::error_handler;
use log::{error, info};
use std::sync::{Arc, Mutex};
use webui_rs::webui;

lazy_static::lazy_static! {
    static ref DB_INSTANCE: Mutex<Option<Arc<Database>>> = Mutex::new(None);
}

pub fn init_database(db: Arc<Database>) {
    let mut instance = match DB_INSTANCE.lock() {
        Ok(guard) => guard,
        Err(e) => {
            error!("Failed to acquire DB_INSTANCE lock: {}", e);
            return;
        }
    };
    *instance = Some(db);
    info!("Database handlers initialized");
}

fn get_db() -> Option<Arc<Database>> {
    let instance = match DB_INSTANCE.lock() {
        Ok(guard) => guard,
        Err(e) => {
            error!("Failed to acquire DB_INSTANCE lock: {}", e);
            return None;
        }
    };
    instance.clone()
}

/// Send a success response to the frontend using unified ApiResponse format
fn send_success_response<T: serde::Serialize>(window: webui::Window, event_name: &str, data: T) {
    let response = ApiResponse::success(data);
    dispatch_event(window, event_name, &response);
}

/// Send an error response to the frontend using unified ApiResponse format
fn send_error_response(window: webui::Window, event_name: &str, err: &AppError) {
    let error_data = err_to_error_data(err);
    let response = ApiResponse::<serde_json::Value>::error(error_data);
    dispatch_event(window, event_name, &response);
}

/// Convert AppError to ErrorData
fn err_to_error_data(err: &AppError) -> ErrorData {
    let error_value = err.to_value();
    ErrorData::new(&format!("{:?}", error_value.code), &error_value.message)
        .with_field(error_value.field.as_deref().unwrap_or(""))
        .with_context("cause", error_value.cause.as_deref().unwrap_or(""))
}

/// Helper to dispatch a custom event to the frontend
fn dispatch_event<T: serde::Serialize>(window: webui::Window, event_name: &str, detail: &T) {
    let js = format!(
        "window.dispatchEvent(new CustomEvent('{}', {{ detail: {} }}))",
        event_name,
        serde_json::to_string(detail).unwrap_or_else(|_| "{}".to_string())
    );
    webui::Window::from_id(window.id).run_js(&js);
}

/// Handle a database operation result and send appropriate response
fn handle_db_result<T: serde::Serialize>(
    window: webui::Window,
    event_name: &str,
    result: Result<T, AppError>,
) {
    match result {
        Ok(data) => {
            send_success_response(window, event_name, data);
        }
        Err(e) => {
            error!("Database operation failed: {}", e);
            error_handler::record_app_error("DB_HANDLER", &e);
            send_error_response(window, event_name, &e);
        }
    }
}

/// Parse colon-separated parameters from element name
fn parse_params(element_name: &str) -> Vec<&str> {
    element_name.split(':').collect()
}

pub fn setup_db_handlers(window: &mut webui::Window) {
    // ==================== USERS CRUD ====================
    window.bind("get_users", |event| {
        info!("get_users called from frontend");
        let window = event.get_window();

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "db_response", &err);
            return;
        };

        handle_db_result(window, "db_response", db.get_all_users());
    });

    window.bind("getUsers", |event| {
        info!("getUsers called from frontend");
        let window = event.get_window();

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "db_response", &err);
            return;
        };

        handle_db_result(window, "db_response", db.get_all_users());
    });

    window.bind("create_user", |event| {
        info!("create_user called from frontend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();

        let parts: Vec<&str> = element_name.split(':').collect();
        let name = if parts.len() > 1 { parts[1] } else { "" };
        let email = if parts.len() > 2 { parts[2] } else { "" };
        let role = if parts.len() > 3 { parts[3] } else { "User" };
        let status = if parts.len() > 4 { parts[4] } else { "Active" };

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "user_create_response", &err);
            return;
        };

        handle_db_result(
            window,
            "user_create_response",
            db.insert_user(name, email, role, status),
        );
    });

    window.bind("createUser", |event| {
        info!("createUser called from frontend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();

        let parts = parse_params(&element_name);
        let name = if parts.len() > 1 { parts[1] } else { "" };
        let email = if parts.len() > 2 { parts[2] } else { "" };
        let role = if parts.len() > 3 { parts[3] } else { "User" };
        let status = if parts.len() > 4 { parts[4] } else { "Active" };

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "user_create_response", &err);
            return;
        };

        handle_db_result(
            window,
            "user_create_response",
            db.insert_user(name, email, role, status),
        );
    });

    window.bind("update_user", |event| {
        info!("update_user called from frontend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();

        let parts: Vec<&str> = element_name.split(':').collect();
        let id: i64 = if parts.len() > 1 {
            parts[1].parse().unwrap_or(0)
        } else {
            0
        };
        let name = if parts.len() > 2 {
            Some(parts[2].to_string())
        } else {
            None
        };
        let email = if parts.len() > 3 {
            Some(parts[3].to_string())
        } else {
            None
        };
        let role = if parts.len() > 4 {
            Some(parts[4].to_string())
        } else {
            None
        };
        let status = if parts.len() > 5 {
            Some(parts[5].to_string())
        } else {
            None
        };

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "user_update_response", &err);
            return;
        };

        handle_db_result(
            window,
            "user_update_response",
            db.update_user(id, name, email, role, status),
        );
    });

    window.bind("updateUser", |event| {
        info!("updateUser called from frontend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();

        let parts = parse_params(&element_name);
        let id: i64 = if parts.len() > 1 {
            parts[1].parse().unwrap_or(0)
        } else {
            0
        };
        let name = if parts.len() > 2 {
            Some(parts[2].to_string())
        } else {
            None
        };
        let email = if parts.len() > 3 {
            Some(parts[3].to_string())
        } else {
            None
        };
        let role = if parts.len() > 4 {
            Some(parts[4].to_string())
        } else {
            None
        };
        let status = if parts.len() > 5 {
            Some(parts[5].to_string())
        } else {
            None
        };

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "user_update_response", &err);
            return;
        };

        handle_db_result(
            window,
            "user_update_response",
            db.update_user(id, name, email, role, status),
        );
    });

    window.bind("delete_user", |event| {
        info!("delete_user called from frontend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();

        let parts: Vec<&str> = element_name.split(':').collect();
        let id: i64 = if parts.len() > 1 {
            parts[1].parse().unwrap_or(0)
        } else {
            0
        };

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "user_delete_response", &err);
            return;
        };

        handle_db_result(window, "user_delete_response", db.delete_user(id));
    });

    window.bind("deleteUser", |event| {
        info!("deleteUser called from frontend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();

        let parts = parse_params(&element_name);
        let id: i64 = if parts.len() > 1 {
            parts[1].parse().unwrap_or(0)
        } else {
            0
        };

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "user_delete_response", &err);
            return;
        };

        handle_db_result(window, "user_delete_response", db.delete_user(id));
    });

    // ==================== PRODUCTS CRUD ====================
    window.bind("getProducts", |event| {
        info!("getProducts called from frontend");
        let window = event.get_window();

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "products_response", &err);
            return;
        };

        handle_db_result(window, "products_response", db.get_all_products());
    });

    window.bind("createProduct", |event| {
        info!("createProduct called from frontend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();

        let parts = parse_params(&element_name);
        let name = if parts.len() > 1 { parts[1] } else { "" };
        let description = if parts.len() > 2 { parts[2] } else { "" };
        let price: f64 = if parts.len() > 3 {
            parts[3].parse().unwrap_or(0.0)
        } else {
            0.0
        };
        let category = if parts.len() > 4 { parts[4] } else { "General" };
        let stock: i64 = if parts.len() > 5 {
            parts[5].parse().unwrap_or(0)
        } else {
            0
        };

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "product_create_response", &err);
            return;
        };

        handle_db_result(
            window,
            "product_create_response",
            db.insert_product(name, description, price, category, stock),
        );
    });

    window.bind("updateProduct", |event| {
        info!("updateProduct called from frontend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();

        let parts = parse_params(&element_name);
        let id: i64 = if parts.len() > 1 {
            parts[1].parse().unwrap_or(0)
        } else {
            0
        };
        let name = if parts.len() > 2 {
            Some(parts[2].to_string())
        } else {
            None
        };
        let description = if parts.len() > 3 {
            Some(parts[3].to_string())
        } else {
            None
        };
        let price: Option<f64> = if parts.len() > 4 {
            parts[4].parse().ok()
        } else {
            None
        };
        let category = if parts.len() > 5 {
            Some(parts[5].to_string())
        } else {
            None
        };
        let stock: Option<i64> = if parts.len() > 6 {
            parts[6].parse().ok()
        } else {
            None
        };

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "product_update_response", &err);
            return;
        };

        handle_db_result(
            window,
            "product_update_response",
            db.update_product(id, name, description, price, category, stock),
        );
    });

    window.bind("deleteProduct", |event| {
        info!("deleteProduct called from frontend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();

        let parts = parse_params(&element_name);
        let id: i64 = if parts.len() > 1 {
            parts[1].parse().unwrap_or(0)
        } else {
            0
        };

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "product_delete_response", &err);
            return;
        };

        handle_db_result(window, "product_delete_response", db.delete_product(id));
    });

    // ==================== ORDERS CRUD ====================
    window.bind("getOrders", |event| {
        info!("getOrders called from frontend");
        let window = event.get_window();

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "orders_response", &err);
            return;
        };

        handle_db_result(window, "orders_response", db.get_all_orders());
    });

    window.bind("createOrder", |event| {
        info!("createOrder called from frontend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();

        let parts = parse_params(&element_name);
        let user_id: i64 = if parts.len() > 1 {
            parts[1].parse().unwrap_or(0)
        } else {
            0
        };
        let product_id: i64 = if parts.len() > 2 {
            parts[2].parse().unwrap_or(0)
        } else {
            0
        };
        let quantity: i64 = if parts.len() > 3 {
            parts[3].parse().unwrap_or(1)
        } else {
            1
        };
        let total_price: f64 = if parts.len() > 4 {
            parts[4].parse().unwrap_or(0.0)
        } else {
            0.0
        };
        let status = if parts.len() > 5 { parts[5] } else { "Pending" };

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "order_create_response", &err);
            return;
        };

        handle_db_result(
            window,
            "order_create_response",
            db.insert_order(user_id, product_id, quantity, total_price, status),
        );
    });

    window.bind("updateOrder", |event| {
        info!("updateOrder called from frontend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();

        let parts = parse_params(&element_name);
        let id: i64 = if parts.len() > 1 {
            parts[1].parse().unwrap_or(0)
        } else {
            0
        };
        let quantity: Option<i64> = if parts.len() > 2 {
            parts[2].parse().ok()
        } else {
            None
        };
        let total_price: Option<f64> = if parts.len() > 3 {
            parts[3].parse().ok()
        } else {
            None
        };
        let status = if parts.len() > 4 {
            Some(parts[4].to_string())
        } else {
            None
        };

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "order_update_response", &err);
            return;
        };

        handle_db_result(
            window,
            "order_update_response",
            db.update_order(id, quantity, total_price, status),
        );
    });

    window.bind("deleteOrder", |event| {
        info!("deleteOrder called from frontend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();

        let parts = parse_params(&element_name);
        let id: i64 = if parts.len() > 1 {
            parts[1].parse().unwrap_or(0)
        } else {
            0
        };

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "order_delete_response", &err);
            return;
        };

        handle_db_result(window, "order_delete_response", db.delete_order(id));
    });

    // ==================== DATABASE STATS ====================
    window.bind("getDbStats", |event| {
        info!("getDbStats called from frontend");
        let window = event.get_window();

        let Some(db) = get_db() else {
            let err = AppError::DependencyInjection(
                ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                    .with_cause("DI container missing database instance"),
            );
            send_error_response(window, "stats_response", &err);
            return;
        };

        match db.get_database_stats() {
            Ok(stats) => {
                send_success_response(window, "stats_response", stats);
            }
            Err(e) => {
                error!("Database stats operation failed: {}", e);
                error_handler::record_app_error("DB_HANDLER", &e);
                send_error_response(window, "stats_response", &e);
            }
        }
    });

    info!("Database handlers set up successfully");
}
