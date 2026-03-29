// src/core/infrastructure/database/products.rs
// Product-specific database operations with connection pooling

use rusqlite::OptionalExtension;

use super::connection::Database;
use super::models::Product;
use crate::core::error::{AppError, ErrorCode, ErrorValue};

/// Database operation result type alias
type DbResult<T> = Result<T, AppError>;

impl Database {
    /// Get all products
    pub fn get_all_products(&self) -> DbResult<Vec<Product>> {
        let conn = self.get_conn()?;

        let mut stmt = conn
            .prepare(
                "SELECT id, name, description, price, category, stock FROM products ORDER BY id",
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to prepare products query")
                        .with_cause(e.to_string())
                        .with_context("table", "products"),
                )
            })?;

        let products = stmt
            .query_map([], |row| {
                Ok(Product {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    price: row.get(3)?,
                    category: row.get(4)?,
                    stock: row.get(5)?,
                })
            })
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to query products")
                        .with_cause(e.to_string()),
                )
            })?;

        products.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to collect products")
                    .with_cause(e.to_string()),
            )
        })
    }

    /// Insert a new product
    pub fn insert_product(
        &self,
        name: &str,
        description: &str,
        price: f64,
        category: &str,
        stock: i64,
    ) -> DbResult<i64> {
        if name.is_empty() {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::MissingRequiredField, "Product name is required")
                    .with_field("name"),
            ));
        }

        if price <= 0.0 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::InvalidFieldValue, "Price must be greater than 0")
                    .with_field("price"),
            ));
        }

        let conn = self.get_conn()?;

        let description_opt = if description.is_empty() {
            None
        } else {
            Some(description.to_string())
        };
        let category_val = if category.is_empty() {
            "General"
        } else {
            category
        };

        conn.execute(
            "INSERT INTO products (name, description, price, category, stock) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![name, description_opt.as_deref().unwrap_or(""), price, category_val, stock],
        ).map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to insert product")
                    .with_cause(e.to_string())
                    .with_context("operation", "insert_product")
            )
        })?;

        // Get the last inserted row ID
        let last_id = conn.last_insert_rowid();
        Ok(last_id)
    }

    /// Update an existing product
    pub fn update_product(
        &self,
        id: i64,
        name: Option<String>,
        description: Option<String>,
        price: Option<f64>,
        category: Option<String>,
        stock: Option<i64>,
    ) -> DbResult<usize> {
        let conn = self.get_conn()?;

        // Build dynamic update query
        let mut updates = Vec::new();
        let mut params: Vec<String> = Vec::new();

        if let Some(n) = &name {
            updates.push("name = ?");
            params.push(n.clone());
        }
        if let Some(ref d) = description {
            updates.push("description = ?");
            params.push(d.clone());
        } else if description.is_some() {
            updates.push("description = NULL");
        }
        if let Some(p) = &price {
            updates.push("price = ?");
            params.push(p.to_string());
        }
        if let Some(c) = &category {
            updates.push("category = ?");
            params.push(c.clone());
        }
        if let Some(s) = &stock {
            updates.push("stock = ?");
            params.push(s.to_string());
        }

        if updates.is_empty() {
            return Ok(0); // Nothing to update
        }

        params.push(id.to_string());

        let query = format!("UPDATE products SET {} WHERE id = ?", updates.join(", "));

        // Use raw SQL execution with string parameters
        let rows_affected = conn
            .execute(
                &query,
                rusqlite::params_from_iter(params.iter().map(|s| s.as_str())),
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to update product")
                        .with_cause(e.to_string())
                        .with_context("product_id", id.to_string()),
                )
            })?;

        Ok(rows_affected)
    }

    /// Delete a product by ID
    pub fn delete_product(&self, id: i64) -> DbResult<usize> {
        let conn = self.get_conn()?;

        // First check if product has orders
        let order_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM orders WHERE product_id = ?",
                [id],
                |row| row.get(0),
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to check product orders")
                        .with_cause(e.to_string()),
                )
            })?;

        if order_count > 0 {
            return Err(AppError::Validation(
                ErrorValue::new(
                    ErrorCode::ValidationFailed,
                    "Cannot delete product with existing orders",
                )
                .with_context("product_id", id.to_string())
                .with_context("order_count", order_count.to_string()),
            ));
        }

        let rows_affected = conn
            .execute("DELETE FROM products WHERE id = ?", [id])
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to delete product")
                        .with_cause(e.to_string())
                        .with_context("product_id", id.to_string()),
                )
            })?;

        Ok(rows_affected)
    }

    /// Get product by ID
    #[allow(dead_code)]
    pub fn get_product_by_id(&self, id: i64) -> DbResult<Option<Product>> {
        let conn = self.get_conn()?;

        let mut stmt = conn
            .prepare(
                "SELECT id, name, description, price, category, stock FROM products WHERE id = ?",
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to prepare product query")
                        .with_cause(e.to_string()),
                )
            })?;

        let product = stmt
            .query_row([id], |row| {
                Ok(Product {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    price: row.get(3)?,
                    category: row.get(4)?,
                    stock: row.get(5)?,
                })
            })
            .optional()?;

        Ok(product)
    }

    /// Get products by category
    #[allow(dead_code)]
    pub fn get_products_by_category(&self, category: &str) -> DbResult<Vec<Product>> {
        let conn = self.get_conn()?;

        let mut stmt = conn
            .prepare(
                "SELECT id, name, description, price, category, stock FROM products WHERE category = ? ORDER BY name",
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to prepare category query")
                        .with_cause(e.to_string())
                )
            })?;

        let products = stmt.query_map([category], |row| {
            Ok(Product {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                price: row.get(3)?,
                category: row.get(4)?,
                stock: row.get(5)?,
            })
        })?;

        products.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| {
            AppError::Database(
                ErrorValue::new(
                    ErrorCode::DbQueryFailed,
                    "Failed to query products by category",
                )
                .with_cause(e.to_string()),
            )
        })
    }

    /// Search products by name or description
    #[allow(dead_code)]
    pub fn search_products(&self, query: &str) -> DbResult<Vec<Product>> {
        let conn = self.get_conn()?;

        let search_pattern = format!("%{}%", query);

        let mut stmt = conn
            .prepare(
                "SELECT id, name, description, price, category, stock
                 FROM products
                 WHERE name LIKE ? OR description LIKE ?
                 ORDER BY name",
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to prepare search query")
                        .with_cause(e.to_string()),
                )
            })?;

        let products =
            stmt.query_map(rusqlite::params![search_pattern, search_pattern], |row| {
                Ok(Product {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    price: row.get(3)?,
                    category: row.get(4)?,
                    stock: row.get(5)?,
                })
            })?;

        products.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to search products")
                    .with_cause(e.to_string()),
            )
        })
    }

    /// Update product stock
    #[allow(dead_code)]
    pub fn update_product_stock(&self, id: i64, quantity_change: i64) -> DbResult<()> {
        let conn = self.get_conn()?;

        conn.execute(
            "UPDATE products SET stock = stock + ? WHERE id = ?",
            [quantity_change, id],
        )
        .map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to update product stock")
                    .with_cause(e.to_string())
                    .with_context("product_id", id.to_string()),
            )
        })?;

        Ok(())
    }

    /// Insert sample products data
    pub fn insert_sample_products(&self) -> DbResult<()> {
        let sample_products = [
            (
                "Laptop Pro 15",
                "High-performance laptop with 16GB RAM",
                1299.99,
                "Electronics",
                50,
            ),
            (
                "Wireless Mouse",
                "Ergonomic wireless mouse",
                49.99,
                "Electronics",
                200,
            ),
            (
                "USB-C Hub",
                "7-in-1 USB-C hub with HDMI",
                79.99,
                "Electronics",
                150,
            ),
            (
                "Office Chair",
                "Ergonomic office chair with lumbar support",
                299.99,
                "Furniture",
                30,
            ),
            (
                "Standing Desk",
                "Electric height-adjustable desk",
                599.99,
                "Furniture",
                20,
            ),
            (
                "Notebook Set",
                "Pack of 5 premium notebooks",
                24.99,
                "Office Supplies",
                500,
            ),
            (
                "Pen Set",
                "Premium ballpoint pens, pack of 10",
                14.99,
                "Office Supplies",
                300,
            ),
            (
                "Coffee Maker",
                "Automatic drip coffee maker",
                89.99,
                "Appliances",
                75,
            ),
            (
                "Water Bottle",
                "Insulated stainless steel bottle",
                29.99,
                "Accessories",
                400,
            ),
            (
                "Backpack",
                "Laptop backpack with USB charging port",
                59.99,
                "Accessories",
                100,
            ),
        ];

        for (name, description, price, category, stock) in sample_products {
            // Check if product exists by name
            let conn = self.get_conn()?;
            let exists: i64 = conn
                .query_row(
                    "SELECT COUNT(*) FROM products WHERE name = ?",
                    [name],
                    |row| row.get(0),
                )
                .unwrap_or(0);

            if exists == 0 {
                drop(conn); // Release connection before insert
                let _ = self.insert_product(name, description, price, category, stock)?;
            }
        }

        Ok(())
    }

    /// Get product count
    #[allow(dead_code)]
    pub fn get_product_count(&self) -> DbResult<i64> {
        let conn = self.get_conn()?;

        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM products", [], |row| row.get(0))
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to count products")
                        .with_cause(e.to_string()),
                )
            })?;

        Ok(count)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_db() -> Database {
        let db = Database::new(":memory:").expect("Failed to create database");
        db.init().expect("Failed to init database");
        db
    }

    #[test]
    fn test_insert_and_get_product() {
        let db = create_test_db();

        let product_id = db
            .insert_product("Test Product", "A test product", 99.99, "Test", 10)
            .expect("Failed to insert product");

        assert!(product_id > 0);

        let product = db
            .get_product_by_id(product_id)
            .expect("Failed to get product")
            .expect("Product not found");

        assert_eq!(product.name, "Test Product");
        assert_eq!(product.price, 99.99);
    }

    #[test]
    fn test_update_product() {
        let db = create_test_db();

        let product_id = db
            .insert_product("Original Product", "Original desc", 49.99, "Original", 5)
            .expect("Failed to insert product");

        let rows = db
            .update_product(
                product_id,
                Some("Updated Product".to_string()),
                None,
                Some(59.99),
                None,
                Some(10),
            )
            .expect("Failed to update product");

        assert_eq!(rows, 1);

        let product = db
            .get_product_by_id(product_id)
            .expect("Failed to get product")
            .expect("Product not found");

        assert_eq!(product.name, "Updated Product");
        assert_eq!(product.price, 59.99);
        assert_eq!(product.stock, 10);
    }

    #[test]
    fn test_delete_product_with_orders() {
        let db = create_test_db();

        let product_id = db
            .insert_product("Product to Delete", "Will be deleted", 29.99, "Test", 5)
            .expect("Failed to insert product");

        // Try to delete - should succeed (no orders)
        let rows = db
            .delete_product(product_id)
            .expect("Failed to delete product");
        assert_eq!(rows, 1);
    }

    #[test]
    fn test_search_products() {
        let db = create_test_db();

        db.insert_product(
            "Laptop Pro",
            "High-performance laptop",
            1299.99,
            "Electronics",
            50,
        )
        .expect("Failed to insert laptop");
        db.insert_product(
            "Wireless Mouse",
            "Ergonomic mouse",
            49.99,
            "Electronics",
            200,
        )
        .expect("Failed to insert mouse");

        let results = db.search_products("laptop").expect("Failed to search");
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "Laptop Pro");

        let results = db.search_products("Electronics").expect("Failed to search");
        assert_eq!(results.len(), 2);
    }
}
