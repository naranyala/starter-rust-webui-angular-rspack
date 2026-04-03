// src/core/infrastructure/database/orders.rs
// Order-specific database operations with connection pooling

use chrono::Local;
use log::info;
use rusqlite::OptionalExtension;

use super::connection::Database;
use super::models::Order;
use crate::core::errors::{AppError, ErrorCode, ErrorValue};

/// Database operation result type alias
type DbResult<T> = Result<T, AppError>;

impl Database {
    /// Get all orders with user and product information
    pub fn get_all_orders(&self) -> DbResult<Vec<Order>> {
        let conn = self.get_conn()?;

        let mut stmt = conn
            .prepare(
                "SELECT id, user_id, product_id, quantity, total_price, status, created_at 
                 FROM orders ORDER BY created_at DESC",
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to prepare orders query")
                        .with_cause(e.to_string())
                        .with_context("table", "orders"),
                )
            })?;

        let orders = stmt
            .query_map([], |row| {
                Ok(Order {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    product_id: row.get(2)?,
                    quantity: row.get(3)?,
                    total_price: row.get(4)?,
                    status: row.get(5)?,
                    created_at: row.get(6)?,
                })
            })
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to query orders")
                        .with_cause(e.to_string()),
                )
            })?;

        orders.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to collect orders")
                    .with_cause(e.to_string()),
            )
        })
    }

    /// Insert a new order
    pub fn insert_order(
        &self,
        user_id: i64,
        product_id: i64,
        quantity: i64,
        total_price: f64,
        status: &str,
    ) -> DbResult<i64> {
        // Validate user exists
        let user_exists: i64 = {
            let conn = self.get_conn()?;
            conn.query_row(
                "SELECT COUNT(*) FROM users WHERE id = ?",
                [user_id],
                |row| row.get(0),
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to validate user")
                        .with_cause(e.to_string()),
                )
            })?
        };

        if user_exists == 0 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::EntityNotFound, "User not found")
                    .with_field("user_id")
                    .with_context("user_id", user_id.to_string()),
            ));
        }

        // Validate product exists
        let product_exists: i64 = {
            let conn = self.get_conn()?;
            conn.query_row(
                "SELECT COUNT(*) FROM products WHERE id = ?",
                [product_id],
                |row| row.get(0),
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to validate product")
                        .with_cause(e.to_string()),
                )
            })?
        };

        if product_exists == 0 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::EntityNotFound, "Product not found")
                    .with_field("product_id")
                    .with_context("product_id", product_id.to_string()),
            ));
        }

        // Validate quantity
        if quantity <= 0 {
            return Err(AppError::Validation(
                ErrorValue::new(
                    ErrorCode::InvalidFieldValue,
                    "Quantity must be greater than 0",
                )
                .with_field("quantity"),
            ));
        }

        // Validate total_price
        if total_price < 0.0 {
            return Err(AppError::Validation(
                ErrorValue::new(
                    ErrorCode::InvalidFieldValue,
                    "Total price cannot be negative",
                )
                .with_field("total_price"),
            ));
        }

        let created_at = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        let status = if status.is_empty() { "Pending" } else { status };

        let conn = self.get_conn()?;
        conn.execute(
            "INSERT INTO orders (user_id, product_id, quantity, total_price, status, created_at) 
             VALUES (?, ?, ?, ?, ?, ?)",
            rusqlite::params![
                user_id,
                product_id,
                quantity,
                total_price,
                status,
                created_at
            ],
        )
        .map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to insert order")
                    .with_cause(e.to_string())
                    .with_context("operation", "insert_order"),
            )
        })?;

        Ok(conn.last_insert_rowid())
    }

    /// Update an existing order
    pub fn update_order(
        &self,
        id: i64,
        quantity: Option<i64>,
        total_price: Option<f64>,
        status: Option<String>,
    ) -> DbResult<usize> {
        let conn = self.get_conn()?;

        // Build dynamic update query
        let mut updates = Vec::new();
        let mut params: Vec<String> = Vec::new();

        if let Some(q) = &quantity {
            updates.push("quantity = ?");
            params.push(q.to_string());
        }
        if let Some(p) = &total_price {
            updates.push("total_price = ?");
            params.push(p.to_string());
        }
        if let Some(s) = &status {
            updates.push("status = ?");
            params.push(s.clone());
        }

        if updates.is_empty() {
            return Ok(0); // Nothing to update
        }

        params.push(id.to_string());

        let query = format!("UPDATE orders SET {} WHERE id = ?", updates.join(", "));

        let rows_affected = conn
            .execute(
                &query,
                rusqlite::params_from_iter(params.iter().map(|s| s.as_str())),
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to update order")
                        .with_cause(e.to_string())
                        .with_context("order_id", id.to_string()),
                )
            })?;

        Ok(rows_affected)
    }

    /// Delete an order by ID
    pub fn delete_order(&self, id: i64) -> DbResult<usize> {
        let conn = self.get_conn()?;

        let rows_affected = conn
            .execute("DELETE FROM orders WHERE id = ?", [id])
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to delete order")
                        .with_cause(e.to_string())
                        .with_context("order_id", id.to_string()),
                )
            })?;

        Ok(rows_affected)
    }

    /// Get order by ID
    #[allow(dead_code)]
    pub fn get_order_by_id(&self, id: i64) -> DbResult<Option<Order>> {
        let conn = self.get_conn()?;

        let mut stmt = conn
            .prepare(
                "SELECT id, user_id, product_id, quantity, total_price, status, created_at 
                 FROM orders WHERE id = ?",
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to prepare order query")
                        .with_cause(e.to_string()),
                )
            })?;

        let order = stmt
            .query_row([id], |row| {
                Ok(Order {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    product_id: row.get(2)?,
                    quantity: row.get(3)?,
                    total_price: row.get(4)?,
                    status: row.get(5)?,
                    created_at: row.get(6)?,
                })
            })
            .optional()?;

        Ok(order)
    }

    /// Get orders by user ID
    #[allow(dead_code)]
    pub fn get_orders_by_user(&self, user_id: i64) -> DbResult<Vec<Order>> {
        let conn = self.get_conn()?;

        let mut stmt = conn
            .prepare(
                "SELECT id, user_id, product_id, quantity, total_price, status, created_at 
                 FROM orders WHERE user_id = ? ORDER BY created_at DESC",
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(
                        ErrorCode::DbQueryFailed,
                        "Failed to prepare user orders query",
                    )
                    .with_cause(e.to_string()),
                )
            })?;

        let orders = stmt.query_map([user_id], |row| {
            Ok(Order {
                id: row.get(0)?,
                user_id: row.get(1)?,
                product_id: row.get(2)?,
                quantity: row.get(3)?,
                total_price: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
            })
        })?;

        orders.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to query user orders")
                    .with_cause(e.to_string()),
            )
        })
    }

    /// Get orders by status
    #[allow(dead_code)]
    pub fn get_orders_by_status(&self, status: &str) -> DbResult<Vec<Order>> {
        let conn = self.get_conn()?;

        let mut stmt = conn
            .prepare(
                "SELECT id, user_id, product_id, quantity, total_price, status, created_at 
                 FROM orders WHERE status = ? ORDER BY created_at DESC",
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(
                        ErrorCode::DbQueryFailed,
                        "Failed to prepare status orders query",
                    )
                    .with_cause(e.to_string()),
                )
            })?;

        let orders = stmt.query_map([status], |row| {
            Ok(Order {
                id: row.get(0)?,
                user_id: row.get(1)?,
                product_id: row.get(2)?,
                quantity: row.get(3)?,
                total_price: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
            })
        })?;

        orders.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to query orders by status")
                    .with_cause(e.to_string()),
            )
        })
    }

    /// Get orders by product ID
    #[allow(dead_code)]
    pub fn get_orders_by_product(&self, product_id: i64) -> DbResult<Vec<Order>> {
        let conn = self.get_conn()?;

        let mut stmt = conn
            .prepare(
                "SELECT id, user_id, product_id, quantity, total_price, status, created_at 
                 FROM orders WHERE product_id = ? ORDER BY created_at DESC",
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(
                        ErrorCode::DbQueryFailed,
                        "Failed to prepare product orders query",
                    )
                    .with_cause(e.to_string()),
                )
            })?;

        let orders = stmt.query_map([product_id], |row| {
            Ok(Order {
                id: row.get(0)?,
                user_id: row.get(1)?,
                product_id: row.get(2)?,
                quantity: row.get(3)?,
                total_price: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
            })
        })?;

        orders.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to query product orders")
                    .with_cause(e.to_string()),
            )
        })
    }

    /// Update order status
    #[allow(dead_code)]
    pub fn update_order_status(&self, id: i64, status: &str) -> DbResult<usize> {
        let conn = self.get_conn()?;

        let rows_affected = conn
            .execute(
                "UPDATE orders SET status = ? WHERE id = ?",
                rusqlite::params![status, id],
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to update order status")
                        .with_cause(e.to_string())
                        .with_context("order_id", id.to_string()),
                )
            })?;

        Ok(rows_affected)
    }

    /// Get total revenue from all orders
    #[allow(dead_code)]
    pub fn get_total_revenue(&self) -> DbResult<f64> {
        let conn = self.get_conn()?;

        let revenue: Option<f64> = conn
            .query_row("SELECT SUM(total_price) FROM orders", [], |row| row.get(0))
            .optional()
            .map_err(|e: rusqlite::Error| {
                AppError::Database(
                    ErrorValue::new(
                        ErrorCode::DbQueryFailed,
                        "Failed to calculate total revenue",
                    )
                    .with_cause(e.to_string()),
                )
            })?;

        Ok(revenue.unwrap_or(0.0))
    }

    /// Get order count
    #[allow(dead_code)]
    pub fn get_order_count(&self) -> DbResult<i64> {
        let conn = self.get_conn()?;

        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM orders", [], |row| row.get(0))
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to count orders")
                        .with_cause(e.to_string()),
                )
            })?;

        Ok(count)
    }

    /// Insert sample orders only if database is empty
    ///
    /// This ensures data persistence - sample data is only added on first run.
    /// Users must explicitly delete data through the UI.
    pub fn insert_sample_orders_if_empty(&self) -> DbResult<bool> {
        // Check if database has any orders
        let existing_count = self.get_order_count()?;
        
        if existing_count > 0 {
            info!("Database already has {} orders, skipping sample data insertion", existing_count);
            return Ok(false); // Sample data not inserted (already has data)
        }

        info!("Database is empty, inserting sample orders...");
        
        // Get existing user and product IDs for sample orders
        let conn = self.get_conn()?;

        // Get first user ID
        let user_id: Option<i64> = conn
            .query_row("SELECT id FROM users LIMIT 1", [], |row| row.get(0))
            .optional()
            .ok()
            .flatten();

        // Get first product ID
        let product_id: Option<i64> = conn
            .query_row("SELECT id FROM products LIMIT 1", [], |row| row.get(0))
            .optional()
            .ok()
            .flatten();

        if let (Some(uid), Some(pid)) = (user_id, product_id) {
            let sample_orders = [
                (uid, pid, 2, 99.98, "Completed"),
                (uid, pid, 1, 49.99, "Pending"),
                (uid, pid, 3, 149.97, "Processing"),
                (uid, pid, 1, 1299.99, "Completed"),
                (uid, pid, 5, 249.95, "Shipped"),
            ];

            for (user_id, product_id, quantity, total_price, status) in sample_orders {
                let _ = self.insert_order(user_id, product_id, quantity, total_price, status);
            }
            
            info!("Sample orders insertion complete");
            return Ok(true);
        }

        info!("Cannot insert sample orders: missing users or products");
        Ok(false)
    }

    /// Insert sample orders (deprecated - use insert_sample_orders_if_empty instead)
    #[deprecated(note = "Use insert_sample_orders_if_empty to ensure data persistence")]
    pub fn insert_sample_orders(&self) -> DbResult<()> {
        self.insert_sample_orders_if_empty()?;
        Ok(())
    }

    /// Get database statistics
    pub fn get_database_stats(
        &self,
    ) -> DbResult<crate::core::infrastructure::database::models::DatabaseStats> {
        let conn = self.get_conn()?;

        let users_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0))
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to count users")
                        .with_cause(e.to_string()),
                )
            })?;

        let products_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM products", [], |row| row.get(0))
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to count products")
                        .with_cause(e.to_string()),
                )
            })?;

        let orders_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM orders", [], |row| row.get(0))
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to count orders")
                        .with_cause(e.to_string()),
                )
            })?;

        let total_revenue: f64 = conn
            .query_row("SELECT SUM(total_price) FROM orders", [], |row| {
                row.get::<_, Option<f64>>(0)
            })
            .optional()
            .map_err(|e: rusqlite::Error| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to calculate revenue")
                        .with_cause(e.to_string()),
                )
            })?
            .flatten()
            .unwrap_or(0.0);

        Ok(
            crate::core::infrastructure::database::models::DatabaseStats {
                users_count,
                products_count,
                orders_count,
                total_revenue,
            },
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_db() -> Database {
        let db = Database::new(":memory:").expect("Failed to create database");
        db.init().expect("Failed to init database");

        // Insert sample user and product for order tests
        db.insert_user("Test User", "test@example.com", "User", "Active")
            .expect("Failed to insert user");
        db.insert_product("Test Product", "A test product", 99.99, "Test", 10)
            .expect("Failed to insert product");

        db
    }

    #[test]
    fn test_insert_and_get_order() {
        let db = create_test_db();

        let order_id = db
            .insert_order(1, 1, 2, 199.98, "Pending")
            .expect("Failed to insert order");

        assert!(order_id > 0);

        let order = db
            .get_order_by_id(order_id)
            .expect("Failed to get order")
            .expect("Order not found");

        assert_eq!(order.user_id, 1);
        assert_eq!(order.product_id, 1);
        assert_eq!(order.quantity, 2);
        assert_eq!(order.total_price, 199.98);
    }

    #[test]
    fn test_update_order() {
        let db = create_test_db();

        let order_id = db
            .insert_order(1, 1, 1, 99.99, "Pending")
            .expect("Failed to insert order");

        let rows = db
            .update_order(
                order_id,
                Some(3),
                Some(299.97),
                Some("Completed".to_string()),
            )
            .expect("Failed to update order");

        assert_eq!(rows, 1);

        let order = db
            .get_order_by_id(order_id)
            .expect("Failed to get order")
            .expect("Order not found");

        assert_eq!(order.quantity, 3);
        assert_eq!(order.total_price, 299.97);
        assert_eq!(order.status, "Completed");
    }

    #[test]
    fn test_delete_order() {
        let db = create_test_db();

        let order_id = db
            .insert_order(1, 1, 1, 99.99, "Pending")
            .expect("Failed to insert order");

        let rows = db.delete_order(order_id).expect("Failed to delete order");
        assert_eq!(rows, 1);

        let order = db.get_order_by_id(order_id).expect("Failed to query");
        assert!(order.is_none());
    }

    #[test]
    fn test_get_orders_by_user() {
        let db = create_test_db();

        db.insert_order(1, 1, 1, 99.99, "Pending")
            .expect("Failed to insert order 1");
        db.insert_order(1, 1, 2, 199.98, "Completed")
            .expect("Failed to insert order 2");

        let orders = db.get_orders_by_user(1).expect("Failed to get orders");
        assert_eq!(orders.len(), 2);
    }

    #[test]
    fn test_get_total_revenue() {
        let db = create_test_db();

        db.insert_order(1, 1, 1, 99.99, "Completed")
            .expect("Failed to insert order 1");
        db.insert_order(1, 1, 2, 199.98, "Completed")
            .expect("Failed to insert order 2");

        let revenue = db.get_total_revenue().expect("Failed to get revenue");
        assert_eq!(revenue, 299.97);
    }
}
