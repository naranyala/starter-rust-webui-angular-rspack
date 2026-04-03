//! Error types — flat module, no DDD layers.
//! Used by all services and handlers.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fmt;

// ─── Error Codes ────────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ErrorCode {
    DbConnectionFailed = 1000,
    DbQueryFailed = 1001,
    DbConstraintViolation = 1002,
    DbNotFound = 1003,
    DbAlreadyExists = 1004,
    DuplicateEntry = 1005,
    ConfigNotFound = 2000,
    ConfigInvalid = 2001,
    ConfigMissingField = 2002,
    SerializationFailed = 3000,
    DeserializationFailed = 3001,
    InvalidFormat = 3002,
    ValidationFailed = 4000,
    MissingRequiredField = 4001,
    InvalidFieldValue = 4002,
    ResourceNotFound = 5000,
    UserNotFound = 5001,
    EntityNotFound = 5002,
    LockPoisoned = 6000,
    InternalError = 6999,
    Unknown = 9999,
}

impl fmt::Display for ErrorCode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

// ─── Error Value (cross-boundary) ───────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorValue {
    pub code: ErrorCode,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub field: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cause: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<HashMap<String, String>>,
}

impl ErrorValue {
    pub fn new(code: ErrorCode, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
            details: None,
            field: None,
            cause: None,
            context: None,
        }
    }

    pub fn with_details(mut self, details: impl Into<String>) -> Self {
        self.details = Some(details.into());
        self
    }

    pub fn with_field(mut self, field: impl Into<String>) -> Self {
        self.field = Some(field.into());
        self
    }

    pub fn with_cause(mut self, cause: impl Into<String>) -> Self {
        self.cause = Some(cause.into());
        self
    }

    pub fn with_context(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.context
            .get_or_insert_with(HashMap::new)
            .insert(key.into(), value.into());
        self
    }

    pub fn to_response(&self) -> serde_json::Value {
        let mut map = serde_json::Map::new();
        map.insert("code".to_string(), serde_json::json!(self.code.to_string()));
        map.insert("message".to_string(), serde_json::json!(self.message));
        if let Some(ref d) = self.details {
            map.insert("details".to_string(), serde_json::json!(d));
        }
        if let Some(ref fld) = self.field {
            map.insert("field".to_string(), serde_json::json!(fld));
        }
        if let Some(ref c) = self.cause {
            map.insert("cause".to_string(), serde_json::json!(c));
        }
        if let Some(ref ctx) = self.context {
            map.insert("context".to_string(), serde_json::json!(ctx));
        }
        serde_json::Value::Object(map)
    }
}

impl fmt::Display for ErrorValue {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "[{}] {}", self.code, self.message)?;
        if let Some(ref d) = self.details {
            write!(f, " ({})", d)?;
        }
        Ok(())
    }
}

// ─── AppError ───────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub enum AppError {
    Database(ErrorValue),
    DependencyInjection(ErrorValue),
    EventBus(ErrorValue),
    Logging(ErrorValue),
    Configuration(ErrorValue),
    Serialization(ErrorValue),
    Validation(ErrorValue),
    NotFound(ErrorValue),
    LockPoisoned(ErrorValue),
}

impl AppError {
    pub fn to_value(&self) -> &ErrorValue {
        match self {
            AppError::Database(v) => v,
            AppError::DependencyInjection(v) => v,
            AppError::EventBus(v) => v,
            AppError::Logging(v) => v,
            AppError::Configuration(v) => v,
            AppError::Serialization(v) => v,
            AppError::Validation(v) => v,
            AppError::NotFound(v) => v,
            AppError::LockPoisoned(v) => v,
        }
    }

    pub fn to_json(&self) -> serde_json::Value {
        self.to_value().to_response()
    }
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_value())
    }
}

impl std::error::Error for AppError {}

impl From<rusqlite::Error> for AppError {
    fn from(err: rusqlite::Error) -> Self {
        AppError::Database(
            ErrorValue::new(ErrorCode::DbQueryFailed, err.to_string())
                .with_cause("SQLite operation failed"),
        )
    }
}

pub type AppResult<T> = Result<T, AppError>;
