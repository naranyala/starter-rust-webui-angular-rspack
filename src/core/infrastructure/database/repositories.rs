// Repository Trait Implementations
// Implements domain repository traits for the Database infrastructure

use crate::core::domain::traits::{UserRepository, ProductRepository, OrderRepository};
use crate::core::error::AppResult;
use crate::core::infrastructure::database::connection::Database;

// ============================================================================
// UserRepository implementation for Database
// ============================================================================

impl UserRepository for Database {
    fn get_all(&self) -> AppResult<Vec<crate::core::domain::entities::User>> {
        // Convert from infrastructure models to domain entities
        let models = self.get_all_users()?;
        Ok(models.into_iter().map(|m| crate::core::domain::entities::User {
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
            status: m.status,
            created_at: m.created_at,
        }).collect())
    }

    fn get_by_id(&self, id: i64) -> AppResult<Option<crate::core::domain::entities::User>> {
        Ok(self.get_user_by_id(id)?.map(|m| crate::core::domain::entities::User {
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
            status: m.status,
            created_at: m.created_at,
        }))
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
    fn get_all(&self) -> AppResult<Vec<crate::core::domain::entities::Product>> {
        let models = self.get_all_products()?;
        Ok(models.into_iter().map(|m| crate::core::domain::entities::Product {
            id: m.id,
            name: m.name,
            description: m.description,
            price: m.price,
            category: m.category,
            stock: m.stock,
        }).collect())
    }

    fn get_by_id(&self, id: i64) -> AppResult<Option<crate::core::domain::entities::Product>> {
        Ok(self.get_product_by_id(id)?.map(|m| crate::core::domain::entities::Product {
            id: m.id,
            name: m.name,
            description: m.description,
            price: m.price,
            category: m.category,
            stock: m.stock,
        }))
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
    fn get_all(&self) -> AppResult<Vec<crate::core::domain::entities::Order>> {
        let models = self.get_all_orders()?;
        Ok(models.into_iter().map(|m| crate::core::domain::entities::Order {
            id: m.id,
            user_id: m.user_id,
            product_id: m.product_id,
            quantity: m.quantity,
            total_price: m.total_price,
            status: m.status,
            created_at: m.created_at,
        }).collect())
    }

    fn get_by_id(&self, id: i64) -> AppResult<Option<crate::core::domain::entities::Order>> {
        Ok(self.get_order_by_id(id)?.map(|m| crate::core::domain::entities::Order {
            id: m.id,
            user_id: m.user_id,
            product_id: m.product_id,
            quantity: m.quantity,
            total_price: m.total_price,
            status: m.status,
            created_at: m.created_at,
        }))
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
