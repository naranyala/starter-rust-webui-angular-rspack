//! UserService — user CRUD with validation and business logic.

use std::sync::Arc;

use crate::core::errors::{AppError, AppResult, ErrorCode, ErrorValue};
use crate::core::database::models::{User, UserStats};
use crate::core::database::Database;

pub struct UserService {
    db: Arc<Database>,
}

impl UserService {
    pub fn new(db: Arc<Database>) -> Self {
        Self { db }
    }

    pub fn get_all_users(&self) -> AppResult<Vec<User>> {
        self.db.get_all_users()
    }

    pub fn get_user_by_id(&self, id: i64) -> AppResult<User> {
        self.db
            .get_user_by_id(id)?
            .ok_or_else(|| {
                AppError::NotFound(
                    ErrorValue::new(ErrorCode::ResourceNotFound, "User not found")
                        .with_field("id")
                        .with_context("id", &id.to_string()),
                )
            })
    }

    pub fn create_user(&self, name: &str, email: &str, role: &str, status: &str) -> AppResult<i64> {
        Self::validate_name(name)?;
        Self::validate_email(email)?;

        if let Ok(Some(_existing)) = self.db.get_user_by_email(email) {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::DuplicateEntry, "Email already exists")
                    .with_field("email")
                    .with_context("email", email),
            ));
        }

        self.db.insert_user(name, email, role, status)
    }

    pub fn update_user(
        &self,
        id: i64,
        name: Option<&str>,
        email: Option<&str>,
        role: Option<&str>,
        status: Option<&str>,
    ) -> AppResult<User> {
        self.get_user_by_id(id)?;

        if let Some(new_email) = email {
            Self::validate_email(new_email)?;
            if let Ok(Some(existing)) = self.db.get_user_by_email(new_email) {
                if existing.id != id {
                    return Err(AppError::Validation(
                        ErrorValue::new(ErrorCode::DuplicateEntry, "Email already exists")
                            .with_field("email")
                            .with_context("email", new_email),
                    ));
                }
            }
        }

        if let Some(new_name) = name {
            Self::validate_name(new_name)?;
        }

        self.db.update_user(
            id,
            name.map(String::from),
            email.map(String::from),
            role.map(String::from),
            status.map(String::from),
        )?;

        self.get_user_by_id(id)
    }

    pub fn delete_user(&self, id: i64) -> AppResult<()> {
        self.get_user_by_id(id)?;
        self.db.delete_user(id)?;
        Ok(())
    }

    pub fn get_user_stats(&self) -> AppResult<UserStats> {
        let users = self.get_all_users()?;
        let total_users = users.len();
        let active_users = users.iter().filter(|u| u.status == "Active").count();
        let admin_users = users.iter().filter(|u| u.role == "Admin").count();
        let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
        let today_count = users
            .iter()
            .filter(|u| u.created_at.starts_with(&today))
            .count();

        Ok(UserStats {
            total_users: total_users as i64,
            active_users: active_users as i64,
            admin_users: admin_users as i64,
            today_count: today_count as i64,
        })
    }

    // ─── Validation ─────────────────────────────────────────────────────

    fn validate_name(name: &str) -> AppResult<()> {
        if name.trim().is_empty() {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Name is required")
                    .with_field("name"),
            ));
        }
        if name.len() > 100 {
            return Err(AppError::Validation(
                ErrorValue::new(
                    ErrorCode::ValidationFailed,
                    "Name must be less than 100 characters",
                )
                .with_field("name"),
            ));
        }
        Ok(())
    }

    fn validate_email(email: &str) -> AppResult<()> {
        if email.trim().is_empty() {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Email is required")
                    .with_field("email"),
            ));
        }
        if !email.contains('@') || !email.contains('.') {
            return Err(AppError::Validation(
                ErrorValue::new(ErrorCode::ValidationFailed, "Invalid email format")
                    .with_field("email"),
            ));
        }
        if email.len() > 255 {
            return Err(AppError::Validation(
                ErrorValue::new(
                    ErrorCode::ValidationFailed,
                    "Email must be less than 255 characters",
                )
                .with_field("email"),
            ));
        }
        Ok(())
    }
}
