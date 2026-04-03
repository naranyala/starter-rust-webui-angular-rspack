# Justfile — Unified build, test, and dev commands
# Usage: just <command>
# Install just: https://github.com/casey/just

# Default target: show available commands
default:
    @just --list

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

# Build everything (frontend + backend)
build:
    ./run.sh --build

# Build frontend only
build-frontend:
    cd frontend && bun run build

# Build backend only
build-rust:
    cargo build

# Build release
build-release:
    ./run.sh --release

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------

# Run the application (uses existing build)
run:
    ./run.sh --run

# Run in release mode
run-release:
    ./run.sh --release --run

# ---------------------------------------------------------------------------
# Clean
# ---------------------------------------------------------------------------

# Clean all build artifacts
clean:
    cargo clean
    cd frontend && rm -rf dist node_modules/.vite
    rm -rf dist

# Clean and rebuild
rebuild: clean build

# ---------------------------------------------------------------------------
# Test
# ---------------------------------------------------------------------------

# Run all tests
test: test-rust test-frontend

# Run Rust backend tests
test-rust:
    cargo test

# Run Angular frontend tests
test-frontend:
    cd frontend && bun run test

# ---------------------------------------------------------------------------
# Lint & Format
# ---------------------------------------------------------------------------

# Lint everything
lint: lint-rust lint-frontend

# Lint Rust code
lint-rust:
    cargo clippy -- -D warnings

# Lint frontend code
lint-frontend:
    cd frontend && bun run lint

# Format everything
format: format-rust format-frontend

# Format Rust code
format-rust:
    cargo fmt

# Format frontend code
format-frontend:
    cd frontend && bun run format:fix

# ---------------------------------------------------------------------------
# Dev
# ---------------------------------------------------------------------------

# Development watch mode (shell script handles both)
watch:
    ./run.sh --watch

# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

# Check backend compiles (fast)
check:
    cargo check

# Show database pool stats (requires running app)
db-stats:
    @echo "Open DevTools in the running app to view DB stats."

# Show error summary
errors:
    @echo "Open DevTools in the running app to view error dashboard."
