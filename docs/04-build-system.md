# Build System Guide

This document explains how to build, test, and deploy the application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Build Commands](#build-commands)
4. [Development Workflow](#development-workflow)
5. [Build Architecture](#build-architecture)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

| Tool | Version | Purpose | Install |
|------|---------|---------|---------|
| Rust | 1.93+ | Backend language | [rustup.rs](https://rustup.rs) |
| Bun | 1.3+ | Frontend package manager | [bun.sh](https://bun.sh) |
| Node.js | 18+ (optional) | Fallback package manager | [nodejs.org](https://nodejs.org) |

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

## Quick Start

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

---

## Build Commands

### Master Script (run.sh)

The `run.sh` script handles the complete build pipeline.

```bash
# Build and run (default)
./run.sh

# Build only (no run)
./run.sh --build

# Build frontend only
./run.sh --build-frontend

# Build Rust only
./run.sh --build-rust

# Build release version
./run.sh --release

# Development watch mode (NEW!)
./run.sh --watch

# Run existing build
./run.sh --run

# Clean all artifacts
./run.sh --clean

# Clean and rebuild
./run.sh --rebuild

# Show help
./run.sh --help
```

### Direct Commands

#### Frontend

```bash
cd frontend

# Install dependencies
bun install

# Development build
bun run ng build

# Production build
bun run ng build --configuration production

# Watch mode (auto-rebuild on changes)
bun run rspack serve

# Run tests
bun run test

# Run tests with coverage
bun run test:coverage

# Lint
bun run lint

# Format
bun run format
```

#### Backend

```bash
# Debug build
cargo build

# Release build
cargo build --release

# Run tests
cargo test

# Check without building
cargo check

# Format code
cargo fmt

# Lint
cargo clippy

# Clean build artifacts
cargo clean
```

---

## Development Workflow

### Recommended Workflow (With Watch Mode)

```bash
# Terminal 1: Start watch mode
./run.sh --watch

# This starts:
# - Rspack dev server (frontend auto-rebuild)
# - Rust build (incremental)

# Terminal 2: Make changes
# Frontend changes: Auto-rebuild in 2-3 seconds
# Backend changes: Rebuild with cargo build (incremental)
```

### Traditional Workflow

```bash
# Make changes to code

# Build everything
./run.sh --build

# Run application
./run.sh --run

# Repeat...
```

### Debugging

#### Frontend Debugging

1. Open DevTools panel in application
2. Use browser DevTools (F12)
3. Check `logs/application.log` for backend logs

#### Backend Debugging

```bash
# Run with verbose logging
RUST_LOG=debug ./target/debug/rustwebui-app

# Check logs
tail -f logs/application.log

# Debug build with symbols
cargo build --features debug
```

---

## Build Architecture

### Build Pipeline

```
┌─────────────────────────────────────────────────────────┐
│  run.sh                                                  │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  1. Check Prerequisites                                  │
│     - Check for Bun                                      │
│     - Check for Cargo                                    │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  2. Install Frontend Dependencies                        │
│     - bun install (if node_modules missing)              │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  3. Build Frontend                                       │
│     - build-frontend.js                                  │
│     - Angular build (ng build)                           │
│     - Copy assets to dist/ and static/                   │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  4. Build Rust Backend                                   │
│     - cargo build                                        │
│     - build.rs generates embedded assets                 │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  5. Post-Build                                           │
│     - post-build.sh (if exists)                          │
│     - Copy additional assets                             │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  6. Run Application                                      │
│     - ./target/debug/rustwebui-app                       │
└─────────────────────────────────────────────────────────┘
```

### build.rs Explained

The `build.rs` script:

1. **Generates build configuration** from `app.config.toml`
2. **Embeds frontend assets** into the binary
3. **Compiles WebUI C library** statically

```rust
// build.rs
fn main() {
    // Generate build config
    generate_build_config(&project_dir);

    // Embed frontend assets
    generate_embedded_frontend_assets(&project_dir);

    // Compile WebUI C library
    cc::Build::new()
        .file("webui.c")
        .file("civetweb/civetweb.c")
        .compile("webui-2-static");
}
```

### Asset Flow

```
frontend/src/
    ↓ (Angular build)
frontend/dist/browser/
    ↓ (Copy by build-frontend.js)
dist/
├── index.html
└── static/
    ├── js/
    │   ├── main.js
    │   ├── winbox.min.js
    │   └── webui.js
    └── css/
        └── winbox.min.css

static/ (runtime copy)
├── js/
└── css/
```

---

## Build Optimization

### Parallel Builds

For faster builds, the script can build frontend and backend in parallel:

```bash
# Modified run.sh for parallel builds
build_frontend &
FRONTEND_PID=$!

build_rust &
RUST_PID=$!

wait $FRONTEND_PID
wait $RUST_PID
```

**Impact:** Reduces build time from 5 minutes to ~3 minutes

### Incremental Builds

```bash
# ❌ Avoid this in development (forces full rebuild)
./run.sh dev  # Uses --clean

# ✅ Use this (keeps build cache)
cargo build
./run.sh --build
```

### Build Caching

The build system caches:

- **Rust:** `target/` directory (incremental compilation)
- **Frontend:** `frontend/.angular/cache/` (Angular build cache)
- **Rspack:** `frontend/.rspack/` (Rspack build cache)

**Don't delete these directories** unless troubleshooting build issues.

---

## Release Builds

### Building for Production

```bash
# Build release version
./run.sh --release

# Or manually
cd frontend
bun install
bun run build:incremental
cd ..

cargo build --release
```

### Release Profile Settings

```toml
# Cargo.toml
[profile.release]
opt-level = 3      # Maximum optimization
lto = true         # Link-time optimization
codegen-units = 1  # Single codegen unit (better optimization)

[profile.dev]
debug = false      # No debug symbols in dev (faster builds)
```

### Distribution Package

```bash
# Build distribution package
./build-dist.sh build-release

# Output will be in target/release/
```

---

## Troubleshooting

### Common Issues

#### "module not found" Error

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

1. Ensure WebKit2GTK is installed (Linux)
2. Check WebView2 runtime (Windows)
3. Verify port is not in use

#### Build Takes Too Long

```bash
# Check if --clean is being used (slow!)
# Remove --clean flag from run.sh line 114

# Use watch mode for development
./run.sh --watch
```

#### Rust Compilation Errors

```bash
# Check Rust version
rustc --version  # Should be 1.93+

# Update Rust
rustup update

# Check for clippy warnings
cargo clippy
```

#### Frontend/Backend Mismatch

```bash
# Ensure both are built from same source
./run.sh --clean
./run.sh --rebuild
```

### Getting Help

1. Check logs: `logs/application.log`
2. Check DevTools panel
3. Review [ERROR_HANDLING_GUIDE.md](ERROR_HANDLING_GUIDE.md)
4. Open an issue on GitHub

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

## Next Steps

- [Development Workflow](#/development-workflow) - Set up your dev environment
- [Deployment Guide](#/deployment) - Deploy to production
- [Troubleshooting](#/troubleshooting) - Common issues and solutions
