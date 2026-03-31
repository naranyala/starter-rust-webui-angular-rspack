#![allow(dead_code)]
// src/core/infrastructure/database/models.rs
// Database data structures and models
// All models use camelCase for JSON serialization to match frontend conventions

use serde::{Deserialize, Serialize};

/// Represents a database row as a dynamic JSON-like object
pub type DbRow = serde_json::Map<String, serde_json::Value>;

/// Result wrapper for database operations
#[derive(Debug, Serialize)]
pub struct QueryResult {
    pub success: bool,
    pub data: Vec<DbRow>,
    pub message: String,
    pub rows_affected: usize,
}

impl QueryResult {
    pub fn success(data: Vec<DbRow>, message: &str) -> Self {
        Self {
            success: true,
            data,
            message: message.to_string(),
            rows_affected: 0,
        }
    }

    pub fn with_rows_affected(mut self, count: usize) -> Self {
        self.rows_affected = count;
        self
    }
}

/// Unified API response wrapper for backend-frontend communication
/// Uses camelCase for all JSON fields
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiResponse<T> {
    #[serde(rename = "requestId")]
    pub request_id: Option<String>,
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<ErrorData>,
    #[serde(rename = "timestamp")]
    pub timestamp_ms: u64,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            request_id: None,
            success: true,
            data: Some(data),
            error: None,
            timestamp_ms: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64,
        }
    }

    pub fn error(error: ErrorData) -> Self {
        Self {
            request_id: None,
            success: false,
            data: None,
            error: Some(error),
            timestamp_ms: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64,
        }
    }

    pub fn with_request_id(mut self, request_id: String) -> Self {
        self.request_id = Some(request_id);
        self
    }
}

/// Error data structure for API responses
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ErrorData {
    pub code: String,
    pub message: String,
    pub field: Option<String>,
    pub context: Option<std::collections::HashMap<String, String>>,
}

impl ErrorData {
    pub fn new(code: &str, message: &str) -> Self {
        Self {
            code: code.to_string(),
            message: message.to_string(),
            field: None,
            context: None,
        }
    }

    pub fn with_field(mut self, field: &str) -> Self {
        self.field = Some(field.to_string());
        self
    }

    pub fn with_context(mut self, key: &str, value: &str) -> Self {
        if self.context.is_none() {
            self.context = Some(std::collections::HashMap::new());
        }
        if let Some(ctx) = &mut self.context {
            ctx.insert(key.to_string(), value.to_string());
        }
        self
    }
}

/// User record structure
/// JSON fields are camelCase for frontend compatibility
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub role: String,
    pub status: String,
    pub created_at: String,
}

impl User {
    pub fn new(
        id: i64,
        name: &str,
        email: &str,
        role: &str,
        status: &str,
        created_at: &str,
    ) -> Self {
        Self {
            id,
            name: name.to_string(),
            email: email.to_string(),
            role: role.to_string(),
            status: status.to_string(),
            created_at: created_at.to_string(),
        }
    }
}

/// Product record structure
/// JSON fields are camelCase for frontend compatibility
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Product {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub price: f64,
    pub category: String,
    pub stock: i64,
}

impl Product {
    pub fn new(
        id: i64,
        name: &str,
        description: Option<&str>,
        price: f64,
        category: &str,
        stock: i64,
    ) -> Self {
        Self {
            id,
            name: name.to_string(),
            description: description.map(|s| s.to_string()),
            price,
            category: category.to_string(),
            stock,
        }
    }
}

/// Order record structure
/// JSON fields are camelCase for frontend compatibility
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Order {
    pub id: i64,
    pub user_id: i64,
    pub product_id: i64,
    pub quantity: i64,
    pub total_price: f64,
    pub status: String,
    pub created_at: String,
}

impl Order {
    pub fn new(
        id: i64,
        user_id: i64,
        product_id: i64,
        quantity: i64,
        total_price: f64,
        status: &str,
        created_at: &str,
    ) -> Self {
        Self {
            id,
            user_id,
            product_id,
            quantity,
            total_price,
            status: status.to_string(),
            created_at: created_at.to_string(),
        }
    }
}

/// Database statistics structure
/// JSON fields are camelCase for frontend compatibility
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseStats {
    pub users_count: i64,
    pub products_count: i64,
    pub orders_count: i64,
    pub total_revenue: f64,
}

/// User statistics structure
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UserStats {
    pub total_users: i64,
    pub active_users: i64,
    pub admin_users: i64,
    pub today_count: i64,
}

/// Category statistics structure
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CategoryStats {
    pub category: String,
    pub product_count: i64,
    pub avg_price: f64,
    pub total_stock: i64,
    pub min_price: f64,
    pub max_price: f64,
    #[serde(skip)]
    pub total_price: f64, // Helper field for calculation, not serialized
}

/// Sales trend data structure
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SalesTrend {
    pub date: String,
    pub order_count: i64,
    pub total_quantity: i64,
    pub total_revenue: f64,
    pub avg_order_value: f64,
}

/// Product statistics structure
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProductStats {
    pub id: i64,
    pub name: String,
    pub category: String,
    pub order_count: i64,
    pub total_sold: i64,
    pub total_revenue: f64,
}

/// Revenue data structure
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RevenueData {
    pub period: String,
    pub revenue: f64,
    pub transactions: i64,
}
