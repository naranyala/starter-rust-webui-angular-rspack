# Development Workflow

This guide helps you set up an efficient development workflow.

---

## Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd starter-rust-webui-angular-rspack
cd frontend && bun install && cd ..

# Start development
./run.sh --watch
```

---

## Recommended Setup

### VS Code Extensions

```json
{
  "recommendations": [
    "rust-lang.rust-analyzer",
    "Angular.ng-template",
    "biomejs.biome",
    "tamasfe.even-better-toml"
  ]
}
```

### Settings

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "biomejs.biome",
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "rust-analyzer.checkOnSave.command": "clippy"
}
```

---

## Development Modes

### Watch Mode (Recommended)

```bash
./run.sh --watch
```

**What it does:**
- Starts Rspack dev server (frontend auto-rebuild)
- Builds Rust once (incremental)
- Frontend changes reflect in 2-3 seconds
- Backend changes require manual `cargo build`

### Traditional Mode

```bash
# Make changes
./run.sh --build
./run.sh --run
```

**Use when:**
- Testing full build pipeline
- Preparing for commit
- Release builds

---

## Hot Reload Setup

### Frontend Hot Reload

```bash
# In frontend directory
cd frontend
bun run rspack serve

# Or use the watch command
./run.sh --watch
```

**Features:**
- Auto-rebuild on file save
- Live reload in browser
- Source maps for debugging

### Backend Incremental Builds

```bash
# Keep terminal open
cargo build --watch
# Or use cargo-watch if installed
cargo watch -x build
```

---

## Testing Workflow

### Frontend Tests

```bash
cd frontend

# Run all tests
bun run test

# Run with coverage
bun run test:coverage

# Run specific test file
bun test src/views/dashboard/dashboard.component.test.ts

# Run E2E tests
bun run test:e2e

# Run E2E with UI
bun run test:e2e:ui
```

### Backend Tests

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_error_entry_creation

# Run with output
cargo test -- --nocapture

# Run only doc tests
cargo test --doc
```

---

## Debugging

### Frontend Debugging

1. **DevTools Panel**
   - Open DevTools from application menu
   - View backend logs, events, state

2. **Browser DevTools**
   - Press F12 in application window
   - Set breakpoints in Sources tab
   - Use Console for logging

3. **Angular DevTools**
   - Install Chrome extension
   - Inspect component tree
   - View change detection

### Backend Debugging

1. **Logging**
   ```bash
   # Verbose logging
   RUST_LOG=debug ./target/debug/rustwebui-app

   # Check logs
   tail -f logs/application.log
   ```

2. **Panic Hooks**
   - Automatic stack traces on panic
   - Logs to `logs/application.log`

3. **Debugger**
   ```bash
   # Build with debug symbols
   cargo build

   # Run with gdb
   gdb ./target/debug/rustwebui-app

   # Or lldb on macOS
   lldb ./target/debug/rustwebui-app
   ```

---

## Code Quality

### Linting

```bash
# Frontend
cd frontend
bun run lint        # Check
bun run lint:fix    # Auto-fix

# Backend
cargo clippy        # Lint
cargo clippy --fix  # Auto-fix
```

### Formatting

```bash
# Frontend
cd frontend
bun run format        # Check
bun run format:fix    # Auto-format

# Backend
cargo fmt             # Format
cargo fmt -- --check  # Check
```

### Pre-commit Hooks

Install Husky for Git hooks:

```bash
cd frontend
bun add -D husky
bunx husky install

# Add pre-commit hook
bunx husky add .husky/pre-commit "bun run lint && bun run format"
```

---

## Project Structure

```
starter-rust-webui-angular-rspack/
│
├── src/                          # Rust backend
│   ├── main.rs                   # Entry point
│   └── core/                     # Clean Architecture
│       ├── domain/               # Business entities
│       ├── application/          # Use cases
│       ├── infrastructure/       # DB, logging, DI
│       └── presentation/         # WebUI handlers
│
├── frontend/                     # Angular frontend
│   ├── src/
│   │   ├── core/                 # Services
│   │   ├── views/                # Components
│   │   ├── models/               # Data models
│   │   └── types/                # TypeScript types
│   ├── angular.json              # Angular config
│   ├── rspack.config.js          # Bundler config
│   └── biome.json                # Linter config
│
├── config/
│   └── app.config.toml           # App configuration
│
├── docs/                         # Documentation
├── run.sh                        # Build/run script
├── build.rs                      # Rust build script
└── Cargo.toml                    # Rust dependencies
```

---

## Common Tasks

### Adding a New Feature

1. **Backend:**
   ```rust
   // 1. Add entity (src/core/domain/entities/)
   // 2. Add repository trait (src/core/domain/traits/)
   // 3. Implement repository (src/core/infrastructure/database/)
   // 4. Add handler (src/core/presentation/webui/handlers/)
   ```

2. **Frontend:**
   ```typescript
   // 1. Add model (frontend/src/models/)
   // 2. Add service (frontend/src/core/)
   // 3. Add component (frontend/src/views/)
   ```

3. **Test:**
   ```bash
   # Write tests
   cargo test
   bun run test

   # Run application
   ./run.sh
   ```

### Adding a New API Endpoint

```rust
// 1. Add handler in src/core/presentation/webui/handlers/
window.bind("my_new_function", |event| {
    info!("my_new_function called");
    // Your logic here
    send_response(window, "my_response", &result);
});

// 2. Register handler in main.rs
presentation::my_handlers::setup_my_handlers(&mut my_window);

// 3. Call from frontend
const result = await this.api.callOrThrow('my_new_function');
```

### Adding a New Service (Frontend)

```typescript
// 1. Create service file
// frontend/src/core/my-service.service.ts

@Injectable({ providedIn: 'root' })
export class MyServiceService {
  private readonly api = inject(ApiService);

  async getData(): Promise<any> {
    return this.api.callOrThrow('get_data');
  }
}

// 2. Export in frontend/src/core/index.ts
export { MyServiceService } from './my-service.service';

// 3. Use in component
private readonly myService = inject(MyServiceService);
const data = await this.myService.getData();
```

---

## Performance Tips

### Faster Builds

1. **Don't use `--clean` in development**
   ```bash
   # ❌ Slow (full rebuild)
   ./run.sh dev

   # ✅ Fast (incremental)
   cargo build
   ```

2. **Use watch mode**
   ```bash
   ./run.sh --watch
   ```

3. **Parallel builds**
   ```bash
   # Modify run.sh to build in parallel
   build_frontend &
   build_rust &
   wait
   ```

### Faster Tests

```bash
# Run only changed tests
cargo test --test-threads=4

# Frontend test specific file
bun test src/views/dashboard/dashboard.component.test.ts
```

---

## Environment Variables

```bash
# Rust logging
export RUST_LOG=debug  # Options: trace, debug, info, warn, error

# Custom dist directory
export RUSTWEBUI_DIST_DIR=./custom/dist

# Node options
export NODE_OPTIONS=--max-old-space-size=4096
```

---

## Tips & Tricks

### 1. Use Biome for Quick Fixes

```bash
cd frontend
bun run lint:fix  # Auto-fix linting issues
bun run format:fix  # Auto-format code
```

### 2. Check Dependencies

```bash
# Rust
cargo tree          # Show dependency tree
cargo audit         # Security audit

# Frontend
bunx npm-check-updates  # Check for updates
bunx npm-audit           # Security audit
```

### 3. Profile Build Time

```bash
# Rust build timing
cargo build --timings

# Frontend build analysis
cd frontend
ANALYZE=true bun run ng build
# Opens bundle-report.html
```

### 4. Database Tools

```bash
# View SQLite database
sqlite3 app.db

# Common queries
.tables                    # List tables
.schema users              # Show users table schema
SELECT * FROM users;       # Query users
```

---

## Next Steps

- [Testing Guide](#/testing) - Learn how to test
- [Deployment](#/deployment) - Deploy to production
- [Troubleshooting](#/troubleshooting) - Common issues
