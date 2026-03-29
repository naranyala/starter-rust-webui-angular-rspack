# Architecture Guide

This document explains the architectural patterns and design decisions behind the Rust WebUI + Angular application.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Clean Architecture](#clean-architecture)
3. [MVVM Pattern](#mvvm-pattern)
4. [Repository Pattern](#repository-pattern)
5. [Dependency Injection](#dependency-injection)
6. [Event-Driven Design](#event-driven-design)
7. [Frontend-Backend Communication](#frontend-backend-communication)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Desktop Window                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Angular Frontend                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │  Views      │  │  ViewModels │  │  Core Services  │   │  │
│  │  │  (UI)       │↔️│  (State)    │↔️│  (Logic)        │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↕ WebUI Bridge (FFI)                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Rust Backend                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │ Presentation│  │ Application │  │  Infrastructure │   │  │
│  │  │  (Handlers) │↔️│  (Use Cases)│↔️│  (DB, Logging)  │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │  │
│  │                              ↕                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │              Domain Layer (Entities & Traits)        │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↕                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     SQLite Database                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Clean Architecture

### Layer Structure

Our backend follows **Clean Architecture** principles with four distinct layers:

```
src/core/
├── domain/           # Enterprise Business Rules
│   ├── entities/     # Business objects (User, Product, Order)
│   └── traits/       # Repository contracts
│
├── application/      # Application Business Rules
│   └── handlers/     # Use case implementations
│
├── infrastructure/   # Frameworks & Drivers
│   ├── database/     # SQLite implementation
│   ├── logging/      # Logging implementation
│   ├── di.rs         # Dependency Injection
│   └── error_handler.rs
│
└── presentation/     # Interface Adapters
    └── webui/
        └── handlers/ # WebUI event handlers
```

### Dependency Rule

```
Domain ← Application ← Infrastructure ← Presentation
   ↑          ↑             ↑               ↑
   └──────────┴─────────────┴───────────────┘
         (Dependencies point inward)
```

**Key Principle:** Inner layers know nothing about outer layers.

### Example: Creating a User

```rust
// 1. Domain Layer - Entity
// src/core/domain/entities/mod.rs
pub struct User {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub role: String,
    pub status: String,
    pub created_at: String,
}

// 2. Domain Layer - Repository Trait
// src/core/domain/traits/mod.rs
pub trait UserRepository: Send + Sync {
    fn get_all(&self) -> AppResult<Vec<User>>;
    fn get_by_id(&self, id: i64) -> AppResult<Option<User>>;
    fn create(&self, name: &str, email: &str, role: &str, status: &str) -> AppResult<i64>;
    fn update(&self, id: i64, name: Option<&str>, ...) -> AppResult<usize>;
    fn delete(&self, id: i64) -> AppResult<usize>;
}

// 3. Infrastructure Layer - Implementation
// src/core/infrastructure/database/repositories.rs
impl UserRepository for Database {
    fn create(&self, name: &str, email: &str, role: &str, status: &str) -> AppResult<i64> {
        self.insert_user(name, email, role, status)
    }
    // ... other methods
}

// 4. Presentation Layer - Handler
// src/core/presentation/webui/handlers/db_handlers.rs
window.bind("create_user", |event| {
    // Parse input, call repository, send response
    let db = get_db().unwrap();
    let user_id = db.create(name, email, role, status)?;
    send_success_response(window, "user_create_response", user_id);
});
```

---

## MVVM Pattern

### Frontend Architecture

The Angular frontend follows the **MVVM (Model-View-ViewModel)** pattern:

```
┌─────────────────────────────────────────────────────────┐
│  View (Component)                                        │
│  - Template (HTML)                                       │
│  - Styles (CSS)                                          │
│  - Binds to ViewModel signals                            │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│  ViewModel (Signals + Logic)                             │
│  - State signals                                         │
│  - Computed signals                                      │
│  - Action methods                                        │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│  Model (Data)                                            │
│  - Interfaces                                            │
│  - Type definitions                                      │
└─────────────────────────────────────────────────────────┘
```

### Example: Dashboard Component

```typescript
// VIEW MODEL
// src/views/dashboard/dashboard.component.ts
export class DashboardComponent {
  // State signals
  activeView = signal<string>('README');
  isLoading = signal(false);
  users = signal<User[]>([]);
  stats = signal<DashboardStats>({ totalUsers: 0, ... });

  // Computed signals
  hasUsers = computed(() => this.users().length > 0);

  // Actions
  async loadData(): Promise<void> {
    this.isLoading.set(true);
    const users = await this.api.callOrThrow<User[]>('getUsers');
    this.users.set(users);
    this.isLoading.set(false);
  }
}

// VIEW
// Template binds to ViewModel
@Component({
  template: `
    @if (isLoading()) {
      <div>Loading...</div>
    } @else if (hasUsers()) {
      <div>{{ users().length }} users found</div>
    }
    <button (click)="loadData()">Refresh</button>
  `
})
```

---

## Repository Pattern

### Why Repository Pattern?

The Repository pattern provides:

1. **Abstraction** - Domain layer doesn't know about database
2. **Testability** - Repositories can be mocked
3. **Swappability** - Change database without changing domain logic
4. **Single Responsibility** - Data access logic in one place

### Implementation

```rust
// 1. Define the contract (Domain Layer)
// src/core/domain/traits/mod.rs
pub trait UserRepository: Send + Sync {
    fn get_all(&self) -> AppResult<Vec<User>>;
    fn get_by_id(&self, id: i64) -> AppResult<Option<User>>;
    fn create(&self, name: &str, email: &str, role: &str, status: &str) -> AppResult<i64>;
}

// 2. Implement the contract (Infrastructure Layer)
// src/core/infrastructure/database/repositories.rs
impl UserRepository for Database {
    fn get_all(&self) -> AppResult<Vec<User>> {
        // Convert infrastructure models to domain entities
        let models = self.get_all_users()?;
        Ok(models.into_iter().map(|m| User {
            id: m.id,
            name: m.name,
            email: m.email,
            // ... mapping
        }).collect())
    }

    fn get_by_id(&self, id: i64) -> AppResult<Option<User>> {
        Ok(self.get_user_by_id(id)?.map(|m| User {
            id: m.id,
            name: m.name,
            // ... mapping
        }))
    }

    fn create(&self, name: &str, email: &str, role: &str, status: &str) -> AppResult<i64> {
        self.insert_user(name, email, role, status)
    }
}

// 3. Use through abstraction (Application/Presentation Layer)
// Can inject UserRepository trait object
container.register_trait(Arc::clone(&db) as Arc<dyn UserRepository>)?;
```

### Testing with Mocks

```rust
// Test with mock repository
struct MockUserRepository;

impl UserRepository for MockUserRepository {
    fn get_all(&self) -> AppResult<Vec<User>> {
        Ok(vec![User { /* test data */ }])
    }
    // ... other methods
}

#[test]
fn test_user_service() {
    let mock_repo = MockUserRepository;
    let service = UserService::new(mock_repo);
    // Test without database!
}
```

---

## Dependency Injection

### Container Implementation

```rust
// src/core/infrastructure/di.rs
pub struct Container {
    services: Mutex<HashMap<TypeId, Arc<dyn Any + Send + Sync>>>,
}

impl Container {
    pub fn register<T: 'static + Send + Sync>(&self, instance: T) -> AppResult<()> {
        // Register by type ID
    }

    pub fn resolve<T: 'static + Clone>(&self) -> AppResult<T> {
        // Resolve by type ID
    }

    pub fn register_trait<T: 'static + Send + Sync>(&self, instance: T) -> AppResult<()> {
        // Register trait object
    }
}
```

### Registration Flow

```rust
// src/main.rs
fn main() {
    // 1. Initialize container
    di::init_container()?;

    // 2. Create database
    let db = Database::new(db_path)?;

    // 3. Register infrastructure services
    di::register_infrastructure_services(Arc::clone(&db))?;
    // Registers:
    // - Database (concrete type)
    // - UserRepository (trait)
    // - ProductRepository (trait)
    // - OrderRepository (trait)
}
```

### Angular DI

```typescript
// Modern inject() pattern (Angular 19+)
@Injectable({ providedIn: 'root' })
export class ApiService {
  // Inject dependencies
  private readonly storage = inject(StorageService);

  // State
  private readonly loading = signal(false);
  readonly isLoading = this.loading.asReadonly();

  constructor() {
    // Clean constructor
  }
}
```

---

## Event-Driven Design

### EventBus Service

```typescript
// src/app/services/event-bus.service.ts
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private subscribers = new Map<string, Set<EventHandler>>();
  private eventSubject = new Subject<{ topic: string; data: any }>();

  // Subscribe to events
  subscribe(topic: string, handler: EventHandler): Subscription {
    // Add handler to map
    // Subscribe on backend too
  }

  // Publish events
  publish(topic: string, data: any): void {
    // Publish to backend
    // Emit locally
  }

  // Observe as Observable
  observe<T>(topic: string): Observable<T> {
    return new Observable<T>(observer => {
      const handler = (data: T) => observer.next(data);
      const subscription = this.subscribe(topic, handler);
      return () => subscription.unsubscribe();
    });
  }
}
```

### Backend Event Bus

```rust
// src/core/infrastructure/event_bus.rs
pub struct EventBus {
    handlers: Mutex<HashMap<String, Vec<Box<dyn Fn(&str) + Send + Sync>>>>,
}

impl EventBus {
    pub fn subscribe<F>(&self, event: &str, handler: F)
    where
        F: Fn(&str) + Send + Sync + 'static,
    {
        // Register handler
    }

    pub fn publish(&self, event: &str, payload: &str) {
        // Notify all handlers
    }
}
```

---

## Frontend-Backend Communication

### Communication Channels

| Channel | Purpose | Pattern | Service |
|---------|---------|---------|---------|
| WebUI Bridge | RPC calls | Request/Response | `WebUiBridgeService` |
| Event Bus | Pub/Sub | Publish/Subscribe | `EventBusService` |
| Shared State | Global state | State Management | `SharedStateService` |
| Message Queue | Async messaging | Queue | `MessageQueueService` |
| Broadcast | Cross-tab | One-to-Many | `BroadcastService` |

### WebUI Bridge (Primary Channel)

```typescript
// Frontend - Call backend function
const result = await this.bridge.callOrThrow<User[]>('getUsers');

// Backend - Handler
window.bind("get_users", |event| {
    let db = get_db().unwrap();
    let users = db.get_all_users()?;
    send_response(window, "db_response", users);
});
```

### Shared State

```typescript
// Frontend - Set state
await this.state.setState('currentUser', user);

// Frontend - Get state
const user = this.state.getState<User>('currentUser');

// Frontend - Subscribe to changes
this.state.subscribeState((key, value) => {
  console.log(`${key} changed to`, value);
});

// Backend - Sync state
window.bind("setSharedState", |event| {
    // Update shared state
    // Broadcast to all clients
});
```

---

## Error Handling Architecture

### Backend Error Flow

```
┌─────────────────────────────────────────────────────────┐
│  Error Occurs                                            │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  Create AppError with ErrorCode                          │
│  - Database, Validation, Internal, etc.                  │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  Convert to ErrorValue                                   │
│  - Code, Message, Details, Context                       │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  Record in ErrorTracker                                  │
│  - Log to terminal                                       │
│  - Store in history                                      │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  Send to Frontend as ApiResponse<T>                      │
│  { success: false, error: ErrorValue }                   │
└─────────────────────────────────────────────────────────┘
```

### Frontend Error Flow

```typescript
// Service layer
async getUsers(): Promise<User[]> {
  try {
    return await this.api.callOrThrow('getUsers');
  } catch (error) {
    // Log error
    this.logger.error('Failed to get users', error);
    // Track error
    this.errorTracking.capture(error);
    // Rethrow or handle
    throw error;
  }
}

// Component layer
async loadUsers() {
  try {
    this.users.set(await this.userService.getUsers());
  } catch (error) {
    // Show notification
    this.notification.error('Failed to load users');
  }
}
```

---

## Database Architecture

### Connection Pooling

```rust
// src/core/infrastructure/database/connection.rs
pub struct Database {
    pool: Arc<Mutex<r2d2::Pool<SqliteConnectionManager>>>,
}

impl Database {
    pub fn new(db_path: &str) -> Result<Self> {
        let manager = SqliteConnectionManager::file(db_path);
        let pool = r2d2::Pool::builder()
            .max_size(10)  // Max 10 connections
            .build(manager)?;
        Ok(Self { pool: Arc::new(Mutex::new(pool)) })
    }

    pub fn get_conn(&self) -> Result<r2d2::PooledConnection<SqliteConnectionManager>> {
        Ok(self.pool.lock().unwrap().get()?)
    }
}
```

### Repository Implementation

```rust
// Each entity has its own repository file
src/core/infrastructure/database/
├── users.rs      # UserRepository impl
├── products.rs   # ProductRepository impl
├── orders.rs     # OrderRepository impl
└── models.rs     # Data structures
```

---

## Next Steps

- [Build System Guide](#/build-system) - Learn how to build and deploy
- [Development Workflow](#/development-workflow) - Set up your dev environment
- [Testing Guide](#/testing) - Learn how to test your code
