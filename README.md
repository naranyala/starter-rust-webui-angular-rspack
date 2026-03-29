# Rust WebUI + Angular + Rspack Starter

A production-ready desktop application starter combining Rust backend performance with modern Angular frontend, featuring Clean Architecture, MVVM pattern, and comprehensive developer tooling.

---

## Quick Start

```bash
# Clone and run
git clone <repository-url>
cd starter-rust-webui-angular-rspack
./run.sh
```

### Common Commands

```bash
./run.sh --build            # Build frontend + backend
./run.sh --build-frontend   # Build frontend only
./run.sh --build-rust       # Build backend only
./run.sh --release          # Build optimized release
./run.sh --run              # Run existing build
./run.sh --clean            # Clean artifacts
./run.sh --rebuild          # Clean + rebuild
./run.sh --watch            # Development watch mode
./run.sh --help             # Show all options
```

---

## Features

### Architecture

- Clean Architecture (Rust backend) - Domain, Application, Infrastructure, Presentation layers
- MVVM Pattern (Angular frontend) - Models, ViewModels, Views separation
- Event-Driven Design - Pub/sub event bus for decoupled communication
- Repository Pattern - Testable data access with trait abstractions
- Dependency Injection - Type-safe service registration and resolution

### Backend (Rust)

- WebUI Integration - Native desktop windowing without Electron overhead
- SQLite Database - Embedded database with r2d2 connection pooling
- Enhanced Error Handling - Panic hooks, error tracking, terminal output
- Comprehensive Logging - Multi-sink logging with structured formatting
- Graceful Shutdown - SIGINT/SIGTERM signal handling with cleanup
- Cross-Platform - Windows, macOS, Linux support

### Frontend (Angular)

- Angular 21.1.5 - Latest Angular with Signals and modern features
- Rspack Bundler - Fast builds with code splitting
- Biome Linter - Fast Rust-based linting and formatting
- Error Interceptor - Global error catching and reporting
- Event Bus Service - Reactive event management
- DevTools Panel - Comprehensive debugging interface

### Developer Experience

- Hot Module Replacement - Fast development with live reload
- Type Safety - Full TypeScript typing with strict mode
- Code Quality - Biome linting and formatting enforced
- Build Orchestration - Automated build pipelines
- Comprehensive Documentation - Architecture, API, and usage guides

---

## Project Structure

```
starter-rust-webui-angular-rspack/

src/                          # Rust backend source
├── main.rs                   # Application entry point
└── core/                     # Clean Architecture
    ├── domain/               # Business entities & traits
    ├── application/          # Use cases & handlers
    ├── infrastructure/       # DB, logging, config, DI
    │   ├── database/         # SQLite with connection pooling
    │   ├── logging/          # Multi-sink logging
    │   ├── error_handler.rs  # Enhanced error handling
    │   ├── ctrlc_handler.rs  # Graceful shutdown
    │   └── di.rs             # Dependency injection
    └── presentation/         # WebUI integration
        └── webui/handlers/   # Event handlers

frontend/                     # Angular frontend
├── src/
│   ├── core/                 # Core services
│   │   ├── api.service.ts
│   │   ├── event-bus.service.ts
│   │   ├── shared-state.service.ts
│   │   ├── message-queue.service.ts
│   │   ├── broadcast.service.ts
│   │   ├── logger.service.ts
│   │   └── storage.service.ts
│   ├── views/                # Components
│   │   ├── dashboard/
│   │   ├── home/
│   │   ├── auth/
│   │   ├── sqlite/
│   │   └── devtools/
│   ├── models/               # Data models
│   └── types/                # TypeScript types
├── angular.json              # Angular CLI config
├── rspack.config.js          # Rspack bundler config
└── biome.json                # Biome linter config

config/                       # Runtime configuration
└── app.config.toml           # Application config

docs/                         # Documentation
├── 00-index.md               # Documentation index
├── 01-overview.md            # Project overview
├── 02-architecture.md        # Architecture guide
├── 03-changelog.md           # Changelog
├── 04-build-system.md        # Build system guide
├── 05-development-workflow.md # Development workflow
├── demo_sqlite_crud.md       # SQLite CRUD demo
├── demo_duckdb_crud.md       # DuckDB CRUD demo
├── demo_checklist.md         # Interactive checklist
├── demo_features.md          # Feature checklist
└── demo_websocket.md         # WebSocket demo (planned)

thirdparty/                   # Third-party libraries
└── webui-c-src/              # WebUI C source
```

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Rust | 1.93+ | Core language |
| WebUI | 2.5.0-beta.4 | Desktop windowing |
| SQLite | 0.32 | Embedded database |
| r2d2 | 0.8 | Connection pooling |
| serde | 1.0 | Serialization |
| log | 0.4 | Logging facade |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 21.1.5 | UI framework |
| TypeScript | 5.9 | Type safety |
| Rspack | 1.7.6 | Bundler |
| Biome | 2.4.4 | Linter/formatter |
| Bun | 1.3 | Package manager |
| WinBox | 0.2.82 | Window management |

---

## Installation

### Prerequisites

- Rust 1.93+ ([install](https://rustup.rs))
- Bun 1.3+ ([install](https://bun.sh))
- Node.js 18+ (optional, Bun can be used instead)

### Setup

```bash
# Clone repository
git clone <repository-url>
cd starter-rust-webui-angular-rspack

# Install frontend dependencies
cd frontend
bun install
cd ..

# Build and run
./run.sh
```

### Platform-Specific Requirements

#### Linux

```bash
# WebKit2GTK (required for WebUI)
sudo apt install libwebkit2gtk-4.1-dev  # Debian/Ubuntu
sudo dnf install webkit2gtk4.1-devel   # Fedora
```

#### macOS

```bash
# Xcode Command Line Tools
xcode-select --install
```

#### Windows

```bash
# Visual Studio Build Tools
# WebView2 runtime (included in Windows 10+)
```

---

## Configuration

### Application Config (config/app.config.toml)

```toml
[app]
name = "Rust WebUI SQLite Demo"
version = "1.0.0"

[window]
title = "Rust WebUI Application"
width = 1280
height = 800

[database]
path = "app.db"
create_sample_data = true

[logging]
level = "info"
file = "logs/application.log"
append = true
max_size_mb = 10
max_files = 5

[communication]
transport = "webview_ffi"
serialization = "json"
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| RUST_LOG | Log level | info |
| RUSTWEBUI_DIST_DIR | Custom dist directory | ./dist |

---

## Testing

### Backend Tests

```bash
cd frontend
cargo test
```

### Frontend Tests

```bash
cd frontend
bun run test
```

### E2E Tests

```bash
cd frontend
bun run test:e2e
```

### Linting

```bash
cd frontend
bun run lint      # Check
bun run lint:fix  # Auto-fix
```

### Formatting

```bash
cd frontend
bun run format      # Check
bun run format:fix  # Auto-fix
```

---

## Deployment

### Development Build

```bash
./run.sh --build
```

### Release Build

```bash
./run.sh --release
```

### Distribution Package

```bash
./build-dist.sh build-release
```

Output will be in `target/release/` with platform-specific packaging.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](docs/01-overview.md) | Installation, setup, and first run |
| [Architecture](docs/02-architecture.md) | System architecture and design patterns |
| [Changelog](docs/03-changelog.md) | Recent changes and improvements |
| [Build System](docs/04-build-system.md) | Build pipeline and deployment |
| [Development Workflow](docs/05-development-workflow.md) | Set up your dev environment |
| [Error Handling](ERROR_HANDLING_GUIDE.md) | Comprehensive error handling guide |
| [Third-Party Dependencies](THIRDPARTY_VERSIONS.md) | Complete dependency reference |

---

## Key Capabilities

### Desktop Application Features

- Native window management with WinBox integration
- System information monitoring
- File system operations
- Database CRUD operations
- Real-time event bus communication

### Developer Tools

- DevTools Panel (5 tabs):
  - Backend - Stats, logs, bindings
  - Frontend - Events, errors, memory
  - Events - Event history and payloads
  - Environment - Browser info, features
  - Actions - Test scenarios, benchmarks

- Error Dashboard - Visual error tracking
- Console Logging - Structured error output
- Performance Benchmarks - Event bus, signals

### Data Management

- SQLite database with connection pooling
- User management (CRUD operations)
- Product management (CRUD operations)
- Order management (CRUD operations)
- Event history tracking
- Log aggregation and retrieval

---

## Troubleshooting

### Common Issues

#### Build Fails with "module not found"

```bash
# Clean and rebuild
./run.sh --clean
./run.sh --rebuild
```

#### Frontend Build Errors

```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules bun.lock
bun install
```

#### Database Errors

```bash
# Remove and recreate database
rm app.db
./run.sh
```

#### WebUI Window Not Showing

- Ensure WebKit2GTK is installed (Linux)
- Check WebView2 runtime (Windows)
- Verify port is not in use

### Getting Help

1. Check [documentation](docs/)
2. Review [ERROR_HANDLING_GUIDE.md](ERROR_HANDLING_GUIDE.md)
3. Inspect application logs in `logs/application.log`
4. Check DevTools panel for runtime errors

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Quality Standards

- All code must pass `bun run lint` and `bun run format`
- Backend code must pass `cargo clippy`
- New features should include tests
- Documentation should be updated for API changes

---

## Performance Benchmarks

| Metric | Value | Notes |
|--------|-------|-------|
| Frontend Build Time | ~30s | Production build |
| Backend Build Time | ~45s | Debug profile |
| Cold Start Time | ~2s | First launch |
| Memory Usage | ~50MB | Idle application |
| Event Bus Throughput | 10,000+ events/sec | Benchmark test |

---

## Recent Changes (2026-03-29)

### Critical Improvements

- Removed 6 pairs of duplicate Angular services (~800 lines)
- Replaced 86 unsafe `.unwrap()` calls with proper error handling
- Deleted 3 orphaned experimental directories
- Reduced Rust dependencies by 75% (80+ to ~20 packages)
- Implemented Repository pattern for testable data access
- Integrated DI container properly throughout application
- Added graceful shutdown handling (SIGINT/SIGTERM)
- Created comprehensive third-party documentation
- Implemented log rotation configuration
- Updated .gitignore with comprehensive coverage

See [CHANGELOG](docs/03-changelog.md) for complete details.

---

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with Rust and Angular
