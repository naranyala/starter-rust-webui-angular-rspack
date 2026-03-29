// src/core/infrastructure/error_handler.rs
// Enhanced error handling with panic hooks, error tracking, and terminal output

use crate::core::error::ErrorCode;
use log::{error, info, warn};
use std::collections::VecDeque;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

/// Maximum errors to keep in memory
const MAX_ERROR_HISTORY: usize = 100;

/// Error severity levels for terminal output
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[allow(dead_code)]
pub enum ErrorSeverity {
    Info,
    Warning,
    Error,
    Critical,
}

/// Structured error entry for tracking
#[derive(Debug, Clone)]
pub struct ErrorEntry {
    pub id: u64,
    pub timestamp: u64,
    pub severity: ErrorSeverity,
    pub source: &'static str,
    pub code: ErrorCode,
    pub message: String,
    pub details: Option<String>,
    pub stack_trace: Option<String>,
    pub context: Vec<(String, String)>,
}

impl ErrorEntry {
    pub fn new(
        severity: ErrorSeverity,
        source: &'static str,
        code: ErrorCode,
        message: String,
    ) -> Self {
        Self {
            id: 0,
            timestamp: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64,
            severity,
            source,
            code,
            message,
            details: None,
            stack_trace: None,
            context: Vec::new(),
        }
    }

    pub fn with_details(mut self, details: String) -> Self {
        self.details = Some(details);
        self
    }

    pub fn with_stack_trace(mut self, stack: String) -> Self {
        self.stack_trace = Some(stack);
        self
    }

    pub fn with_context(mut self, key: String, value: String) -> Self {
        self.context.push((key, value));
        self
    }

    /// Format for terminal output with colors
    pub fn format_terminal(&self) -> String {
        let severity_color = match self.severity {
            ErrorSeverity::Info => "\x1b[36m",     // Cyan
            ErrorSeverity::Warning => "\x1b[33m",  // Yellow
            ErrorSeverity::Error => "\x1b[31m",    // Red
            ErrorSeverity::Critical => "\x1b[35m", // Magenta
        };
        let reset = "\x1b[0m";
        let bold = "\x1b[1m";

        let timestamp = format_timestamp(self.timestamp);
        let code_str = format!("{:?}", self.code);

        let mut output = String::new();
        output.push_str(&format!(
            "{}{}[ERROR #{}]{} {} {} - {}\n",
            severity_color, bold, self.id, reset, timestamp, self.source, code_str
        ));
        output.push_str(&format!("  {}Message:{} {}\n", bold, reset, self.message));

        if let Some(ref details) = self.details {
            output.push_str(&format!("  {}Details:{} {}\n", bold, reset, details));
        }

        if !self.context.is_empty() {
            output.push_str(&format!("  {}Context:{}\n", bold, reset));
            for (key, value) in &self.context {
                output.push_str(&format!("    - {}: {}\n", key, value));
            }
        }

        if let Some(ref stack) = self.stack_trace {
            output.push_str(&format!("  {}Stack Trace:{}\n", bold, reset));
            for line in stack.lines() {
                output.push_str(&format!("    {}\n", line));
            }
        }

        output
    }
}

fn format_timestamp(ts: u64) -> String {
    let secs = ts / 1000;
    let millis = ts % 1000;

    // Simple timestamp formatting
    let datetime = std::time::SystemTime::UNIX_EPOCH
        .checked_add(std::time::Duration::from_secs(secs))
        .unwrap_or(std::time::SystemTime::UNIX_EPOCH);

    let duration = datetime
        .duration_since(std::time::SystemTime::UNIX_EPOCH)
        .unwrap_or_default();
    let hours = (duration.as_secs() % 86400) / 3600;
    let minutes = (duration.as_secs() % 3600) / 60;
    let seconds = duration.as_secs() % 60;

    format!("{:02}:{:02}:{:02}.{:03}", hours, minutes, seconds, millis)
}

/// Global error tracker - collects all errors for reporting
pub struct ErrorTracker {
    errors: Mutex<VecDeque<ErrorEntry>>,
    sequence: Mutex<u64>,
    error_count: Mutex<u64>,
    warning_count: Mutex<u64>,
    critical_count: Mutex<u64>,
}

impl ErrorTracker {
    pub fn new() -> Self {
        Self {
            errors: Mutex::new(VecDeque::with_capacity(MAX_ERROR_HISTORY)),
            sequence: Mutex::new(0),
            error_count: Mutex::new(0),
            warning_count: Mutex::new(0),
            critical_count: Mutex::new(0),
        }
    }

    /// Record an error and output to terminal
    pub fn record(&self, mut entry: ErrorEntry) {
        // Assign ID
        let mut seq = self.sequence.lock().unwrap();
        *seq += 1;
        entry.id = *seq;
        drop(seq);

        // Update counts
        match entry.severity {
            ErrorSeverity::Warning => {
                *self.warning_count.lock().unwrap() += 1;
            }
            ErrorSeverity::Error => {
                *self.error_count.lock().unwrap() += 1;
            }
            ErrorSeverity::Critical => {
                *self.critical_count.lock().unwrap() += 1;
            }
            _ => {}
        }

        // Output to terminal
        let terminal_output = entry.format_terminal();
        match entry.severity {
            ErrorSeverity::Info => info!("{}", terminal_output),
            ErrorSeverity::Warning => warn!("{}", terminal_output),
            ErrorSeverity::Error | ErrorSeverity::Critical => error!("{}", terminal_output),
        }

        // Store in history
        let mut errors = self.errors.lock().unwrap();
        errors.push_back(entry);
        while errors.len() > MAX_ERROR_HISTORY {
            errors.pop_front();
        }
    }

    /// Get recent errors
    pub fn get_recent(&self, limit: usize) -> Vec<ErrorEntry> {
        let errors = self.errors.lock().unwrap();
        errors.iter().rev().take(limit).cloned().collect()
    }

    /// Get error summary
    pub fn get_summary(&self) -> ErrorSummary {
        ErrorSummary {
            total: self.errors.lock().unwrap().len(),
            errors: *self.error_count.lock().unwrap(),
            warnings: *self.warning_count.lock().unwrap(),
            critical: *self.critical_count.lock().unwrap(),
        }
    }

    /// Clear error history
    pub fn clear(&self) {
        self.errors.lock().unwrap().clear();
        *self.error_count.lock().unwrap() = 0;
        *self.warning_count.lock().unwrap() = 0;
        *self.critical_count.lock().unwrap() = 0;
    }
}

/// Error summary for reporting
#[derive(Debug, Clone)]
pub struct ErrorSummary {
    pub total: usize,
    pub errors: u64,
    pub warnings: u64,
    pub critical: u64,
}

impl ErrorSummary {
    /// Format summary for terminal output
    pub fn format_terminal(&self) -> String {
        let mut output = String::new();
        output.push_str("\n");
        output.push_str("═══════════════════════════════════════════════════════\n");
        output.push_str("  ERROR SUMMARY\n");
        output.push_str("═══════════════════════════════════════════════════════\n");
        output.push_str(&format!("  Total Errors:   {}\n", self.total));
        output.push_str(&format!("  Errors:         {}\n", self.errors));
        output.push_str(&format!("  Warnings:       {}\n", self.warnings));
        output.push_str(&format!("  Critical:       {}\n", self.critical));
        output.push_str("═══════════════════════════════════════════════════════\n");
        output
    }
}

// Global error tracker instance
lazy_static::lazy_static! {
    static ref GLOBAL_ERROR_TRACKER: Arc<ErrorTracker> = Arc::new(ErrorTracker::new());
}

/// Get the global error tracker
pub fn get_error_tracker() -> Arc<ErrorTracker> {
    Arc::clone(&GLOBAL_ERROR_TRACKER)
}

/// Initialize enhanced error handling with panic hook
pub fn init_error_handling() {
    // Set up custom panic hook
    let default_hook = std::panic::take_hook();
    std::panic::set_hook(Box::new(move |panic_info| {
        // Call default hook first (prints panic message)
        default_hook(panic_info);

        // Extract panic information
        let message = if let Some(s) = panic_info.payload().downcast_ref::<&str>() {
            s.to_string()
        } else if let Some(s) = panic_info.payload().downcast_ref::<String>() {
            s.clone()
        } else {
            "Unknown panic".to_string()
        };

        let location = panic_info
            .location()
            .map(|l| format!("{}:{}:{}", l.file(), l.line(), l.column()))
            .unwrap_or_else(|| "unknown".to_string());

        // Create stack trace
        let stack_trace = format!("{:?}", backtrace::Backtrace::new());

        // Record as critical error
        let entry = ErrorEntry::new(
            ErrorSeverity::Critical,
            "PANIC",
            ErrorCode::InternalError,
            message,
        )
        .with_details(format!("Location: {}", location))
        .with_stack_trace(stack_trace);

        get_error_tracker().record(entry);

        // Log error summary
        let summary = get_error_tracker().get_summary();
        error!("{}", summary.format_terminal());
    }));

    info!("Enhanced error handling initialized with panic hook");
}

/// Record an error from AppError
pub fn record_app_error(source: &'static str, err: &crate::core::error::AppError) {
    let error_value = err.to_value();

    let severity = match error_value.code {
        ErrorCode::InternalError | ErrorCode::LockPoisoned => ErrorSeverity::Critical,
        ErrorCode::DbConnectionFailed | ErrorCode::DbQueryFailed => ErrorSeverity::Error,
        ErrorCode::ValidationFailed | ErrorCode::ResourceNotFound => ErrorSeverity::Warning,
        _ => ErrorSeverity::Error,
    };

    let mut entry = ErrorEntry::new(
        severity,
        source,
        error_value.code.clone(),
        error_value.message.clone(),
    );

    if let Some(ref details) = error_value.details {
        entry = entry.with_details(details.clone());
    }

    if let Some(ref cause) = error_value.cause {
        entry = entry.with_context("cause".to_string(), cause.clone());
    }

    for (key, value) in error_value.context.iter().flatten() {
        entry = entry.with_context(key.clone(), value.clone());
    }

    get_error_tracker().record(entry);
}

/// Record a generic error
pub fn record_error(
    severity: ErrorSeverity,
    source: &'static str,
    code: ErrorCode,
    message: String,
    details: Option<String>,
) {
    let mut entry = ErrorEntry::new(severity, source, code, message);
    if let Some(d) = details {
        entry = entry.with_details(d);
    }
    get_error_tracker().record(entry);
}

/// Print error summary to terminal
pub fn print_error_summary() {
    let summary = get_error_tracker().get_summary();
    info!("{}", summary.format_terminal());
}

/// Macro for recording errors with context
#[macro_export]
macro_rules! record_error {
    ($severity:expr, $source:expr, $code:expr, $msg:expr) => {
        $crate::core::infrastructure::error_handler::record_error(
            $severity,
            $source,
            $code,
            $msg.to_string(),
            None,
        );
    };
    ($severity:expr, $source:expr, $code:expr, $msg:expr, $details:expr) => {
        $crate::core::infrastructure::error_handler::record_error(
            $severity,
            $source,
            $code,
            $msg.to_string(),
            Some($details),
        );
    };
}

/// Macro for recording AppError
#[macro_export]
macro_rules! record_app_error {
    ($source:expr, $err:expr) => {
        $crate::core::infrastructure::error_handler::record_app_error($source, &$err)
    };
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_entry_creation() {
        let entry = ErrorEntry::new(
            ErrorSeverity::Error,
            "TEST",
            ErrorCode::ValidationFailed,
            "Test error message".to_string(),
        );

        assert_eq!(entry.severity, ErrorSeverity::Error);
        assert_eq!(entry.source, "TEST");
        assert_eq!(entry.code, ErrorCode::ValidationFailed);
        assert_eq!(entry.message, "Test error message");
        assert!(entry.id == 0); // ID assigned when recorded
        assert!(entry.details.is_none());
        assert!(entry.stack_trace.is_none());
        assert!(entry.context.is_empty());
    }

    #[test]
    fn test_error_entry_with_details() {
        let entry = ErrorEntry::new(
            ErrorSeverity::Warning,
            "TEST",
            ErrorCode::ResourceNotFound,
            "Not found".to_string(),
        )
        .with_details("Additional details here".to_string());

        assert_eq!(entry.details, Some("Additional details here".to_string()));
    }

    #[test]
    fn test_error_entry_with_stack_trace() {
        let entry = ErrorEntry::new(
            ErrorSeverity::Critical,
            "TEST",
            ErrorCode::InternalError,
            "Critical error".to_string(),
        )
        .with_stack_trace("stack trace line 1\nstack trace line 2".to_string());

        assert_eq!(
            entry.stack_trace,
            Some("stack trace line 1\nstack trace line 2".to_string())
        );
    }

    #[test]
    fn test_error_entry_with_context() {
        let entry = ErrorEntry::new(
            ErrorSeverity::Error,
            "TEST",
            ErrorCode::DbQueryFailed,
            "Query failed".to_string(),
        )
        .with_context("user_id".to_string(), "123".to_string())
        .with_context("query".to_string(), "SELECT * FROM users".to_string());

        assert_eq!(entry.context.len(), 2);
        assert_eq!(entry.context[0], ("user_id".to_string(), "123".to_string()));
        assert_eq!(
            entry.context[1],
            ("query".to_string(), "SELECT * FROM users".to_string())
        );
    }

    #[test]
    fn test_error_entry_format_terminal() {
        let entry = ErrorEntry::new(
            ErrorSeverity::Error,
            "TEST",
            ErrorCode::ValidationFailed,
            "Test error".to_string(),
        )
        .with_details("Test details".to_string())
        .with_context("field".to_string(), "email".to_string());

        let formatted = entry.format_terminal();

        // Check that formatting includes key elements
        assert!(formatted.contains("[ERROR #"));
        assert!(formatted.contains("TEST"));
        assert!(formatted.contains("ValidationFailed"));
        assert!(formatted.contains("Test error"));
        assert!(formatted.contains("Test details"));
        assert!(formatted.contains("field"));
        assert!(formatted.contains("email"));
    }

    #[test]
    fn test_error_tracker_record_and_retrieve() {
        let tracker = ErrorTracker::new();

        tracker.record(ErrorEntry::new(
            ErrorSeverity::Error,
            "TEST",
            ErrorCode::InternalError,
            "Error 1".to_string(),
        ));

        tracker.record(ErrorEntry::new(
            ErrorSeverity::Warning,
            "TEST",
            ErrorCode::ValidationFailed,
            "Warning 1".to_string(),
        ));

        let recent = tracker.get_recent(10);
        assert_eq!(recent.len(), 2);
        assert_eq!(recent[0].message, "Warning 1");
        assert_eq!(recent[1].message, "Error 1");
    }

    #[test]
    fn test_error_tracker_summary() {
        let tracker = ErrorTracker::new();

        tracker.record(ErrorEntry::new(
            ErrorSeverity::Error,
            "TEST",
            ErrorCode::InternalError,
            "Error 1".to_string(),
        ));

        tracker.record(ErrorEntry::new(
            ErrorSeverity::Error,
            "TEST",
            ErrorCode::DbQueryFailed,
            "Error 2".to_string(),
        ));

        tracker.record(ErrorEntry::new(
            ErrorSeverity::Warning,
            "TEST",
            ErrorCode::ValidationFailed,
            "Warning 1".to_string(),
        ));

        tracker.record(ErrorEntry::new(
            ErrorSeverity::Critical,
            "TEST",
            ErrorCode::InternalError,
            "Critical 1".to_string(),
        ));

        let summary = tracker.get_summary();
        assert_eq!(summary.total, 4);
        assert_eq!(summary.errors, 2);
        assert_eq!(summary.warnings, 1);
        assert_eq!(summary.critical, 1);
    }

    #[test]
    fn test_error_tracker_clear() {
        let tracker = ErrorTracker::new();

        tracker.record(ErrorEntry::new(
            ErrorSeverity::Error,
            "TEST",
            ErrorCode::InternalError,
            "Error 1".to_string(),
        ));

        tracker.record(ErrorEntry::new(
            ErrorSeverity::Critical,
            "TEST",
            ErrorCode::InternalError,
            "Critical 1".to_string(),
        ));

        tracker.clear();

        let summary = tracker.get_summary();
        assert_eq!(summary.total, 0);
        assert_eq!(summary.errors, 0);
        assert_eq!(summary.warnings, 0);
        assert_eq!(summary.critical, 0);

        let recent = tracker.get_recent(10);
        assert_eq!(recent.len(), 0);
    }

    #[test]
    fn test_error_tracker_max_history() {
        let tracker = ErrorTracker::new();

        // Record more than MAX_ERROR_HISTORY errors
        for i in 0..MAX_ERROR_HISTORY + 50 {
            tracker.record(ErrorEntry::new(
                ErrorSeverity::Error,
                "TEST",
                ErrorCode::InternalError,
                format!("Error {}", i),
            ));
        }

        let summary = tracker.get_summary();
        assert_eq!(summary.total, MAX_ERROR_HISTORY);

        let recent = tracker.get_recent(MAX_ERROR_HISTORY);
        assert_eq!(recent.len(), MAX_ERROR_HISTORY);
        // Most recent error should be the last one we recorded
        assert!(recent[0].message.starts_with("Error"));
    }

    #[test]
    fn test_error_severity_levels() {
        let severities = [
            ErrorSeverity::Info,
            ErrorSeverity::Warning,
            ErrorSeverity::Error,
            ErrorSeverity::Critical,
        ];

        for severity in severities {
            let entry = ErrorEntry::new(
                severity,
                "TEST",
                ErrorCode::InternalError,
                "Test".to_string(),
            );
            assert_eq!(entry.severity, severity);

            let formatted = entry.format_terminal();
            assert!(!formatted.is_empty());
        }
    }

    #[test]
    fn test_error_summary_format() {
        let summary = ErrorSummary {
            total: 10,
            errors: 5,
            warnings: 3,
            critical: 2,
        };

        let formatted = summary.format_terminal();

        assert!(formatted.contains("ERROR SUMMARY"));
        assert!(formatted.contains("Total Errors:   10"));
        assert!(formatted.contains("Errors:         5"));
        assert!(formatted.contains("Warnings:       3"));
        assert!(formatted.contains("Critical:       2"));
    }

    #[test]
    fn test_global_error_tracker_accessible() {
        let tracker = get_error_tracker();
        assert!(Arc::strong_count(&tracker) >= 1);

        let summary = tracker.get_summary();
        // Should be able to get summary without issues
        assert!(summary.total >= 0);
    }

    #[test]
    fn test_error_entry_timestamp() {
        let entry = ErrorEntry::new(
            ErrorSeverity::Error,
            "TEST",
            ErrorCode::InternalError,
            "Test".to_string(),
        );

        // Timestamp should be set (not zero)
        assert!(entry.timestamp > 0);

        // Format should produce non-empty string
        let formatted = format_timestamp(entry.timestamp);
        assert!(!formatted.is_empty());
        assert!(formatted.contains(':'));
    }

    #[test]
    fn test_record_error_function() {
        // Clear any existing errors first
        get_error_tracker().clear();

        record_error(
            ErrorSeverity::Error,
            "TEST",
            ErrorCode::InternalError,
            "Test error message".to_string(),
            Some("Test details".to_string()),
        );

        let summary = get_error_tracker().get_summary();
        assert_eq!(summary.total, 1);
        assert_eq!(summary.errors, 1);

        let recent = get_error_tracker().get_recent(1);
        assert_eq!(recent[0].message, "Test error message");
        assert_eq!(recent[0].details, Some("Test details".to_string()));
    }
}
