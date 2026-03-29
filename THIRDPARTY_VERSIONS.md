# Third-Party Dependencies

This document tracks all third-party dependencies used in this project, including their versions and sources.

## Build Date
Generated: 2026-03-29

---

## Rust Backend Dependencies

### Core Dependencies
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| webui-rs | main (git) | Desktop windowing via WebUI | MIT |
| log | 0.4 | Logging facade | MIT/Apache-2.0 |
| env_logger | 0.11 | Environment-based logger | MIT/Apache-2.0 |
| lazy_static | 1.4 | Global static variables | MIT/Apache-2.0 |

### Serialization
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| serde | 1.0 | Serialization framework | MIT/Apache-2.0 |
| serde_json | 1.0 | JSON serialization | MIT/Apache-2.0 |
| chrono | 0.4 | Date/time handling | MIT/Apache-2.0 |
| toml | 0.8 | TOML parsing | MIT/Apache-2.0 |

### Database
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| rusqlite | 0.32 | SQLite bindings | MIT |
| r2d2 | 0.8 | Connection pooling | MIT |
| r2d2_sqlite | 0.25 | SQLite connection pooling | MIT |

### Error Handling
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| anyhow | 1.0 | Flexible error handling | MIT/Apache-2.0 |
| thiserror | 1.0 | Error type derivation | MIT/Apache-2.0 |
| backtrace | 0.3 | Stack traces | MIT/Apache-2.0 |

### System Utilities
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| dirs | 5.0 | Platform-specific directories | MIT/Apache-2.0 |
| tempfile | 3.8 | Temporary files | MIT/Apache-2.0 |
| notify | 6.1 | File system notifications | CC0-1.0 |
| open | 5.0 | Open files/URLs | MIT/Apache-2.0 |
| hostname | 0.3 | Get hostname | MIT/Apache-2.0 |
| whoami | 2.1 | Get username | MIT/Apache-2.0 |
| num_cpus | 1.17 | Get CPU count | MIT/Apache-2.0 |
| walkdir | 2.3 | Directory traversal | MIT/Apache-2.0 |

### Windows-Specific
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| winapi | 0.3 | Windows API bindings | MIT/Apache-2.0 |
| windows | 0.57 | Windows runtime | MIT/Apache-2.0 |
| winreg | 0.52 | Windows registry | MIT/Apache-2.0 |

### macOS-Specific
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| objc2 | 0.6 | Objective-C runtime | MIT/Apache-2.0 |
| objc2-app-kit | 0.3 | AppKit bindings | MIT/Apache-2.0 |
| objc2-foundation | 0.3 | Foundation bindings | MIT/Apache-2.0 |

### Build Dependencies
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| cc | 1.0 | C compiler abstraction | MIT/Apache-2.0 |
| walkdir | 2.3 | Directory traversal | MIT/Apache-2.0 |
| toml | 0.8 | TOML parsing | MIT/Apache-2.0 |

---

## Frontend Dependencies

### Angular Core
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| @angular/core | 21.1.5 | Angular framework | MIT |
| @angular/common | 21.1.5 | Common directives | MIT |
| @angular/compiler | 21.1.5 | Template compiler | MIT |
| @angular/router | 21.1.5 | Routing | MIT |
| @angular/forms | 21.1.5 | Form handling | MIT |
| @angular/platform-browser | 21.1.5 | Browser platform | MIT |
| @angular/animations | 21.1.5 | Animations | MIT |
| @angular/ssr | 21.1.4 | Server-side rendering | MIT |

### UI Libraries
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| winbox | 0.2.82 | Window management | MIT |
| lucide-angular | 0.577.0 | Icon library | ISC |
| ngx-markdown | 21.1.0 | Markdown rendering | MIT |
| prismjs | 1.30.0 | Syntax highlighting | MIT |
| svg.js | 2.7.1 | SVG manipulation | MIT |

### Utilities
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| rxjs | 7.8.2 | Reactive extensions | Apache-2.0 |
| tslib | 2.8.1 | TypeScript helpers | 0BSD |
| zone.js | 0.15.1 | Zone.js for Angular | MIT |

### Build Tools
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| @angular-devkit/build-angular | 21.1.4 | Angular build | MIT |
| @angular/build | 21.1.4 | Angular build system | MIT |
| @angular/cli | 21.1.4 | Angular CLI | MIT |
| @angular/compiler-cli | 21.1.5 | Compiler CLI | MIT |
| @angular/language-service | 21.1.5 | Language service | MIT |
| typescript | 5.9.0 | TypeScript compiler | Apache-2.0 |
| @rspack/core | 1.7.6 | Rspack bundler | MIT |
| @rspack/cli | 1.7.6 | Rspack CLI | MIT |
| @biomejs/biome | 2.4.2 | Linter/formatter | MIT/Apache-2.0 |

### Testing
| Dependency | Version | Purpose | License |
|------------|---------|---------|---------|
| @playwright/test | 1.42.0 | E2E testing | Apache-2.0 |

---

## Native Third-Party Libraries

### WebUI
| Library | Version | Source | License |
|---------|---------|--------|---------|
| webui | 2.5.0-beta.4 | thirdparty/webui-c-src | AGPL-3.0 |
| civetweb | bundled | thirdparty/webui-c-src/civetweb | MIT |

### Database
| Library | Version | Source | License |
|---------|---------|--------|---------|
| SQLite | 3.51.0.300 | thirdparty/sqlite-amalgamation-*/ | Public Domain |
| DuckDB | (version TBD) | thirdparty/libduckdb-linux-amd64/ | MIT |

---

## Update Policy

### Security Updates
- Critical security patches: Applied within 48 hours
- Minor security updates: Applied within 1 week
- Routine updates: Applied monthly

### Version Policy
- Angular: Follow LTS releases
- Rust dependencies: Update quarterly after testing
- Native libraries: Update when security patches available

### Audit Schedule
- `cargo audit`: Weekly (automated)
- `npm audit`: Weekly (automated)
- Manual review: Quarterly

---

## Known Issues

| Dependency | Issue | Status | Mitigation |
|------------|-------|--------|------------|
| webui-rs | Beta version, API may change | Monitoring | Pin to specific commit in production |
| jpeg-decoder | Toolchain compatibility issues | Investigating | Update when fixed upstream |

---

## Removal Log

### Removed Dependencies (2026-03-29)
The following unused dependencies were removed to reduce attack surface:

**Serialization (unused formats):**
- serde_yaml (0.9)
- rmp-serde (1.3) - MessagePack
- serde_cbor (0.11) - CBOR

**Cryptography (unused):**
- base64 (0.21)
- hmac (0.12)
- sha2 (0.10)
- rand (0.8)
- jsonwebtoken (9.0)
- hex (0.4)
- md5 (0.7)

**Compression (unused):**
- flate2 (1.0)
- zstd (0.13)
- brotli (8.0)
- lz4_flex (0.11)
- snap (1.1)
- ascii85 (0.2)
- punycode (0.4)

**Network (unused):**
- url (2.5)
- reqwest (0.12)

**File Operations (unused):**
- image (0.24)
- arboard (3.4)
- ini (1.3)
- zip (0.6)
- tar (0.4)

**System Utilities (unused):**
- sysctl (0.5)
- humantime (2.1)

---

## Verification

To verify dependency integrity:

```bash
# Rust
cargo tree --format "{p} {l}"
cargo audit

# Frontend
bun list
bunx npm-audit
```
