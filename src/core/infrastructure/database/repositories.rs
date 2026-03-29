// Repository Trait Implementations
// Implements domain repository traits for the Database infrastructure

use crate::core::domain::entities::{AppConfig, Order, Product, User};
use crate::core::domain::traits::{
    ConfigRepository, OrderRepository, ProductRepository, UserRepository,
};
use crate::core::error::AppResult;
use crate::core::infrastructure::config::AppConfig as InfraConfig;
use crate::core::infrastructure::database::connection::Database;

// ============================================================================
// UserRepository implementation for Database
// ============================================================================

impl UserRepository for Database {
    fn get_all(&self) -> AppResult<Vec<User>> {
        self.get_all_users()
    }

    fn get_by_id(&self, id: i64) -> AppResult<Option<User>> {
        self.get_user_by_id(id)
    }

    fn create(&self, name: &str, email: &str, role: &str, status: &str) -> AppResult<i64> {
        self.insert_user(name, email, role, status)
    }

    fn update(
        &self,
        id: i64,
        name: Option<&str>,
        email: Option<&str>,
        role: Option<&str>,
        status: Option<&str>,
    ) -> AppResult<usize> {
        self.update_user(
            id,
            name.map(|s| s.to_string()),
            email.map(|s| s.to_string()),
            role.map(|s| s.to_string()),
            status.map(|s| s.to_string()),
        )
    }

    fn delete(&self, id: i64) -> AppResult<usize> {
        self.delete_user(id)
    }
}

// ============================================================================
// ProductRepository implementation for Database
// ============================================================================

impl ProductRepository for Database {
    fn get_all(&self) -> AppResult<Vec<Product>> {
        self.get_all_products()
    }

    fn get_by_id(&self, id: i64) -> AppResult<Option<Product>> {
        self.get_product_by_id(id)
    }

    fn create(
        &self,
        name: &str,
        description: &str,
        price: f64,
        category: &str,
        stock: i64,
    ) -> AppResult<i64> {
        self.insert_product(name, description, price, category, stock)
    }

    fn update(
        &self,
        id: i64,
        name: Option<&str>,
        description: Option<&str>,
        price: Option<f64>,
        category: Option<&str>,
        stock: Option<i64>,
    ) -> AppResult<usize> {
        self.update_product(
            id,
            name.map(|s| s.to_string()),
            description.map(|s| s.to_string()),
            price,
            category.map(|s| s.to_string()),
            stock,
        )
    }

    fn delete(&self, id: i64) -> AppResult<usize> {
        self.delete_product(id)
    }
}

// ============================================================================
// OrderRepository implementation for Database
// ============================================================================

impl OrderRepository for Database {
    fn get_all(&self) -> AppResult<Vec<Order>> {
        self.get_all_orders()
    }

    fn get_by_id(&self, id: i64) -> AppResult<Option<Order>> {
        self.get_order_by_id(id)
    }

    fn create(
        &self,
        user_id: i64,
        product_id: i64,
        quantity: i64,
        total_price: f64,
        status: &str,
    ) -> AppResult<i64> {
        self.insert_order(user_id, product_id, quantity, total_price, status)
    }

    fn update(
        &self,
        id: i64,
        quantity: Option<i64>,
        total_price: Option<f64>,
        status: Option<&str>,
    ) -> AppResult<usize> {
        self.update_order(id, quantity, total_price, status.map(|s| s.to_string()))
    }

    fn delete(&self, id: i64) -> AppResult<usize> {
        self.delete_order(id)
    }
}

// ============================================================================
// ConfigRepository implementation for Database (uses file system)
// ============================================================================

pub struct FileConfigRepository;

impl ConfigRepository for FileConfigRepository {
    fn load(&self) -> AppResult<AppConfig> {
        let config = InfraConfig::load()?;
        Ok(AppConfig {
            app_name: config.get_app_name().to_string(),
            version: config.get_version().to_string(),
            window_title: config.get_window_title().to_string(),
            log_level: config.get_log_level().to_string(),
            log_file: Some(config.get_log_file().to_string()),
            append_log: config.is_append_log(),
            db_path: config.get_db_path().to_string(),
            create_sample_data: config.should_create_sample_data(),
        })
    }

    fn save(&self, config: &AppConfig) -> AppResult<()> {
        // For now, config is read-only from file
        // Implementation would write to config file
        Ok(())
    }
}
