//! Backend API Service Layer
//! 
//! This module provides a clean service abstraction over the database layer,
//! implementing business logic and validation before persisting data.
//! 
//! # Architecture
//! 
//! ```text
//! Frontend → WebUI Handlers → API Services → Domain Services → Database
//! ```

use crate::core::error::{AppError, ErrorCode, ErrorValue};
use crate::core::infrastructure::database::{Database, models::*};
use log::info;
use std::sync::Arc;

/// User service for managing user operations
pub struct UserService {
    db: Arc<Database>,
}

impl UserService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    /// Get all users with error handling
    pub fn get_all_users(&self) -> Result<Vec<User>, AppError> {
        info!("UserService: Fetching all users");
        self.db.get_all_users()
    }

    /// Get user by ID
    pub fn get_user_by_id(&self, id: i64) -> Result<User, AppError> {
        info!("UserService: Fetching user with id={}", id);
        match self.db.get_user_by_id(id) {
            Ok(Some(user)) => Ok(user),
            Ok(None) => Err(AppError::NotFound(
                ErrorValue::new(ErrorCode::ResourceNotFound, "User not found")
                    .with_field("id")
                    .with_context("id", &id.to_string())
            )),
            Err(e) => Err(AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, e.to_string())
                    .with_cause("Failed to fetch user")
            )),
        }
    }

    /// Create a new user with validation
    pub fn create_user(&self, name: &str, email: &str, role: &str, status: &str) -> Result<i64, AppError> {
        info!("UserService: Creating user with email={}", email);
        
        // Validation
        Self::validate_name(name)?;
        Self::validate_email(email)?;

        // Check for duplicate email
        if let Ok(Some(_existing)) = self.db.get_user_by_email(email) {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::DuplicateEntry, "Email already exists")
                    .with_field("email")
                    .with_context("email", email)
            ));
        }

        self.db.insert_user(name, email, role, status)
    }

    /// Update an existing user
    pub fn update_user(
        &self,
        id: i64,
        name: Option<&str>,
        email: Option<&str>,
        role: Option<&str>,
        status: Option<&str>,
    ) -> Result<User, AppError> {
        info!("UserService: Updating user with id={}", id);

        // Verify user exists
        self.get_user_by_id(id)?;

        // Validate if email is being changed
        if let Some(new_email) = email {
            Self::validate_email(new_email)?;

            // Check for duplicate email (excluding current user)
            if let Ok(Some(existing)) = self.db.get_user_by_email(new_email) {
                if existing.id != id {
                    return Err(AppError::Validation(
                        ErrorValue::new(ErrorCode::DuplicateEntry, "Email already exists")
                            .with_field("email")
                            .with_context("email", new_email)
                    ));
                }
            }
        }
        
        // Validate name if provided
        if let Some(new_name) = name {
            Self::validate_name(new_name)?;
        }
        
        // Perform update
        self.db.update_user(id, name.map(String::from), email.map(String::from), role.map(String::from), status.map(String::from))?;
        
        // Fetch and return updated user
        self.get_user_by_id(id)
    }

    /// Delete a user
    pub fn delete_user(&self, id: i64) -> Result<(), AppError> {
        info!("UserService: Deleting user with id={}", id);

        // Verify user exists
        self.get_user_by_id(id)?;

        self.db.delete_user(id)?;
        Ok(())
    }

    /// Get user statistics
    pub fn get_user_stats(&self) -> Result<UserStats, AppError> {
        info!("UserService: Calculating user statistics");
        let users = self.get_all_users()?;
        
        let total_users = users.len();
        let active_users = users.iter().filter(|u| u.status == "Active").count();
        let admin_users = users.iter().filter(|u| u.role == "Admin").count();
        let today_count = users.iter().filter(|u| {
            let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
            u.created_at.starts_with(&today)
        }).count();
        
        Ok(UserStats {
            total_users: total_users as i64,
            active_users: active_users as i64,
            admin_users: admin_users as i64,
            today_count: today_count as i64,
        })
    }

    // Validation helpers
    fn validate_name(name: &str) -> Result<(), AppError> {
        if name.trim().is_empty() {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Name is required")
                    .with_field("name")
            ));
        }
        if name.len() > 100 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Name must be less than 100 characters")
                    .with_field("name")
            ));
        }
        Ok(())
    }

    fn validate_email(email: &str) -> Result<(), AppError> {
        if email.trim().is_empty() {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Email is required")
                    .with_field("email")
            ));
        }
        if !email.contains('@') || !email.contains('.') {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Invalid email format")
                    .with_field("email")
            ));
        }
        if email.len() > 255 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Email must be less than 255 characters")
                    .with_field("email")
            ));
        }
        Ok(())
    }
}

/// Product service for managing product operations
pub struct ProductService {
    db: Arc<Database>,
}

impl ProductService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn get_all_products(&self) -> Result<Vec<Product>, AppError> {
        info!("ProductService: Fetching all products");
        self.db.get_all_products()
    }

    pub fn get_product_by_id(&self, id: i64) -> Result<Product, AppError> {
        info!("ProductService: Fetching product with id={}", id);
        match self.db.get_product_by_id(id) {
            Ok(Some(product)) => Ok(product),
            Ok(None) => Err(AppError::NotFound(
                ErrorValue::new(ErrorCode::ResourceNotFound, "Product not found")
                    .with_field("id")
                    .with_context("id", &id.to_string())
            )),
            Err(e) => Err(AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, e.to_string())
                    .with_cause("Failed to fetch product")
            )),
        }
    }

    pub fn create_product(
        &self,
        name: &str,
        description: &str,
        price: f64,
        category: &str,
        stock: i64,
    ) -> Result<i64, AppError> {
        info!("ProductService: Creating product with name={}", name);

        Self::validate_product_name(name)?;
        Self::validate_price(price)?;
        Self::validate_stock(stock)?;

        self.db.insert_product(name, description, price, category, stock)
    }

    pub fn update_product(
        &self,
        id: i64,
        name: Option<&str>,
        description: Option<&str>,
        price: Option<f64>,
        category: Option<&str>,
        stock: Option<i64>,
    ) -> Result<Product, AppError> {
        info!("ProductService: Updating product with id={}", id);
        
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
        
        // Perform update
        self.db.update_product(id, name.map(String::from), description.map(String::from), price, category.map(String::from), stock)?;
        
        // Fetch and return updated product
        self.get_product_by_id(id)
    }

    pub fn delete_product(&self, id: i64) -> Result<(), AppError> {
        info!("ProductService: Deleting product with id={}", id);
        self.get_product_by_id(id)?;
        self.db.delete_product(id)?;
        Ok(())
    }

    pub fn get_category_stats(&self) -> Result<Vec<CategoryStats>, AppError> {
        info!("ProductService: Calculating category statistics");
        let products = self.get_all_products()?;
        
        use std::collections::HashMap;
        let mut category_map: HashMap<String, CategoryStats> = HashMap::new();
        
        for product in products {
            let stats = category_map.entry(product.category.clone()).or_insert_with(|| CategoryStats {
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

    fn validate_product_name(name: &str) -> Result<(), AppError> {
        if name.trim().is_empty() {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Product name is required")
                    .with_field("name")
            ));
        }
        if name.len() > 200 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Product name must be less than 200 characters")
                    .with_field("name")
            ));
        }
        Ok(())
    }

    fn validate_price(price: f64) -> Result<(), AppError> {
        if price <= 0.0 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Price must be greater than 0")
                    .with_field("price")
            ));
        }
        if price > 1_000_000.0 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Price must be less than 1,000,000")
                    .with_field("price")
            ));
        }
        Ok(())
    }

    fn validate_stock(stock: i64) -> Result<(), AppError> {
        if stock < 0 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Stock cannot be negative")
                    .with_field("stock")
            ));
        }
        Ok(())
    }
}

/// Order service for managing order operations
pub struct OrderService {
    db: Arc<Database>,
}

impl OrderService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn get_all_orders(&self) -> Result<Vec<Order>, AppError> {
        info!("OrderService: Fetching all orders");
        self.db.get_all_orders()
    }

    pub fn create_order(
        &self,
        user_id: i64,
        product_id: i64,
        quantity: i64,
        total_price: f64,
        status: &str,
    ) -> Result<i64, AppError> {
        info!("OrderService: Creating order for user_id={}, product_id={}", user_id, product_id);
        
        // Verify user and product exist
        UserService::new(Arc::clone(&self.db)).get_user_by_id(user_id)?;
        ProductService::new(Arc::clone(&self.db)).get_product_by_id(product_id)?;
        Self::validate_quantity(quantity)?;
        Self::validate_price(total_price)?;
        
        // Create and return order ID
        self.db.insert_order(user_id, product_id, quantity, total_price, status)
    }

    pub fn update_order(
        &self,
        id: i64,
        quantity: Option<i64>,
        total_price: Option<f64>,
        status: Option<&str>,
    ) -> Result<Order, AppError> {
        info!("OrderService: Updating order with id={}", id);
        
        // Verify order exists
        self.db.get_order_by_id(id)
            .ok()
            .flatten()
            .ok_or_else(|| AppError::NotFound(
                ErrorValue::new(ErrorCode::ResourceNotFound, "Order not found")
                    .with_field("id")
            ))?;
        
        if let Some(qty) = quantity {
            Self::validate_quantity(qty)?;
        }
        if let Some(price) = total_price {
            Self::validate_price(price)?;
        }
        
        // Perform update
        self.db.update_order(id, quantity, total_price, status.map(String::from))?;
        
        // Fetch and return updated order
        self.db.get_order_by_id(id)
            .ok()
            .flatten()
            .ok_or_else(|| AppError::NotFound(
                ErrorValue::new(ErrorCode::ResourceNotFound, "Order not found after update")
                    .with_field("id")
            ))
    }

    pub fn delete_order(&self, id: i64) -> Result<(), AppError> {
        info!("OrderService: Deleting order with id={}", id);
        // Verify order exists
        match self.db.get_order_by_id(id) {
            Ok(Some(_)) => {},
            Ok(None) => {
                return Err(AppError::NotFound(
                    ErrorValue::new(ErrorCode::ResourceNotFound, "Order not found")
                        .with_field("id")
                ));
            },
            Err(e) => {
                return Err(AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, e.to_string())
                        .with_cause("Failed to fetch order")
                ));
            }
        }
        
        match self.db.delete_order(id) {
            Ok(_) => Ok(()),
            Err(e) => Err(AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, e.to_string())
                    .with_cause("Failed to delete order")
            )),
        }
    }

    fn validate_quantity(quantity: i64) -> Result<(), AppError> {
        if quantity <= 0 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Quantity must be greater than 0")
                    .with_field("quantity")
            ));
        }
        Ok(())
    }

    fn validate_price(price: f64) -> Result<(), AppError> {
        if price < 0.0 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Price cannot be negative")
                    .with_field("price")
            ));
        }
        Ok(())
    }
}

/// Analytics service for business intelligence
pub struct AnalyticsService {
    db: Arc<Database>,
}

impl AnalyticsService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn get_sales_trend(&self, days: i32) -> Result<Vec<SalesTrend>, AppError> {
        info!("AnalyticsService: Calculating sales trend for {} days", days);
        let orders = self.db.get_all_orders()?;
        
        use chrono::{Duration, Utc};
        use std::collections::HashMap;
        
        let start_date = Utc::now() - Duration::days(days as i64);
        let mut daily_stats: HashMap<String, SalesTrend> = HashMap::new();
        
        for order in orders {
            let date_str = order.created_at[..10].to_string();
            if date_str < start_date.format("%Y-%m-%d").to_string() {
                continue;
            }
            
            let stats = daily_stats.entry(date_str.clone()).or_insert_with(|| SalesTrend {
                date: date_str,
                order_count: 0,
                total_quantity: 0,
                total_revenue: 0.0,
                avg_order_value: 0.0,
            });
            
            stats.order_count += 1;
            stats.total_quantity += order.quantity;
            stats.total_revenue += order.total_price;
        }
        
        let mut result: Vec<SalesTrend> = daily_stats.into_values().collect();
        for stats in &mut result {
            if stats.order_count > 0 {
                stats.avg_order_value = stats.total_revenue / stats.order_count as f64;
            }
        }
        
        result.sort_by(|a, b| a.date.cmp(&b.date));
        Ok(result)
    }

    pub fn get_top_products(&self, limit: i32) -> Result<Vec<ProductStats>, AppError> {
        info!("AnalyticsService: Fetching top {} products", limit);
        let orders = self.db.get_all_orders()?;
        let products = self.db.get_all_products()?;
        
        use std::collections::HashMap;
        let mut product_map: HashMap<i64, ProductStats> = products.into_iter()
            .map(|p| (p.id, ProductStats {
                id: p.id,
                name: p.name.clone(),
                category: p.category.clone(),
                order_count: 0,
                total_sold: 0,
                total_revenue: 0.0,
            }))
            .collect();
        
        for order in orders {
            if let Some(stats) = product_map.get_mut(&order.product_id) {
                stats.order_count += 1;
                stats.total_sold += order.quantity;
                stats.total_revenue += order.total_price;
            }
        }
        
        let mut result: Vec<ProductStats> = product_map.into_values().collect();
        result.sort_by(|a, b| b.total_revenue.partial_cmp(&a.total_revenue).unwrap_or(std::cmp::Ordering::Equal));
        result.truncate(limit as usize);
        
        Ok(result)
    }

    pub fn get_revenue_by_period(&self, period: &str) -> Result<Vec<RevenueData>, AppError> {
        info!("AnalyticsService: Calculating revenue by {}", period);
        let orders = self.db.get_all_orders()?;
        
        use std::collections::HashMap;
        let mut period_map: HashMap<String, RevenueData> = HashMap::new();
        
        for order in orders {
            let period_key = match period {
                "daily" => order.created_at[..10].to_string(),
                "monthly" => order.created_at[..7].to_string(),
                "quarterly" => {
                    let year = &order.created_at[..4];
                    let month: u32 = order.created_at[5..7].parse().unwrap_or(1);
                    let quarter = (month - 1) / 3 + 1;
                    format!("{}-Q{}", year, quarter)
                },
                _ => order.created_at[..10].to_string(),
            };
            
            let data = period_map.entry(period_key.clone()).or_insert_with(|| RevenueData {
                period: period_key,
                revenue: 0.0,
                transactions: 0,
            });
            
            data.revenue += order.total_price;
            data.transactions += 1;
        }
        
        let mut result: Vec<RevenueData> = period_map.into_values().collect();
        result.sort_by(|a, b| b.period.cmp(&a.period));
        
        Ok(result)
    }
}
