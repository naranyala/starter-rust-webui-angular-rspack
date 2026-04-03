// Bootstrap Phase
// Initializes error handling, configuration, and logging.

use log::{error, info};

use crate::core::errors::AppResult;
use crate::core::errors::{AppError, ErrorValue, ErrorCode};
use crate::core::infrastructure::config::AppConfig;
use crate::core::infrastructure::di;
use crate::core::infrastructure::error_handler;
use crate::core::infrastructure::logging;

pub struct Bootstrap {
    pub config: AppConfig,
}

pub fn run() -> AppResult<Bootstrap> {
    error_handler::init_error_handling();
    info!("Error handling initialized");

    di::init_container().map_err(|e| {
        AppError::Configuration(
            ErrorValue::new(ErrorCode::InternalError, format!("DI init failed: {}", e)),
        )
    })?;
    info!("DI container initialized");

    let config = match AppConfig::load() {
        Ok(config) => {
            info!("Configuration loaded: {} v{}", config.get_app_name(), config.get_version());
            config
        }
        Err(e) => {
            error!("Failed to load config: {}, using defaults", e);
            AppConfig::default()
        }
    };

    // Legacy DI container — deprecated, kept as a no-op stub
    #[allow(deprecated)]
    let _ = di::get_container();

    logging::init_logging_with_config(
        Some(config.get_log_file()),
        config.get_log_level(),
        config.is_append_log(),
    )
    .map_err(|e| {
        error!("Failed to initialize logger: {}", e);
        AppError::Logging(
            ErrorValue::new(ErrorCode::InternalError, format!("Failed to initialize logging: {}", e)),
        )
    })?;

    info!("Logging initialized: level={}", config.get_log_level());
    info!("=============================================");
    info!("Starting: {} v{}", config.get_app_name(), config.get_version());
    info!("=============================================");
    config.log_communication_config();

    Ok(Bootstrap { config })
}
