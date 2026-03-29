// Domain Repository Traits
// These traits define the contract for data access, enabling testability and swappability

use crate::core::domain::entities::{AppConfig, Order, Product, User};
use crate::core::error::AppResult;

/// User repository trait for user data access
/// Implemented by Database in infrastructure layer
pub trait UserRepository: Send + Sync {
    fn get_all(&self) -> AppResult<Vec<User>>;
    fn get_by_id(&self, id: i64) -> AppResult<Option<User>>;
    fn create(&self, name: &str, email: &str, role: &str, status: &str) -> AppResult<i64>;
    fn update(
        &self,
        id: i64,
        name: Option<&str>,
        email: Option<&str>,
        role: Option<&str>,
        status: Option<&str>,
    ) -> AppResult<usize>;
    fn delete(&self, id: i64) -> AppResult<usize>;
}

/// Product repository trait for product data access
pub trait ProductRepository: Send + Sync {
    fn get_all(&self) -> AppResult<Vec<Product>>;
    fn get_by_id(&self, id: i64) -> AppResult<Option<Product>>;
    fn create(
        &self,
        name: &str,
        description: &str,
        price: f64,
        category: &str,
        stock: i64,
    ) -> AppResult<i64>;
    fn update(
        &self,
        id: i64,
        name: Option<&str>,
        description: Option<&str>,
        price: Option<f64>,
        category: Option<&str>,
        stock: Option<i64>,
    ) -> AppResult<usize>;
    fn delete(&self, id: i64) -> AppResult<usize>;
}

/// Order repository trait for order data access
pub trait OrderRepository: Send + Sync {
    fn get_all(&self) -> AppResult<Vec<Order>>;
    fn get_by_id(&self, id: i64) -> AppResult<Option<Order>>;
    fn create(
        &self,
        user_id: i64,
        product_id: i64,
        quantity: i64,
        total_price: f64,
        status: &str,
    ) -> AppResult<i64>;
    fn update(
        &self,
        id: i64,
        quantity: Option<i64>,
        total_price: Option<f64>,
        status: Option<&str>,
    ) -> AppResult<usize>;
    fn delete(&self, id: i64) -> AppResult<usize>;
}

/// Configuration repository trait
pub trait ConfigRepository: Send + Sync {
    fn load(&self) -> AppResult<AppConfig>;
    fn save(&self, config: &AppConfig) -> AppResult<()>;
}
