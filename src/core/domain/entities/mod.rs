// Domain Entities
// These are the core business entities used throughout the application

use serde::{Deserialize, Serialize};

/// User entity - represents a user in the system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub role: String,
    pub status: String,
    pub created_at: String,
}

/// Product entity - represents a product in the catalog
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Product {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub price: f64,
    pub category: String,
    pub stock: i64,
}

/// Order entity - represents a customer order
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    pub id: i64,
    pub user_id: i64,
    pub product_id: i64,
    pub quantity: i64,
    pub total_price: f64,
    pub status: String,
    pub created_at: String,
}

/// Application configuration entity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub app_name: String,
    pub version: String,
    pub window_title: String,
    pub log_level: String,
    pub log_file: Option<String>,
    pub append_log: bool,
    pub db_path: String,
    pub create_sample_data: bool,
}

/// System information entity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os_name: String,
    pub os_version: String,
    pub hostname: String,
    pub cpu_cores: usize,
    pub local_ip: Option<String>,
    pub current_pid: u32,
}
