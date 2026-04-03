//! ProductService — product CRUD with validation and business logic.

use std::collections::HashMap;
use std::sync::Arc;

use crate::core::errors::{AppError, AppResult, ErrorCode, ErrorValue};
use crate::core::database::models::{CategoryStats, Product};
use crate::core::database::Database;

pub struct ProductService {
    db: Arc<Database>,
}

impl ProductService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn get_all_products(&self) -> AppResult<Vec<Product>> {
        self.db.get_all_products()
    }

    pub fn get_product_by_id(&self, id: i64) -> AppResult<Product> {
        self.db
            .get_product_by_id(id)?
            .ok_or_else(|| {
                AppError::NotFound(
                    ErrorValue::new(ErrorCode::ResourceNotFound, "Product not found")
                        .with_field("id")
                        .with_context("id", &id.to_string()),
                )
            })
    }

    pub fn create_product(
        &self,
        name: &str,
        description: &str,
        price: f64,
        category: &str,
        stock: i64,
    ) -> AppResult<i64> {
        Self::validate_product_name(name)?;
        Self::validate_price(price)?;
        Self::validate_stock(stock)?;

        self.db
            .insert_product(name, description, price, category, stock)
    }

    pub fn update_product(
        &self,
        id: i64,
        name: Option<&str>,
        description: Option<&str>,
        price: Option<f64>,
        category: Option<&str>,
        stock: Option<i64>,
    ) -> AppResult<Product> {
        self.get_product_by_id(id)?;

        if let Some(new_name) = name {
            Self::validate_product_name(new_name)?;
        }
        if let Some(new_price) = price {
            Self::validate_price(new_price)?;
        }
        if let Some(new_stock) = stock {
            Self::validate_stock(new_stock)?;
        }

        self.db.update_product(
            id,
            name.map(String::from),
            description.map(String::from),
            price,
            category.map(String::from),
            stock,
        )?;

        self.get_product_by_id(id)
    }

    pub fn delete_product(&self, id: i64) -> AppResult<()> {
        self.get_product_by_id(id)?;
        self.db.delete_product(id)?;
        Ok(())
    }

    pub fn get_category_stats(&self) -> AppResult<Vec<CategoryStats>> {
        let products = self.get_all_products()?;
        let mut category_map: HashMap<String, CategoryStats> = HashMap::new();

        for product in products {
            let stats = category_map
                .entry(product.category.clone())
                .or_insert_with(|| CategoryStats {
                    category: product.category.clone(),
                    product_count: 0,
                    avg_price: 0.0,
                    total_stock: 0,
                    min_price: f64::MAX,
                    max_price: f64::MIN,
                    total_price: 0.0,
                });

            stats.product_count += 1;
            stats.total_stock += product.stock;
            stats.total_price += product.price;
            stats.min_price = stats.min_price.min(product.price);
            stats.max_price = stats.max_price.max(product.price);
        }

        let mut result: Vec<CategoryStats> = category_map.into_values().collect();
        for stats in &mut result {
            if stats.product_count > 0 {
                stats.avg_price = stats.total_price / stats.product_count as f64;
            }
        }

        result.sort_by(|a, b| b.product_count.cmp(&a.product_count));
        Ok(result)
    }

    // ─── Validation ─────────────────────────────────────────────────────

    fn validate_product_name(name: &str) -> AppResult<()> {
        if name.trim().is_empty() {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Product name is required")
                    .with_field("name"),
            ));
        }
        if name.len() > 200 {
            return Err(AppError::Validation(
                ErrorValue::new(
                    ErrorCode::ValidationFailed,
                    "Product name must be less than 200 characters",
                )
                .with_field("name"),
            ));
        }
        Ok(())
    }

    fn validate_price(price: f64) -> AppResult<()> {
        if price <= 0.0 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Price must be greater than 0")
                    .with_field("price"),
            ));
        }
        if price > 1_000_000.0 {
            return Err(AppError::Validation(
                ErrorValue::new(
                    ErrorCode::ValidationFailed,
                    "Price must be less than 1,000,000",
                )
                .with_field("price"),
            ));
        }
        Ok(())
    }

    fn validate_stock(stock: i64) -> AppResult<()> {
        if stock < 0 {
            return Err(AppError::Validation(
                ErrorValue::new(
                    ErrorCode::ValidationFailed,
                    "Stock cannot be negative",
                )
                .with_field("stock"),
            ));
        }
        Ok(())
    }
}
