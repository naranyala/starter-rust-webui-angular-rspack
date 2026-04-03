// Legacy DI Container — DEPRECATED.
// All services are now managed by ServiceRegistry (core/service_registry.rs).
// This module is kept as a stub for backward compatibility and will be removed in a future version.

use std::sync::OnceLock;
use crate::core::infrastructure::logging::Logger;

pub struct Container {
    _logger: Logger,
}

impl Container {
    pub fn new() -> Self {
        Self { _logger: Logger::new() }
    }

    #[deprecated(since = "1.1.0", note = "Use ServiceRegistry instead")]
    pub fn register<T: 'static + Send + Sync>(&self, _instance: T) -> Result<(), String> {
        Ok(())
    }

    #[deprecated(since = "1.1.0", note = "Use ServiceRegistry instead")]
    pub fn register_singleton<T: 'static + Send + Sync>(&self, _service: T) -> Result<(), String> {
        Ok(())
    }
}

impl Default for Container {
    fn default() -> Self {
        Self::new()
    }
}

static GLOBAL_CONTAINER: OnceLock<Container> = OnceLock::new();

pub fn get_container() -> &'static Container {
    GLOBAL_CONTAINER.get_or_init(Container::new)
}

pub fn init_container() -> Result<(), String> {
    get_container();
    Ok(())
}
