//! WebUI Database Handlers
//!
//! Delegates to rich services from ServiceRegistry.
//! Flow: Frontend Event → Handler → Service → Response

use crate::core::presentation::webui::handler_utils;
use crate::core::service_registry;
use log::info;
use webui_rs::webui;

/// Initialize DB handlers. (Legacy shim — now handled by ServiceRegistry.)
pub fn setup_db_handlers(window: &mut webui::Window) {
    // ─── USERS ────────────────────────────────────────────────────────

    window.bind("getUsers", |event| {
        info!("getUsers: Fetching all users");
        let window = event.get_window();
        handler_utils::handle_result(window, "db_response", "getUsers", || {
            service_registry::get_registry().user_service.get_all_users()
        });
    });

    window.bind("getUserStats", |event| {
        info!("getUserStats: Calculating user statistics");
        let window = event.get_window();
        handler_utils::handle_result(window, "db_response", "getUserStats", || {
            service_registry::get_registry().user_service.get_user_stats()
        });
    });

    window.bind("createUser", |event| {
        info!("createUser: Creating new user");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let name = parts.get(1).copied().unwrap_or("");
        let email = parts.get(2).copied().unwrap_or("");
        let role = parts.get(3).copied().unwrap_or("User");
        let status = parts.get(4).copied().unwrap_or("Active");

        handler_utils::handle_result(window, "user_create_response", "createUser", || {
            service_registry::get_registry().user_service.create_user(name, email, role, status)
        });
    });

    window.bind("updateUser", |event| {
        info!("updateUser: Updating user");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        let name = parts.get(2).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        let email = parts.get(3).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        let role = parts.get(4).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        let status = parts.get(5).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();

        handler_utils::handle_result(window, "user_update_response", "updateUser", || {
            service_registry::get_registry().user_service.update_user(id, name, email, role, status)
        });
    });

    window.bind("deleteUser", |event| {
        info!("deleteUser: Deleting user");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);

        handler_utils::handle_result(window, "user_delete_response", "deleteUser", || {
            service_registry::get_registry().user_service.delete_user(id)
        });
    });

    // ─── PRODUCTS ─────────────────────────────────────────────────────

    window.bind("getProducts", |event| {
        info!("getProducts: Fetching all products");
        let window = event.get_window();
        handler_utils::handle_result(window, "products_response", "getProducts", || {
            service_registry::get_registry().product_service.get_all_products()
        });
    });

    window.bind("createProduct", |event| {
        info!("createProduct: Creating new product");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let name = parts.get(1).copied().unwrap_or("");
        let description = parts.get(2).copied().unwrap_or("");
        let price: f64 = parts.get(3).and_then(|s| s.parse().ok()).unwrap_or(0.0);
        let category = parts.get(4).copied().unwrap_or("General");
        let stock: i64 = parts.get(5).and_then(|s| s.parse().ok()).unwrap_or(0);

        handler_utils::handle_result(window, "product_create_response", "createProduct", || {
            service_registry::get_registry().product_service.create_product(name, description, price, category, stock)
        });
    });

    window.bind("updateProduct", |event| {
        info!("updateProduct: Updating product");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        let name = parts.get(2).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        let description = parts.get(3).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        let price: Option<f64> = parts.get(4).and_then(|s| s.parse().ok());
        let category = parts.get(5).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();
        let stock: Option<i64> = parts.get(6).and_then(|s| s.parse().ok());

        handler_utils::handle_result(window, "product_update_response", "updateProduct", || {
            service_registry::get_registry().product_service.update_product(id, name, description, price, category, stock)
        });
    });

    window.bind("deleteProduct", |event| {
        info!("deleteProduct: Deleting product");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);

        handler_utils::handle_result(window, "product_delete_response", "deleteProduct", || {
            service_registry::get_registry().product_service.delete_product(id)
        });
    });

    // ─── ORDERS ───────────────────────────────────────────────────────

    window.bind("getOrders", |event| {
        info!("getOrders: Fetching all orders");
        let window = event.get_window();
        handler_utils::handle_result(window, "orders_response", "getOrders", || {
            service_registry::get_registry().order_service.get_all_orders()
        });
    });

    window.bind("createOrder", |event| {
        info!("createOrder: Creating new order");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let user_id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        let product_id: i64 = parts.get(2).and_then(|s| s.parse().ok()).unwrap_or(0);
        let quantity: i64 = parts.get(3).and_then(|s| s.parse().ok()).unwrap_or(1);
        let total_price: f64 = parts.get(4).and_then(|s| s.parse().ok()).unwrap_or(0.0);
        let status = parts.get(5).copied().unwrap_or("Pending");

        handler_utils::handle_result(window, "order_create_response", "createOrder", || {
            service_registry::get_registry().order_service.create_order(user_id, product_id, quantity, total_price, status)
        });
    });

    window.bind("updateOrder", |event| {
        info!("updateOrder: Updating order");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);
        let quantity: Option<i64> = parts.get(2).and_then(|s| s.parse().ok());
        let total_price: Option<f64> = parts.get(3).and_then(|s| s.parse().ok());
        let status = parts.get(4).map(|s| if s.is_empty() { None } else { Some(*s) }).flatten();

        handler_utils::handle_result(window, "order_update_response", "updateOrder", || {
            service_registry::get_registry().order_service.update_order(id, quantity, total_price, status)
        });
    });

    window.bind("deleteOrder", |event| {
        info!("deleteOrder: Deleting order");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let id: i64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);

        handler_utils::handle_result(window, "order_delete_response", "deleteOrder", || {
            service_registry::get_registry().order_service.delete_order(id)
        });
    });

    // ─── ANALYTICS ────────────────────────────────────────────────────

    window.bind("getCategoryStats", |event| {
        info!("getCategoryStats: Calculating category statistics");
        let window = event.get_window();
        handler_utils::handle_result(window, "db_response", "getCategoryStats", || {
            service_registry::get_registry().product_service.get_category_stats()
        });
    });

    window.bind("getSalesTrend", |event| {
        info!("getSalesTrend: Calculating sales trend");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let days: i32 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(30);

        handler_utils::handle_result(window, "db_response", "getSalesTrend", || {
            service_registry::get_registry().analytics_service.get_sales_trend(days)
        });
    });

    window.bind("getTopProducts", |event| {
        info!("getTopProducts: Fetching top products");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let limit: i32 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(10);

        handler_utils::handle_result(window, "db_response", "getTopProducts", || {
            service_registry::get_registry().analytics_service.get_top_products(limit)
        });
    });

    window.bind("getRevenueByPeriod", |event| {
        info!("getRevenueByPeriod: Calculating revenue by period");
        let element_name = handler_utils::element_name(&event);
        let window = event.get_window();
        let parts = handler_utils::parse_params(&element_name);
        let period = parts.get(1).copied().unwrap_or("daily");

        handler_utils::handle_result(window, "db_response", "getRevenueByPeriod", || {
            service_registry::get_registry().analytics_service.get_revenue_by_period(period)
        });
    });

    info!("Database handlers configured successfully");
}
