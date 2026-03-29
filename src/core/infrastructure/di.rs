// Dependency Injection Container
// Type-based service registry for infrastructure services
//
// Usage:
// 1. Initialize container with init_container()
// 2. Register services: container.register_singleton(service)?
// 3. Resolve services: let repo = container.resolve_arc::<dyn UserRepository>()?

use std::any::{Any, TypeId};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use crate::core::domain::traits::{
    ConfigRepository, OrderRepository, ProductRepository, UserRepository,
};
use crate::core::error::{AppError, AppResult, ErrorCode, ErrorValue};
use crate::core::infrastructure::database::{Database, FileConfigRepository};
use crate::core::infrastructure::logging::Logger;

/// DI Container for infrastructure services
/// Uses type-based resolution with trait objects for testability
pub struct Container {
    services: Mutex<HashMap<TypeId, Arc<dyn Any + Send + Sync>>>,
}

impl Container {
    pub fn new() -> Self {
        Self {
            services: Mutex::new(HashMap::new()),
        }
    }

    /// Register a service instance
    pub fn register<T: 'static + Send + Sync>(&self, instance: T) -> AppResult<()> {
        let type_id = TypeId::of::<T>();
        let mut services = self.services.lock().map_err(|e| {
            AppError::LockPoisoned(
                ErrorValue::new(
                    ErrorCode::LockPoisoned,
                    "Failed to acquire DI container lock",
                )
                .with_cause(e.to_string())
                .with_context("operation", "register"),
            )
        })?;
        services.insert(type_id, Arc::new(instance));
        Ok(())
    }

    /// Register a service as a singleton (alias for register)
    pub fn register_singleton<T: 'static + Send + Sync>(&self, service: T) -> AppResult<()>
    where
        T: Send + Sync + 'static,
    {
        self.register(service)
    }

    /// Register a trait object (for repository traits)
    pub fn register_trait<T: 'static + Send + Sync>(&self, instance: T) -> AppResult<()> {
        self.register(instance)
    }

    /// Resolve a concrete type
    pub fn resolve<T: 'static + Clone>(&self) -> AppResult<T> {
        let type_id = TypeId::of::<T>();
        let services = self.services.lock().map_err(|e| {
            AppError::LockPoisoned(
                ErrorValue::new(
                    ErrorCode::LockPoisoned,
                    "Failed to acquire DI container lock",
                )
                .with_cause(e.to_string())
                .with_context("operation", "resolve"),
            )
        })?;

        services
            .get(&type_id)
            .and_then(|service| service.downcast_ref::<T>().cloned())
            .ok_or_else(|| {
                AppError::DependencyInjection(
                    ErrorValue::new(ErrorCode::InternalError, "Service not found in container")
                        .with_context("service", std::any::type_name::<T>()),
                )
            })
    }

    /// Resolve a trait object as Arc
    pub fn resolve_arc<T: 'static + Send + Sync + ?Sized>(&self) -> AppResult<Arc<T>> {
        let type_id = TypeId::of::<Arc<T>>();
        let services = self.services.lock().map_err(|e| {
            AppError::LockPoisoned(
                ErrorValue::new(
                    ErrorCode::LockPoisoned,
                    "Failed to acquire DI container lock",
                )
                .with_cause(e.to_string())
                .with_context("operation", "resolve_arc"),
            )
        })?;

        services
            .get(&type_id)
            .and_then(|service| service.clone().downcast::<T>().ok())
            .ok_or_else(|| {
                AppError::DependencyInjection(
                    ErrorValue::new(ErrorCode::InternalError, "Service not found in container")
                        .with_context("service", std::any::type_name::<T>()),
                )
            })
    }

    /// Check if a service is registered
    pub fn has<T: 'static>(&self) -> bool {
        let type_id = TypeId::of::<T>();
        match self.services.lock() {
            Ok(services) => services.contains_key(&type_id),
            Err(_) => false,
        }
    }
}

impl Default for Container {
    fn default() -> Self {
        Self::new()
    }
}

// Global container instance
use std::sync::OnceLock;

static GLOBAL_CONTAINER: OnceLock<Container> = OnceLock::new();

/// Get the global container instance
pub fn get_container() -> &'static Container {
    GLOBAL_CONTAINER.get_or_init(|| Container::new())
}

/// Initialize the DI container with infrastructure services
/// Call this once at application startup
pub fn init_container() -> AppResult<()> {
    let container = get_container();

    // Register logger
    container.register(Logger::new())?;

    Ok(())
}

/// Initialize container with database and repositories
/// Call this after creating the Database instance
pub fn register_infrastructure_services(db: Arc<Database>) -> AppResult<()> {
    let container = get_container();

    // Register Database as concrete type
    container.register_singleton(Arc::clone(&db))?;

    // Register Database as repository trait implementations
    // Database implements UserRepository, ProductRepository, OrderRepository
    container.register_trait(Arc::clone(&db) as Arc<dyn UserRepository>)?;
    container.register_trait(Arc::clone(&db) as Arc<dyn ProductRepository>)?;
    container.register_trait(Arc::clone(&db) as Arc<dyn OrderRepository>)?;

    // Register config repository
    container.register_trait(FileConfigRepository)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_container_register_and_resolve() {
        let container = Container::new();
        container
            .register(42i32)
            .expect("Failed to register service");

        assert_eq!(container.resolve::<i32>().expect("Failed to resolve"), 42);
    }

    #[test]
    fn test_singleton_registration() {
        let container = Container::new();
        let service = String::from("test");
        container
            .register_singleton(service)
            .expect("Failed to register");

        let resolved: Arc<String> = container.resolve_arc().expect("Failed to resolve");
        assert_eq!(*resolved, "test");
    }

    #[test]
    fn test_has_service() {
        let container = Container::new();
        assert!(!container.has::<i32>());

        container.register(42i32).expect("Failed to register");
        assert!(container.has::<i32>());
    }
}
