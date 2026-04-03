# Maintainability Rewrite Plan

## Audit Summary

Two independent agents read every `.rs` and `.ts` file in the project. Below are
all identified pitfalls ranked by maintainability impact, followed by a phased
rewrite plan.

---

## Pitfall Catalog

### P0 — Critical (active correctness / developer pain issues)

| # | Pitfall | Where | Impact |
|---|---------|-------|--------|
| 1 | **DB cached in 3 separate globals** — `ServiceRegistry.database`, `db_management_handlers.DB_INSTANCE`, `error_handlers.DB_INSTANCE` | `service_registry.rs`, `db_management_handlers.rs`, `error_handlers.rs` | Handlers read stale/different DB refs; impossible to reason about data flow |
| 2 | **db_management_handlers bypasses ServiceRegistry** — creates its own `Arc<DatabaseManagementService>` global | `db_management_handlers.rs:20-23` | Two DI systems live simultaneously; the typed registry is ignored |
| 3 | **Validation duplicated in Database + Services** — name length, email format, price range, stock ≥ 0 all checked twice | `users.rs`/`user_service.rs`, `products.rs`/`product_service.rs`, `orders.rs`/`order_service.rs` | Change a rule in one place, forget the other → silent data corruption |
| 4 | **API function whitelist is incomplete** — 18+ functions called from frontend are NOT in `ALLOWED_FUNCTIONS` | `api.service.ts:32-44` vs actual calls across 10+ components | Runtime security errors for auth, state sync, event bus, devtools |
| 5 | **5 demo components > 1000 lines each** — `sqlite-exploration`, `duckdb-exploration`, `db-comparison-demo`, `data-migration-demo`, `realtime-sync-demo` | `frontend/src/views/demo/` | Unreadable, untestable, impossible to onboard new devs |
| 6 | **DashboardComponent = 580-line God component** with 10-branch manual view-switching, entity state, sidebar state, mobile logic | `dashboard.component.ts` | Every nav change risks regressions; zero lazy loading |

### P1 — High (maintainability debt that slows every change)

| # | Pitfall | Where | Impact |
|---|---------|-------|--------|
| 7 | **Response helper functions copy-pasted** — `send_success_response`, `send_error_response`, `err_to_error_data`, `dispatch_event`, `handle_result` duplicated in `db_handlers.rs` AND `db_management_handlers.rs` | 2 handler files, ~80 lines each | Fix error formatting → must edit 2 files |
| 8 | **`read_event_payload` copy-pasted 3 times** — byte-identical in `event_bus_handlers.rs`, `logging_handlers.rs`, `window_state_handler.rs` | 3 handler files | FFI change → 3 edits |
| 9 | **SysInfoService duplicated** — `SysInfoService::get_system_info()` exists as a service AND as free functions in `sysinfo_handlers.rs` | `sysinfo_service.rs` vs `sysinfo_handlers.rs` | Service is never called; handler code is dead weight |
| 10 | **41 `window.bind()` calls with identical boilerplate** — parse params, call service, dispatch response | All 8 handler files | Adding a handler = 15 lines of boilerplate + 1 line of logic |
| 11 | **Positional parameter parsing** — `parts.get(1)`, `parts.get(2)` from colon-split strings | `db_handlers.rs`, `db_management_handlers.rs` | Frontend adds a param in the middle → every handler silently breaks |
| 12 | **OrderService creates new UserService/ProductService per `create_order` call** | `order_service.rs:30-31` | Defeats ServiceRegistry singleton pattern |
| 13 | **EventBus returns hardcoded 0/empty** — `listener_count()`, `total_listeners()`, `get_stats()` all fake | `event_bus.rs:101-109` | Misleading API; devtools show wrong stats |
| 14 | **5 business services have ZERO tests** — UserService, ProductService, OrderService, AnalyticsService, SysInfoService | `core/services/*.rs` | Validation bugs (duplicate email, price range) ship silently |
| 15 | **Dashboard manual routing** — `activeView` signal + 10 `@if/@else if` branches instead of Angular router | `dashboard.component.ts` | No browser history, no deep links, no code splitting |
| 16 | **CRUD patterns duplicated across 5+ components** — `loadUsers`, `createUser`, `deleteUser` with identical try/catch/finally | Multiple demo components | Fix error handling → 5 files to update |

### P2 — Medium (cleanliness / polish)

| # | Pitfall | Where | Impact |
|---|---------|-------|--------|
| 17 | **12+ `unsafe CStr::from_ptr(event.element)` calls** — no abstraction | 5 handler files | FFI change → audit 12 sites |
| 18 | **Status badge CSS duplicated in 8 files** — `.status-active`, etc. | 8 component style blocks | Branding change → 8 edits |
| 19 | **`@keyframes spin` duplicated in 10 files** | 10 component style blocks | Same |
| 20 | **Email regex duplicated in 4 files** | `auth.component.ts`, `demo-sqlite-crud.component.ts`, `validation.utils.ts`, `domain.models.ts` | Regex fix → 4 edits |
| 21 | **Legacy DI Container still initialized** alongside ServiceRegistry | `di.rs`, `bootstrap.rs:23` | Two DI systems, confusion |
| 22 | **Default values duplicated** between `AppConfig::default()` and `build.rs` | `config.rs`, `build.rs` | Drift risk |
| 23 | **Unused components** — `HomeComponent`, `AuthComponent`, `ErrorModalComponent`, `WebUIDemoComponent`, `DuckdbAnalyticsComponent`, `SvgjsDemoComponent`, `DevToolsComponent` | Various | Dead code, import tax |
| 24 | **Domain models never instantiated** — `ProductDomain`, `OrderDomain`, etc. | `domain.models.ts` | Dead code |
| 25 | **`id: unwrap_or(0)` defaults** — ID 0 is never valid | `db_handlers.rs` lines 113, 144, 197 | Silent "not found" instead of validation error |
| 26 | **`DataTableComponent` bypasses whitelist** — constructs function names dynamically at runtime | `data-table.component.ts:272,277,294` | Security bypass |
| 27 | **No lazy loading** — all components eagerly imported | `dashboard.component.ts` imports | Large initial bundle |
| 28 | **No route guards** | `app.routes.ts` | No auth protection |

---

## Rewrite Plan (Phased, Maintainability-First)

### Phase 1: Rust Backend — Eliminate Globals & Deduplicate

**Goal:** Single source of truth for every service, zero duplicated helpers.

| Task | Detail |
|------|--------|
| **1.1 Extract shared handler utilities** | Create `core/presentation/webui/handler_utils.rs` with: `read_event_payload`, `dispatch_event`, `send_success_response`, `send_error_response`, `err_to_error_data`, `handle_result`, `parse_element_params`. Delete copies from all handler files. |
| **1.2 Eliminate duplicate DB globals** | Remove `DB_INSTANCE` from `db_management_handlers.rs` and `error_handlers.rs`. Both receive `Arc<ServiceRegistry>` and use `registry.database` / `registry.db_management`. |
| **1.3 Wire db_management_handlers through ServiceRegistry** | Remove `init_database_management()` function. Pass registry to `setup_db_management_handlers(registry)`. |
| **1.4 Wire error_handlers through ServiceRegistry** | Remove `init_database_monitoring()` function. Pass registry to `setup_db_monitoring_handlers(registry)`. |
| **1.5 Deduplicate SysInfoService** | Delete free functions in `sysinfo_handlers.rs`. Handler calls `SysInfoService::get_system_info()` from the service. |
| **1.6 Remove validation duplication** | Keep validation ONLY in services. Database layer becomes pure SQL execution — no validation, no business rules. |
| **1.7 Fix OrderService cross-dependencies** | `OrderService` receives `Arc<UserService>` and `Arc<ProductService>` in its constructor instead of creating them per-call. |
| **1.8 Remove legacy DI Container** | Delete `di.rs`. Remove `init_container()` from `bootstrap.rs`. Only `ServiceRegistry` remains. |
| **1.9 Add service tests** | Test validation, duplicate detection, existence checks in UserService, ProductService, OrderService. |
| **1.10 Fix EventBus stub methods** | Either implement real subscriber tracking or remove the fake methods. |

### Phase 2: Rust Backend — Reduce Boilerplate

**Goal:** Adding a new handler takes 3 lines, not 15.

| Task | Detail |
|------|--------|
| **2.1 Create handler macro or DSL** | `define_handler!` or typed builder that takes `(name, param_parser, service_call)` and generates the `window.bind()` + error handling boilerplate. |
| **2.2 Safe FFI wrapper** | `unsafe fn element_name(event: &Event) -> String` — one safe wrapper eliminates 12 unsafe sites. |
| **2.3 Named parameter parsing** | Replace `parts.get(1)` with a struct: `let params = CreateUserParams::parse(&element_name)?;` with validation. |

### Phase 3: Frontend — Fix Communication Layer

**Goal:** API function names are centralized, typed, and consistent.

| Task | Detail |
|------|--------|
| **3.1 Generate API contract** | Single `api-contract.ts` file listing every backend function name + parameter types, exported as typed constants. |
| **3.2 Sync whitelist** | Populate `ALLOWED_FUNCTIONS` from the contract. Add runtime error if a call falls outside. |
| **3.3 DataTableComponent uses contract** | Replace dynamic string construction with typed contract entries. |

### Phase 4: Frontend — Split God Components

**Goal:** No component exceeds 250 lines.

| Task | Detail |
|------|--------|
| **4.1 Replace Dashboard's manual routing with Angular child routes** | Use `loadChildren` / `loadComponent` for lazy loading. Each view becomes its own route. |
| **4.2 Split 1000-line demo components** | Each tab/section becomes a child component. Parent orchestrates layout. |
| **4.3 Extract shared styles** | Create `shared/styles/status-badges.css`, `shared/styles/spinner.css`, `shared/styles/forms.css`. Remove inline duplicates. |
| **4.4 Centralize email validation** | Single `validateEmail()` in `validation.utils.ts`, import everywhere. |

### Phase 5: Frontend — Clean Up Dead Code

**Goal:** Zero unused components, services, or models.

| Task | Detail |
|------|--------|
| **5.1 Delete unused components** | `HomeComponent`, `AuthComponent`, `ErrorModalComponent`, `WebUIDemoComponent`, `DuckdbAnalyticsComponent`, `SvgjsDemoComponent`, `DevToolsComponent` (or wire them up properly). |
| **5.2 Delete dead domain models** | `ProductDomain`, `OrderDomain`, etc. that are never instantiated. |
| **5.3 Remove `window.__FRONTEND_EVENT_BUS__`** | If nothing consumes it, delete it. |
| **5.4 Consolidate demo components** | Merge overlapping SQLite/DuckDB demos into unified `DatabaseExplorerComponent`. |

### Phase 6: Cross-Cutting — Testing & Documentation

| Task | Detail |
|------|--------|
| **6.1 Service unit tests** | 5 new test files for UserService, ProductService, OrderService, AnalyticsService, SysInfoService. |
| **6.2 Component unit tests** | Test DataTable, Dashboard, at least 3 demo components. |
| **6.3 Architecture diagram** | Update README with current module graph (services → database → handlers). |

---

## Execution Order

```
Phase 1 (Backend correctness)  → Phase 2 (Backend boilerplate)  →
Phase 3 (Frontend comms)       → Phase 4 (Frontend structure)    →
Phase 5 (Dead code cleanup)    → Phase 6 (Tests & docs)
```

Each phase must compile and pass tests before the next begins.
