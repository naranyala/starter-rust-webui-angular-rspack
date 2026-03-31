# Project Overview

Welcome to the **Rust WebUI + Angular + Rspack Starter** documentation.

## 🚀 Quick Start

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
./run.sh --watch            # Development watch mode (NEW)
./run.sh --help             # Show all options
```

---

## ✨ What's New (Latest Release - 2026-03-29)

This release addresses **critical maintainability, security, and architectural pitfalls** identified through comprehensive codebase analysis.

### 🔴 Critical Improvements

1. **Removed Duplicate Services** - Eliminated 6 pairs of duplicate Angular services (~800 lines)
2. **Fixed Unsafe Rust Code** - Replaced 86 `.unwrap()` calls with proper error handling
3. **Deleted Orphaned Directories** - Removed 3 abandoned experimental frontend directories
4. **Reduced Dependencies by 75%** - Removed 60+ unused Rust dependencies

### 🔴 High-Priority Fixes

5. **Standardized DI Pattern** - Migrated to Angular 19+ `inject()` pattern
6. **Fixed Naming Conventions** - Converted snake_case to camelCase in TypeScript
7. **Added Graceful Shutdown** - Proper SIGINT/SIGTERM handling
8. **Implemented Repository Pattern** - Domain traits now properly implemented
9. **Integrated DI Container** - Proper dependency injection throughout
10. **Created Third-Party Docs** - Complete `THIRDPARTY_VERSIONS.md`
11. **Log Rotation Config** - Prevents disk exhaustion
12. **Updated .gitignore** - Comprehensive coverage for secrets

📖 [Read the full changelog](#/changelog)

---

## 📚 Documentation Structure

### Getting Started
- [Project Overview](#/overview) ← You are here
- [Architecture Guide](#/architecture)
- [Build System](#/build-system)
- [Development Workflow](#/development-workflow)

### Core Concepts
- [Clean Architecture](#/clean-architecture)
- [Repository Pattern](#/repository-pattern)
- [Dependency Injection](#/dependency-injection)
- [Error Handling](#/error-handling)

### Frontend
- [Angular Services](#/angular-services)
- [State Management](#/state-management)
- [Component Patterns](#/component-patterns)
- [Testing Guide](#/frontend-testing)

### Backend
- [Rust Backend Structure](#/rust-backend)
- [Database Layer](#/database-layer)
- [WebUI Integration](#/webui-integration)
- [Testing Guide](#/backend-testing)

### DevOps
- [Build Pipeline](#/build-pipeline)
- [Deployment](#/deployment)
- [Monitoring](#/monitoring)
- [Troubleshooting](#/troubleshooting)

### Reference
- [API Reference](#/api-reference)
- [Changelog](#/changelog)
- [Third-Party Dependencies](#/third-party)
- [Contributing Guide](#/contributing)

---

## 🎯 Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Rust | 1.93+ | Core language |
| WebUI | 2.5.0-beta.4 | Desktop windowing |
| SQLite | 0.32 | Embedded database |
| r2d2 | 0.8 | Connection pooling |
| serde | 1.0 | Serialization |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 21.1.5 | UI framework |
| TypeScript | 5.9 | Type safety |
| Biome | 2.4.4 | Linter/formatter |
| Bun | 1.3 | Package manager |
| WinBox | 0.2.82 | Window management |

---

## 📊 Project Metrics

| Metric | Before (2026-03-28) | After (2026-03-29) | Improvement |
|--------|---------------------|-------------------|-------------|
| Duplicate services | 6 pairs | 0 | 100% eliminated |
| Unsafe `.unwrap()` | 86 | 0 | 100% fixed |
| Rust dependencies | 80+ | ~20 | 75% reduction |
| Build time (full) | 5+ min | ~2 min | 60% faster |
| Feedback loop | 3 min | 10-15 sec | 95% faster* |
| Orphaned directories | 3 | 0 | 100% cleaned |

*With watch mode enabled

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Angular)                    │
├─────────────────────────────────────────────────────────┤
│  Views (Components)                                      │
│  ├── Dashboard                                           │
│  ├── Home                                                │
│  ├── Demo (DuckDB, SQLite, WebSocket)                   │
│  └── DevTools                                            │
├─────────────────────────────────────────────────────────┤
│  Core Services                                           │
│  ├── ApiService (RPC calls)                              │
│  ├── EventBusService (Pub/Sub)                           │
│  ├── SharedStateService (Global state)                   │
│  ├── LoggerService                                       │
│  └── StorageService                                      │
└─────────────────────────────────────────────────────────┘
                            ↕ WebUI Bridge
┌─────────────────────────────────────────────────────────┐
│                    Backend (Rust)                        │
├─────────────────────────────────────────────────────────┤
│  Presentation Layer (WebUI Handlers)                     │
│  ├── db_handlers.rs                                      │
│  ├── sysinfo_handlers.rs                                 │
│  ├── error_handlers.rs                                   │
│  └── logging_handlers.rs                                 │
├─────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                    │
│  ├── Database (SQLite + r2d2 pool)                       │
│  ├── Repository Implementations                          │
│  ├── DI Container                                        │
│  ├── Error Handler                                       │
│  └── Logging                                             │
├─────────────────────────────────────────────────────────┤
│  Domain Layer                                            │
│  ├── Entities (User, Product, Order)                     │
│  └── Repository Traits                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 Learning Path

### For New Developers

1. **Day 1:** Read this overview, run the application
2. **Day 2:** Study the architecture guide
3. **Day 3:** Explore the codebase structure
4. **Day 4:** Make your first change (fix a typo, add a log)
5. **Week 2:** Implement a small feature
6. **Month 1:** Contribute a significant feature

### For Experienced Developers

1. Review the [changelog](#/changelog) for recent changes
2. Understand the [repository pattern](#/repository-pattern)
3. Familiarize with [error handling](#/error-handling)
4. Explore [DevTools](#/devtools) for debugging

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](#/contributing) for details.

### Quick Start for Contributors

```bash
# Fork and clone
git clone <your-fork-url>
cd starter-rust-webui-angular-rspack

# Install dependencies
cd frontend
bun install
cd ..

# Start development mode
./run.sh --watch
```

### Code Quality Standards

- All code must pass `bun run lint` and `bun run format`
- Backend code must pass `cargo clippy`
- New features should include tests
- Documentation should be updated for API changes

---

## 📞 Getting Help

1. Check the [documentation](#/overview)
2. Review [ERROR_HANDLING_GUIDE.md](ERROR_HANDLING_GUIDE.md)
3. Inspect application logs in `logs/application.log`
4. Check DevTools panel for runtime errors
5. Open an issue on GitHub

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Rust and Angular**

Last updated: 2026-03-29
