# Rust WebUI + Angular + Rspack Starter

A production-ready desktop application framework combining Rust backend performance with modern Angular frontend, featuring Clean Architecture, MVVM pattern, dual database support (SQLite and DuckDB), and comprehensive developer tooling.

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
- Dual Database Support - SQLite for transactional workloads, DuckDB for analytics
- Enhanced Error Handling - Panic hooks, error tracking, terminal output
- Comprehensive Logging - Multi-sink logging with structured formatting
- Graceful Shutdown - SIGINT/SIGTERM signal handling with cleanup
- Cross-Platform - Windows, macOS, Linux support

### Frontend (Angular)

- Angular 21.2+ - Latest Angular with Signals and modern features
- Rspack Bundler - Fast builds with code splitting
- Biome Linter - Fast Rust-based linting and formatting
- Error Interceptor - Global error catching and reporting
- Event Bus Service - Reactive event management
- DevTools Panel - Comprehensive debugging interface
- Vega Charts Integration - Professional data visualization

### Developer Experience

- Hot Module Replacement - Fast development with live reload
- Type Safety - Full TypeScript typing with strict mode
- Code Quality - Biome linting and formatting enforced
- Build Orchestration - Automated build pipelines
- Comprehensive Documentation - Architecture, API, and usage guides
- Dynamic Documentation Menu - Auto-generated from markdown files

---

## Database Options

This project supports two embedded database engines, each optimized for different use cases:

### SQLite - Transactional Workloads

SQLite is a lightweight, embedded relational database ideal for:

- **User Management** - CRUD operations for user accounts
- **Order Processing** - Transactional order management
- **Configuration Storage** - Application settings and preferences
- **Session Management** - User sessions and state

**Characteristics:**
- ACID-compliant transactions
- Row-oriented storage
- Optimized for point queries and updates
- Mature ecosystem with extensive tooling
- Single-file database format

**Use SQLite when:**
- You need reliable transaction support
- Your workload involves frequent updates
- You need foreign key constraints
- You're building traditional CRUD applications

**Implementation:**
```rust
// SQLite connection with pooling
let db = Database::new("app.db")?;
let users = db.get_all_users()?;
```

### DuckDB - Analytical Workloads

DuckDB is an embedded analytical database optimized for:

- **Data Analytics** - Complex aggregations and OLAP queries
- **Business Intelligence** - Reporting and dashboards
- **Data Science** - Statistical analysis and machine learning
- **Large Dataset Processing** - Efficient columnar processing

**Characteristics:**
- Columnar vectorized execution
- Optimized for analytical queries
- Excellent compression ratios
- SQL-92 support with analytical extensions
- Single-file database format

**Use DuckDB when:**
- You need to process large datasets
- Your workload involves complex aggregations
- You're building analytics dashboards
- You need fast analytical queries

**Implementation:**
```rust
// DuckDB for analytical queries
let conn = duckdb::Connection::open("analytics.db")?;
let stats = conn.query("SELECT category, AVG(price) FROM products GROUP BY category")?;
```

### Database Comparison

| Feature | SQLite | DuckDB |
|---------|--------|--------|
| Storage Model | Row-oriented | Column-oriented |
| Best For | OLTP | OLAP |
| Transactions | Full ACID | Limited |
| Analytics | Basic | Advanced |
| Compression | Moderate | Excellent |
| Update Performance | Excellent | Good |
| Query Performance | Good (point) | Excellent (analytical) |

### Choosing the Right Database

**Choose SQLite for:**
- User management systems
- Order processing applications
- Configuration storage
- Session management
- Traditional CRUD applications

**Choose DuckDB for:**
- Analytics dashboards
- Business intelligence reports
- Data science applications
- Large dataset processing
- Complex aggregations

**Use Both when:**
- You need transactional integrity AND analytical capabilities
- Your application has mixed workloads
- You want to separate operational and analytical data

---

## Project Structure

```
starter-rust-webui-angular-rspack/

src/                          # Rust backend source
├── main.rs                   # Application entry point
└── core/                     # Clean Architecture
    ├── domain/               # Business entities & traits
    ├── application/          # Use cases & services
    │   └── services/         # Business logic services
    ├── infrastructure/       # DB, logging, config, DI
    │   ├── database/         # SQLite & DuckDB implementations
    │   ├── logging/          # Multi-sink logging
    │   ├── error_handler.rs  # Enhanced error handling
    │   ├── ctrlc_handler.rs  # Graceful shutdown
    │   └── di.rs             # Dependency injection
    └── presentation/         # WebUI integration
        └── webui/handlers/   # Event handlers

frontend/                     # Angular frontend
├── src/
│   ├── core/                 # Core services
│   │   ├── backend.service.ts       # Unified backend communication
│   │   ├── docs.service.ts          # Documentation service
│   │   ├── vega.service.ts          # Chart rendering service
│   │   ├── confirm-modal.service.ts # Confirmation dialogs
│   │   ├── secure-logger.service.ts # Sanitized logging
│   │   └── ...
│   ├── views/                # Components
│   │   ├── dashboard/        # Main dashboard
│   │   ├── sqlite/           # SQLite demos
│   │   ├── duckdb/           # DuckDB demos
│   │   ├── vega-charts/      # Vega chart demos
│   │   ├── database/         # Database management
│   │   └── ...
│   ├── app/
│   │   └── constants/        # App constants & manifests
│   │       ├── docs-manifest.ts     # Auto-generated docs manifest
│   │       ├── api-contract.ts      # API contract definitions
│   │       └── theme.ts             # Design system theme
│   └── ...
├── angular.json              # Angular CLI config
├── rspack.config.js          # Rspack bundler config
└── biome.json                # Biome linter config

config/                       # Runtime configuration
└── app.config.toml           # Application config

docs/                         # Documentation
├── README.md                 # This file
├── SECURITY_AUDIT_*.md       # Security audit reports
├── VEGA_CHARTS_INTEGRATION.md # Vega charts guide
├── DYNAMIC_DOCS_MENU.md      # Dynamic documentation system
├── DATA_PERSISTENCE_GUIDE.md # Data persistence guide
└── ...

scripts/                      # Build and utility scripts
└── generate-docs-manifest.js # Documentation manifest generator
```

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Rust | 1.93+ | Core language |
| WebUI | 2.5.0-beta.4 | Desktop windowing |
| SQLite | 0.32 | Transactional database |
| DuckDB | Latest | Analytical database |
| r2d2 | 0.8 | Connection pooling |
| serde | 1.0 | Serialization |
| log | 0.4 | Logging facade |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 21.2+ | UI framework |
| TypeScript | 5.9+ | Type safety |
| Rspack | 1.7.6 | Bundler |
| Biome | 2.4.4 | Linter/formatter |
| Bun | 1.3+ | Package manager |
| Vega | 6.2.0 | Visualization runtime |
| Vega-Lite | 6.4.2 | Chart grammar |
| Vega-Embed | 7.1.0 | Chart embedding |

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
name = "Rust WebUI Application"
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
| DATABASE_BACKUP_DIR | Backup directory | ./backups |

---

## Testing

### Backend Tests

```bash
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

### Security Tests

```bash
cd frontend
bun test security.test.ts
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

### Secure Deployment

For production deployment security guidelines, see [docs/SECURE_DEPLOYMENT.md](docs/SECURE_DEPLOYMENT.md).

---

## Documentation

### Core Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](docs/01-GETTING_STARTED.md) | Quick start guide |
| [SQLite CRUD Guide](docs/02-sqlite-crud-production.md) | SQLite implementation |
| [DuckDB CRUD Guide](docs/03-duckdb-crud-production.md) | DuckDB implementation |
| [API Reference](docs/04-api-reference.md) | API documentation |
| [Security Best Practices](docs/05-security-best-practices.md) | Security patterns |
| [Deployment Guide](docs/06-deployment-production.md) | Production deployment |

### Technical Guides

| Document | Description |
|----------|-------------|
| [Vega Charts Integration](docs/VEGA_CHARTS_INTEGRATION.md) | Chart visualization guide |
| [Dynamic Documentation Menu](docs/DYNAMIC_DOCS_MENU.md) | Auto-generated docs system |
| [Data Persistence Guide](docs/DATA_PERSISTENCE_GUIDE.md) | Data persistence patterns |
| [Refactoring Documentation](docs/REFACTORING.md) | Code refactoring guide |

### Security Documentation

| Document | Description |
|----------|-------------|
| [Security Audit Plan](docs/SECURITY_AUDIT_PLAN.md) | Security audit methodology |
| [Security Audit Findings](docs/SECURITY_AUDIT_FINDINGS.md) | Detailed findings report |
| [Security Audit Summary](docs/SECURITY_AUDIT_SUMMARY.md) | Executive summary |
| [Security Remediation](docs/SECURITY_REMEDIATION_COMPLETE.md) | Remediation report |

---

## Key Capabilities

### Desktop Application Features

- Native window management with WinBox integration
- System information monitoring
- File system operations
- Database CRUD operations (SQLite and DuckDB)
- Real-time event bus communication
- Data visualization with Vega charts

### Developer Tools

- DevTools Panel with multiple tabs:
  - Backend - Stats, logs, bindings
  - Frontend - Events, errors, memory
  - Events - Event history and payloads
  - Environment - Browser info, features
  - Actions - Test scenarios, benchmarks

- Error Dashboard - Visual error tracking
- Console Logging - Structured error output
- Performance Benchmarks - Event bus, signals

### Data Management

- SQLite database with connection pooling for transactional workloads
- DuckDB integration for analytical queries
- User management (CRUD operations)
- Product management (CRUD operations)
- Order management (CRUD operations)
- Event history tracking
- Log aggregation and retrieval
- Database backup and restore
- Integrity verification

### Data Visualization

- Vega-Lite chart rendering
- Multiple chart types:
  - Bar charts (simple, stacked, grouped)
  - Line charts (single, multi-line)
  - Area charts
  - Scatter plots
  - Pie and donut charts
- Interactive tooltips
- Responsive design
- Dark theme optimization

### Security Features

- Input validation (length, format, range)
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized output)
- Function name allowlisting
- Secure logging (PII redaction)
- Type-to-confirm delete validation
- Dependency vulnerability scanning
- Security test suite

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

#### Documentation Not Loading

```bash
# Regenerate documentation manifest
cd ..
node scripts/generate-docs-manifest.js
```

### Getting Help

1. Check [documentation](docs/)
2. Review [ERROR_HANDLING_GUIDE.md](ERROR_HANDLING_GUIDE.md)
3. Inspect application logs in `logs/application.log`
4. Check DevTools panel for runtime errors
5. Review security audit reports for known issues

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
- Security implications should be documented

### Security Requirements

- All user input must be validated
- Database queries must use parameterized statements
- Sensitive data must not be logged
- Dependencies must be kept up to date
- Security tests must pass

---

## Performance Benchmarks

| Metric | Value | Notes |
|--------|-------|-------|
| Frontend Build Time | ~30s | Production build |
| Backend Build Time | ~45s | Debug profile |
| Cold Start Time | ~2s | First launch |
| Memory Usage | ~50MB | Idle application |
| Event Bus Throughput | 10,000+ events/sec | Benchmark test |
| Chart Render Time | <100ms | Vega charts |
| Documentation Load | Instant | Pre-generated manifest |

---

## Recent Changes

### 2026-03-31

- Added Vega-Lite chart integration with 5 chart types
- Implemented dynamic documentation menu system
- Added security audit and remediation
- Implemented input validation across all endpoints
- Added secure logging service with PII redaction
- Created type-to-confirm delete validation
- Added function name allowlisting for API calls
- Generated comprehensive security documentation

### 2026-03-29

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
