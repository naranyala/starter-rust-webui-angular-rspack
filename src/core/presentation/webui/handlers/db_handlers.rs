//! WebUI Database Handlers
//!
//! This module handles WebUI events related to database operations.
//! It delegates business logic to the service layer for clean separation of concerns.
//!
//! # Event Flow
//!
//! ```text
//! Frontend Event → WebUI Handler → Service Layer → Database → Response
//! ```

use crate::core::application::services::{UserService, ProductService, OrderService, AnalyticsService};
use crate::core::error::ErrorCode;
use crate::core::infrastructure::database::{Database, models::*};
use crate::core::infrastructure::error_handler;
use log::{error, info};
use std::sync::Arc;
use webui_rs::webui;

lazy_static::lazy_static! {
    static ref DB_INSTANCE: Mutex<Option<Arc<Database>>> = Mutex::new(None);
}

use std::sync::Mutex;

pub fn init_database(db: Arc<Database>) {
    let mut instance = DB_INSTANCE.lock().unwrap();
    *instance = Some(db);
    info!("Database handlers initialized");
}

fn get_db() -> Option<Arc<Database>> {
    DB_INSTANCE.lock().unwrap().clone()
}

/// Send a success response to the frontend
fn send_success_response<T: serde::Serialize>(window: webui::Window, event_name: &str, data: T) {
    let response = ApiResponse::success(data);
    dispatch_event(window, event_name, &response);
}

/// Send an error response to the frontend
fn send_error_response(window: webui::Window, event_name: &str, err: &crate::core::error::AppError) {
    let error_data = err_to_error_data(err);
    let response = ApiResponse::<serde_json::Value>::error(error_data);
    dispatch_event(window, event_name, &response);
}

/// Convert AppError to ErrorData
fn err_to_error_data(err: &crate::core::error::AppError) -> ErrorData {
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

/// Parse colon-separated parameters from element name
fn parse_params(element_name: &str) -> Vec<&str> {
    element_name.split(':').collect()
}

/// Handle database operation result
fn handle_result<T: serde::Serialize, F: FnOnce() -> Result<T, crate::core::error::AppError>>(
    window: webui::Window,
    event_name: &str,
    operation: F,
) {
    match operation() {
        Ok(data) => send_success_response(window, event_name, data),
        Err(e) => {
            error!("Operation failed: {}", e);
            error_handler::record_app_error("DB_HANDLER", &e);
            send_error_response(window, event_name, &e);
        }
    }
}

pub fn setup_db_handlers(window: &mut webui::Window) {
    // ==================== USERS CRUD ====================
    
    window.bind("getUsers", |event| {
        info!("getUsers: Fetching all users");
        let window = event.get_window();
        handle_result(window, "db_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            UserService::new(db).get_all_users()
        });
    });

    window.bind("getUserStats", |event| {
        info!("getUserStats: Calculating user statistics");
        let window = event.get_window();
        handle_result(window, "db_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            UserService::new(db).get_user_stats()
        });
    });

    window.bind("createUser", |event| {
        info!("createUser: Creating new user");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        let parts = parse_params(&element_name);
        
        let name = parts.get(1).copied().unwrap_or("");
        let email = parts.get(2).copied().unwrap_or("");
        let role = parts.get(3).copied().unwrap_or("User");
        let status = parts.get(4).copied().unwrap_or("Active");
        
        handle_result(window, "user_create_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            UserService::new(db).create_user(name, email, role, status)
        });
    });

    window.bind("updateUser", |event| {
        info!("updateUser: Updating user");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        let parts = parse_params(&element_name);
        
        let id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        let name = parts.get(2).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        let email = parts.get(3).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        let role = parts.get(4).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        let status = parts.get(5).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        
        handle_result(window, "user_update_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            UserService::new(db).update_user(id, name, email, role, status)
        });
    });

    window.bind("deleteUser", |event| {
        info!("deleteUser: Deleting user");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        let parts = parse_params(&element_name);
        let id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        
        handle_result(window, "user_delete_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            UserService::new(db).delete_user(id)
        });
    });

    // ==================== PRODUCTS CRUD ====================
    
    window.bind("getProducts", |event| {
        info!("getProducts: Fetching all products");
        let window = event.get_window();
        handle_result(window, "products_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            ProductService::new(db).get_all_products()
        });
    });

    window.bind("createProduct", |event| {
        info!("createProduct: Creating new product");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        let parts = parse_params(&element_name);
        
        let name = parts.get(1).copied().unwrap_or("");
        let description = parts.get(2).copied().unwrap_or("");
        let price: f64 = parts.get(3).and_then(|s| s.parse().ok()).unwrap_or(0.0);
        let category = parts.get(4).copied().unwrap_or("General");
        let stock: i64 = parts.get(5).and_then(|s| s.parse().ok()).unwrap_or(0);
        
        handle_result(window, "product_create_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            ProductService::new(db).create_product(name, description, price, category, stock)
        });
    });

    window.bind("updateProduct", |event| {
        info!("updateProduct: Updating product");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        let parts = parse_params(&element_name);
        
        let id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        let name = parts.get(2).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        let description = parts.get(3).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        let price: Option<f64> = parts.get(4).and_then(|s| s.parse().ok());
        let category = parts.get(5).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        let stock: Option<i64> = parts.get(6).and_then(|s| s.parse().ok());
        
        handle_result(window, "product_update_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            ProductService::new(db).update_product(id, name, description, price, category, stock)
        });
    });

    window.bind("deleteProduct", |event| {
        info!("deleteProduct: Deleting product");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        let parts = parse_params(&element_name);
        let id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        
        handle_result(window, "product_delete_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            ProductService::new(db).delete_product(id)
        });
    });

    // ==================== ORDERS CRUD ====================
    
    window.bind("getOrders", |event| {
        info!("getOrders: Fetching all orders");
        let window = event.get_window();
        handle_result(window, "orders_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            OrderService::new(db).get_all_orders()
        });
    });

    window.bind("createOrder", |event| {
        info!("createOrder: Creating new order");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        let parts = parse_params(&element_name);
        
        let user_id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        let product_id: i64 = parts.get(2).and_then(|s| s.parse().ok()).unwrap_or(0);
        let quantity: i64 = parts.get(3).and_then(|s| s.parse().ok()).unwrap_or(1);
        let total_price: f64 = parts.get(4).and_then(|s| s.parse().ok()).unwrap_or(0.0);
        let status = parts.get(5).copied().unwrap_or("Pending");
        
        handle_result(window, "order_create_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            OrderService::new(db).create_order(user_id, product_id, quantity, total_price, status)
        });
    });

    window.bind("updateOrder", |event| {
        info!("updateOrder: Updating order");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        let parts = parse_params(&element_name);
        
        let id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        let quantity: Option<i64> = parts.get(2).and_then(|s| s.parse().ok());
        let total_price: Option<f64> = parts.get(3).and_then(|s| s.parse().ok());
        let status = parts.get(4).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        
        handle_result(window, "order_update_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            OrderService::new(db).update_order(id, quantity, total_price, status)
        });
    });

    window.bind("deleteOrder", |event| {
        info!("deleteOrder: Deleting order");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        let parts = parse_params(&element_name);
        let id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        
        handle_result(window, "order_delete_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            OrderService::new(db).delete_order(id)
        });
    });

    // ==================== ANALYTICS ====================
    
    window.bind("getCategoryStats", |event| {
        info!("getCategoryStats: Calculating category statistics");
        let window = event.get_window();
        handle_result(window, "db_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            ProductService::new(db).get_category_stats()
        });
    });

    window.bind("getSalesTrend", |event| {
        info!("getSalesTrend: Calculating sales trend");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        let parts = parse_params(&element_name);
        let days: i32 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(30);
        
        handle_result(window, "db_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            AnalyticsService::new(db).get_sales_trend(days)
        });
    });

    window.bind("getTopProducts", |event| {
        info!("getTopProducts: Fetching top products");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        let parts = parse_params(&element_name);
        let limit: i32 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(10);
        
        handle_result(window, "db_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            AnalyticsService::new(db).get_top_products(limit)
        });
    });

    window.bind("getRevenueByPeriod", |event| {
        info!("getRevenueByPeriod: Calculating revenue by period");
        let element_name = unsafe {
            std::ffi::CStr::from_ptr(event.element)
                .to_string_lossy()
                .into_owned()
        };
        let window = event.get_window();
        let parts = parse_params(&element_name);
        let period = parts.get(1).copied().unwrap_or("daily");
        
        handle_result(window, "db_response", || {
            let Some(db) = get_db() else {
                return Err(crate::core::error::AppError::DependencyInjection(
                    crate::core::error::ErrorValue::new(ErrorCode::InternalError, "Database not initialized")
                ));
            };
            AnalyticsService::new(db).get_revenue_by_period(period)
        });
    });

    info!("Database handlers configured successfully");
}
