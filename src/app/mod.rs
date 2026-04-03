/// Application orchestration module
///
/// Split into three phases:
/// - `bootstrap` — error handling, config, logging
/// - `startup`   — database, sample data, context init
/// - `runtime`   — window creation, handlers, event loop

pub mod bootstrap;
pub mod runtime;
pub mod startup;
