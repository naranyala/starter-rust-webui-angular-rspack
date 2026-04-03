//! OrderService — order CRUD with validation and business logic.

use std::sync::Arc;

use crate::core::errors::{AppError, AppResult, ErrorCode, ErrorValue};
use crate::core::infrastructure::database::models::Order;
use crate::core::database::Database;
use crate::core::services::{ProductService, UserService};

pub struct OrderService {
    db: Arc<Database>,
    user_service: Arc<UserService>,
    product_service: Arc<ProductService>,
}

impl OrderService {
    pub fn new(db: Arc<Database>, user_service: Arc<UserService>, product_service: Arc<ProductService>) -> Self {
        Self { db, user_service, product_service }
    }

    pub fn get_all_orders(&self) -> AppResult<Vec<Order>> {
        self.db.get_all_orders()
    }

    pub fn create_order(
        &self,
        user_id: i64,
        product_id: i64,
        quantity: i64,
        total_price: f64,
        status: &str,
    ) -> AppResult<i64> {
        // Validate user and product exist
        self.user_service.get_user_by_id(user_id)?;
        self.product_service.get_product_by_id(product_id)?;
        Self::validate_quantity(quantity)?;
        Self::validate_price(total_price)?;

        self.db.insert_order(user_id, product_id, quantity, total_price, status)
    }

    pub fn update_order(
        &self,
        id: i64,
        quantity: Option<i64>,
        total_price: Option<f64>,
        status: Option<&str>,
    ) -> AppResult<Order> {
        self.db
            .get_order_by_id(id)?
            .ok_or_else(|| {
                AppError::NotFound(
                    ErrorValue::new(ErrorCode::ResourceNotFound, "Order not found")
                        .with_field("id"),
                )
            })?;

        if let Some(qty) = quantity {
            Self::validate_quantity(qty)?;
        }
        if let Some(price) = total_price {
            Self::validate_price(price)?;
        }

        self.db.update_order(id, quantity, total_price, status.map(String::from))?;

        self.db
            .get_order_by_id(id)?
            .ok_or_else(|| {
                AppError::NotFound(
                    ErrorValue::new(ErrorCode::ResourceNotFound, "Order not found after update")
                        .with_field("id"),
                )
            })
    }

    pub fn delete_order(&self, id: i64) -> AppResult<()> {
        match self.db.get_order_by_id(id)? {
            Some(_) => {}
            None => {
                return Err(AppError::NotFound(
                    ErrorValue::new(ErrorCode::ResourceNotFound, "Order not found")
                        .with_field("id"),
                ));
            }
        }
        self.db.delete_order(id)?;
        Ok(())
    }

    fn validate_quantity(quantity: i64) -> AppResult<()> {
        if quantity <= 0 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Quantity must be greater than 0")
                    .with_field("quantity"),
            ));
        }
        Ok(())
    }

    fn validate_price(price: f64) -> AppResult<()> {
        if price < 0.0 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Price cannot be negative")
                    .with_field("price"),
            ));
        }
        Ok(())
    }
}
