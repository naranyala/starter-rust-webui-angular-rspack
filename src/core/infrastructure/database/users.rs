// src/core/infrastructure/database/users.rs
// User-specific database operations with connection pooling

use chrono::Local;
use log::{error, info};
use rusqlite::{params, OptionalExtension};

use super::connection::Database;
use super::models::User;
use crate::core::error::{AppError, ErrorCode, ErrorValue};

/// Database operation result type alias
type DbResult<T> = Result<T, AppError>;

impl Database {
    /// Get all users
    pub fn get_all_users(&self) -> DbResult<Vec<User>> {
        let conn = self.get_conn()?;

        let mut stmt = conn
            .prepare("SELECT id, name, email, role, status, created_at FROM users ORDER BY id")
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to prepare users query")
                        .with_cause(e.to_string())
                        .with_context("table", "users"),
                )
            })?;

        let users = stmt
            .query_map([], |row| {
                Ok(User {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    email: row.get(2)?,
                    role: row.get(3)?,
                    status: row.get(4)?,
                    created_at: row.get(5)?,
                })
            })
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to query users")
                        .with_cause(e.to_string()),
                )
            })?;

        users.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to collect users")
                    .with_cause(e.to_string()),
            )
        })
    }

    /// Insert a new user with validation
    pub fn insert_user(&self, name: &str, email: &str, role: &str, status: &str) -> DbResult<i64> {
        // Validate name
        if name.is_empty() {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::MissingRequiredField, "Name is required")
                    .with_field("name"),
            ));
        }
        
        // Validate name length (max 100 characters)
        if name.len() > 100 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Name must be less than 100 characters")
                    .with_field("name")
                    .with_context("max_length", "100"),
            ));
        }

        // Validate email
        if email.is_empty() {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::MissingRequiredField, "Email is required")
                    .with_field("email"),
            ));
        }
        
        // Validate email length (max 255 characters)
        if email.len() > 255 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Email must be less than 255 characters")
                    .with_field("email")
                    .with_context("max_length", "255"),
            ));
        }
        
        // Basic email format validation
        if !email.contains('@') || !email.contains('.') {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Invalid email format")
                    .with_field("email"),
            ));
        }

        // Validate role length
        if role.len() > 50 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Role must be less than 50 characters")
                    .with_field("role")
                    .with_context("max_length", "50"),
            ));
        }

        // Validate status length
        if status.len() > 20 {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Status must be less than 20 characters")
                    .with_field("status")
                    .with_context("max_length", "20"),
            ));
        }

        let conn = self.get_conn()?;

        let created_at = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

        conn.execute(
            "INSERT INTO users (name, email, role, status, created_at) VALUES (?, ?, ?, ?, ?)",
            params![name, email, role, status, created_at],
        )
        .map_err(|e| {
            if e.to_string().contains("UNIQUE constraint failed") {
                AppError::Database(
                    ErrorValue::new(
                        ErrorCode::DbAlreadyExists,
                        "User with this email already exists",
                    )
                    .with_field("email")
                    .with_context("email", email.to_string()),
                )
            } else {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to insert user")
                        .with_cause(e.to_string())
                        .with_context("operation", "insert_user"),
                )
            }
        })?;

        Ok(conn.last_insert_rowid())
    }

    /// Update an existing user
    pub fn update_user(
        &self,
        id: i64,
        name: Option<String>,
        email: Option<String>,
        role: Option<String>,
        status: Option<String>,
    ) -> DbResult<usize> {
        let conn = self.get_conn()?;

        // Build dynamic update query
        let mut updates = Vec::new();
        let mut params: Vec<&dyn rusqlite::ToSql> = Vec::new();

        if let Some(n) = &name {
            updates.push("name = ?");
            params.push(n);
        }
        if let Some(e) = &email {
            updates.push("email = ?");
            params.push(e);
        }
        if let Some(r) = &role {
            updates.push("role = ?");
            params.push(r);
        }
        if let Some(s) = &status {
            updates.push("status = ?");
            params.push(s);
        }

        if updates.is_empty() {
            return Ok(0); // Nothing to update
        }

        params.push(&id);

        let query = format!("UPDATE users SET {} WHERE id = ?", updates.join(", "));

        let rows_affected = conn.execute(&query, params.as_slice()).map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to update user")
                    .with_cause(e.to_string())
                    .with_context("user_id", id.to_string()),
            )
        })?;

        Ok(rows_affected)
    }

    /// Delete a user by ID
    pub fn delete_user(&self, id: i64) -> DbResult<usize> {
        let conn = self.get_conn()?;

        let rows_affected = conn
            .execute("DELETE FROM users WHERE id = ?", [id])
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to delete user")
                        .with_cause(e.to_string())
                        .with_context("user_id", id.to_string()),
                )
            })?;

        Ok(rows_affected)
    }

    /// Get user by ID
    #[allow(dead_code)]
    pub fn get_user_by_id(&self, id: i64) -> DbResult<Option<User>> {
        let conn = self.get_conn()?;

        let mut stmt = conn
            .prepare("SELECT id, name, email, role, status, created_at FROM users WHERE id = ?")
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to prepare user query")
                        .with_cause(e.to_string()),
                )
            })?;

        let user = stmt
            .query_row([id], |row| {
                Ok(User {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    email: row.get(2)?,
                    role: row.get(3)?,
                    status: row.get(4)?,
                    created_at: row.get(5)?,
                })
            })
            .optional()?;

        Ok(user)
    }

    /// Get user by email
    pub fn get_user_by_email(&self, email: &str) -> DbResult<Option<User>> {
        let conn = self.get_conn()?;

        let mut stmt = conn
            .prepare("SELECT id, name, email, role, status, created_at FROM users WHERE email = ?")
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to prepare user query")
                        .with_cause(e.to_string()),
                )
            })?;

        let user = stmt
            .query_row([email], |row| {
                Ok(User {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    email: row.get(2)?,
                    role: row.get(3)?,
                    status: row.get(4)?,
                    created_at: row.get(5)?,
                })
            })
            .optional()?;

        Ok(user)
    }

    /// Insert sample data only if database is empty
    /// 
    /// This ensures data persistence - sample data is only added on first run.
    /// Users must explicitly delete data through the UI.
    pub fn insert_sample_data_if_empty(&self) -> DbResult<bool> {
        // Check if database has any users
        let existing_count = self.get_user_count()?;
        
        if existing_count > 0 {
            info!("Database already has {} users, skipping sample data insertion", existing_count);
            return Ok(false); // Sample data not inserted (already has data)
        }

        info!("Database is empty, inserting sample data...");
        
        let sample_users = [
            ("Alice Johnson", "alice@example.com", "Admin", "Active"),
            ("Bob Smith", "bob@example.com", "User", "Active"),
            ("Charlie Brown", "charlie@example.com", "User", "Inactive"),
            ("Diana Prince", "diana@example.com", "Manager", "Active"),
            ("Eve Anderson", "eve@example.com", "User", "Active"),
        ];

        for (name, email, role, status) in sample_users {
            // Check if user exists (safety check)
            let user_exists: Result<Option<User>, AppError> = self.get_user_by_email(email);
            match user_exists {
                Ok(None) => {
                    let _ = self.insert_user(name, email, role, status)?;
                    info!("Inserted sample user: {}", email);
                }
                Ok(Some(_)) => {
                    // User already exists, skip
                }
                Err(e) => {
                    error!("Error checking user {}: {}", email, e);
                }
            }
        }

        info!("Sample data insertion complete");
        Ok(true) // Sample data was inserted
    }

    /// Insert sample data (deprecated - use insert_sample_data_if_empty instead)
    #[deprecated(note = "Use insert_sample_data_if_empty to ensure data persistence")]
    pub fn insert_sample_data(&self) -> DbResult<()> {
        self.insert_sample_data_if_empty()?;
        Ok(())
    }

    /// Get user count
    #[allow(dead_code)]
    pub fn get_user_count(&self) -> DbResult<i64> {
        let conn = self.get_conn()?;

        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0))
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to count users")
                        .with_cause(e.to_string()),
                )
            })?;

        Ok(count)
    }

    /// Search users by name or email
    #[allow(dead_code)]
    pub fn search_users(&self, query: &str) -> DbResult<Vec<User>> {
        let conn = self.get_conn()?;

        let search_pattern = format!("%{}%", query);

        let mut stmt = conn
            .prepare(
                "SELECT id, name, email, role, status, created_at 
                 FROM users 
                 WHERE name LIKE ? OR email LIKE ? 
                 ORDER BY id",
            )
            .map_err(|e| {
                AppError::Database(
                    ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to prepare search query")
                        .with_cause(e.to_string()),
                )
            })?;

        let users = stmt.query_map(params![search_pattern, search_pattern], |row| {
            Ok(User {
                id: row.get(0)?,
                name: row.get(1)?,
                email: row.get(2)?,
                role: row.get(3)?,
                status: row.get(4)?,
                created_at: row.get(5)?,
            })
        })?;

        users.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| {
            AppError::Database(
                ErrorValue::new(ErrorCode::DbQueryFailed, "Failed to search users")
                    .with_cause(e.to_string()),
            )
        })
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
    fn test_insert_and_get_user() {
        let db = create_test_db();

        let user_id = db
            .insert_user("Test User", "test@example.com", "User", "Active")
            .expect("Failed to insert user");

        assert!(user_id > 0);

        let user = db
            .get_user_by_id(user_id)
            .expect("Failed to get user")
            .expect("User not found");

        assert_eq!(user.name, "Test User");
        assert_eq!(user.email, "test@example.com");
    }

    #[test]
    fn test_duplicate_email_error() {
        let db = create_test_db();

        db.insert_user("User 1", "dup@example.com", "User", "Active")
            .expect("Failed to insert first user");

        let result = db.insert_user("User 2", "dup@example.com", "User", "Active");
        assert!(result.is_err());

        match result.unwrap_err() {
            AppError::Database(err) => {
                assert_eq!(err.code, ErrorCode::DbAlreadyExists);
            }
            _ => panic!("Expected Database error"),
        }
    }

    #[test]
    fn test_update_user() {
        let db = create_test_db();

        let user_id = db
            .insert_user("Original Name", "update@example.com", "User", "Active")
            .expect("Failed to insert user");

        let rows = db
            .update_user(
                user_id,
                Some("Updated Name".to_string()),
                None,
                Some("Admin".to_string()),
                None,
            )
            .expect("Failed to update user");

        assert_eq!(rows, 1);

        let user = db
            .get_user_by_id(user_id)
            .expect("Failed to get user")
            .expect("User not found");

        assert_eq!(user.name, "Updated Name");
        assert_eq!(user.role, "Admin");
    }

    #[test]
    fn test_delete_user() {
        let db = create_test_db();

        let user_id = db
            .insert_user("Delete Me", "delete@example.com", "User", "Active")
            .expect("Failed to insert user");

        let rows = db.delete_user(user_id).expect("Failed to delete user");
        assert_eq!(rows, 1);

        let user = db.get_user_by_id(user_id).expect("Failed to query");
        assert!(user.is_none());
    }

    #[test]
    fn test_search_users() {
        let db = create_test_db();

        db.insert_user("Alice Johnson", "alice@example.com", "Admin", "Active")
            .expect("Failed to insert Alice");
        db.insert_user("Bob Smith", "bob@example.com", "User", "Active")
            .expect("Failed to insert Bob");

        let results = db.search_users("alice").expect("Failed to search");
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "Alice Johnson");

        let results = db.search_users("example.com").expect("Failed to search");
        assert_eq!(results.len(), 2);
    }
}
