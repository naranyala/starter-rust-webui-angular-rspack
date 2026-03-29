# SQLite CRUD Demo

A complete, production-ready CRUD (Create, Read, Update, Delete) demonstration using SQLite database with Rust backend and Angular frontend.

---

## 🎯 Features

- ✅ **Create** - Add new users with validation
- ✅ **Read** - View all users with search/filter
- ✅ **Update** - Edit existing user data
- ✅ **Delete** - Remove users with confirmation
- ✅ **Validation** - Frontend and backend validation
- ✅ **Error Handling** - Comprehensive error messages
- ✅ **Loading States** - Proper UI feedback
- ✅ **Responsive** - Works on all screen sizes

---

## 📊 Database Schema

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'User',
    status TEXT DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

---

## 🔧 Backend Implementation

### Repository Layer

```rust
// src/core/infrastructure/database/repositories.rs
impl UserRepository for Database {
    fn create(&self, name: &str, email: &str, role: &str, status: &str) -> AppResult<i64> {
        self.insert_user(name, email, role, status)
    }

    fn get_all(&self) -> AppResult<Vec<User>> {
        let models = self.get_all_users()?;
        Ok(models.into_iter().map(|m| User {
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
            status: m.status,
            created_at: m.created_at,
        }).collect())
    }

    fn update(&self, id: i64, name: Option<&str>, email: Option<&str>, 
              role: Option<&str>, status: Option<&str>) -> AppResult<usize> {
        self.update_user(id, name.map(|s| s.to_string()), 
                        email.map(|s| s.to_string()),
                        role.map(|s| s.to_string()),
                        status.map(|s| s.to_string()))
    }

    fn delete(&self, id: i64) -> AppResult<usize> {
        self.delete_user(id)
    }
}
```

### WebUI Handlers

```rust
// src/core/presentation/webui/handlers/db_handlers.rs

// CREATE
window.bind("createUser", |event| {
    let element_name = unsafe {
        std::ffi::CStr::from_ptr(event.element)
            .to_string_lossy()
            .into_owned()
    };
    let window = event.get_window();
    let parts = parse_params(&element_name);
    
    let name = if parts.len() > 1 { parts[1] } else { "" };
    let email = if parts.len() > 2 { parts[2] } else { "" };
    let role = if parts.len() > 3 { parts[3] } else { "User" };
    let status = if parts.len() > 4 { parts[4] } else { "Active" };

    let Some(db) = get_db() else {
        send_error_response(window, "user_create_response", 
            &AppError::DependencyInjection(/* ... */));
        return;
    };

    handle_db_result(window, "user_create_response", 
        db.insert_user(name, email, role, status));
});

// READ
window.bind("getUsers", |event| {
    let window = event.get_window();
    let Some(db) = get_db() else {
        send_error_response(window, "db_response", /* ... */);
        return;
    };
    handle_db_result(window, "db_response", db.get_all_users());
});

// UPDATE
window.bind("updateUser", |event| { /* ... */ });

// DELETE
window.bind("deleteUser", |event| { /* ... */ });
```

---

## 💻 Frontend Implementation

### Service Layer

```typescript
// frontend/src/core/api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  async callOrThrow<T>(functionName: string, args: unknown[] = []): Promise<T> {
    const response = await this.call<T>(functionName, args);
    if (!response.success) {
      throw new Error(response.error ?? 'Unknown error');
    }
    return response.data as T;
  }
}

// frontend/src/views/sqlite/sqlite.component.ts
@Injectable({ providedIn: 'root' })
export class SqliteService {
  private readonly api = inject(ApiService);

  async getUsers(): Promise<User[]> {
    return this.api.callOrThrow<User[]>('getUsers');
  }

  async createUser(user: CreateUserDto): Promise<number> {
    return this.api.callOrThrow<number>('createUser', [
      user.name, user.email, user.role, user.status
    ]);
  }

  async updateUser(id: number, updates: UpdateUserDto): Promise<void> {
    await this.api.callOrThrow('updateUser', [
      id, updates.name, updates.email, updates.role, updates.status
    ]);
  }

  async deleteUser(id: number): Promise<void> {
    await this.api.callOrThrow('deleteUser', [id]);
  }
}
```

### Component Layer

```typescript
@Component({
  selector: 'app-sqlite-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sqlite-wrapper">
      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-value">{{ stats().totalUsers }}</span>
          <span class="stat-label">Total Users</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="sqlite-tabs">
        <button [class.active]="activeTab() === 'list'" 
                (click)="setActiveTab('list')">
          📋 User List
        </button>
        <button [class.active]="activeTab() === 'create'" 
                (click)="setActiveTab('create')">
          ➕ Add User
        </button>
      </div>

      <!-- User List Tab -->
      @if (activeTab() === 'list') {
        <div class="tab-content">
          <!-- Search Toolbar -->
          <div class="toolbar">
            <input type="text" placeholder="Search users..." 
                   [(ngModel)]="searchQuery" (input)="filterUsers()" />
            <button (click)="loadUsers()">🔄 Refresh</button>
          </div>

          <!-- Loading State -->
          @if (isLoading()) {
            <div class="loading">Loading users...</div>
          }

          <!-- Empty State -->
          @else if (filteredUsers().length === 0) {
            <div class="empty-state">No users found</div>
          }

          <!-- User Table -->
          @else {
            <div class="user-table">
              <div class="table-header">
                <div class="col">Name</div>
                <div class="col">Email</div>
                <div class="col">Role</div>
                <div class="col">Status</div>
                <div class="col">Actions</div>
              </div>
              @for (user of filteredUsers(); track user.id) {
                <div class="table-row">
                  <div class="col">{{ user.name }}</div>
                  <div class="col">{{ user.email }}</div>
                  <div class="col">{{ user.role }}</div>
                  <div class="col">
                    <span class="status-badge" 
                          [class.status-active]="user.status === 'Active'">
                      {{ user.status }}
                    </span>
                  </div>
                  <div class="col actions">
                    <button class="action-btn edit" (click)="editUser(user)">
                      ✏️
                    </button>
                    <button class="action-btn delete" (click)="deleteUser(user)">
                      🗑️
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Create User Tab -->
      @if (activeTab() === 'create') {
        <form class="user-form" (ngSubmit)="createUser()">
          <div class="form-group">
            <label>Name *</label>
            <input type="text" [(ngModel)]="newUser.name" 
                   name="name" required />
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input type="email" [(ngModel)]="newUser.email" 
                   name="email" required />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select [(ngModel)]="newUser.role" name="role">
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <button type="submit" [disabled]="isLoading()">
            {{ isLoading() ? 'Creating...' : 'Create User' }}
          </button>
        </form>
      }
    </div>
  `
})
export class SqliteCrudComponent {
  private readonly logger = inject(LoggerService);
  private readonly api = inject(ApiService);

  // State
  activeTab = signal<'list' | 'create'>('list');
  isLoading = signal(false);
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  searchQuery = '';

  // Stats
  stats = signal({ totalUsers: 0 });

  // New user form
  newUser = signal({ 
    name: '', 
    email: '', 
    role: 'User', 
    status: 'Active' 
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.isLoading.set(true);
    try {
      const users = await this.api.callOrThrow<User[]>('getUsers');
      this.users.set(users);
      this.filteredUsers.set(users);
      this.stats.update(s => ({ ...s, totalUsers: users.length }));
    } catch (error) {
      this.logger.error('Failed to load users', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  filterUsers(): void {
    const query = this.searchQuery.toLowerCase();
    const filtered = this.users().filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
    this.filteredUsers.set(filtered);
  }

  async createUser(): Promise<void> {
    if (!this.newUser().name || !this.newUser().email) {
      this.logger.error('Name and email are required');
      return;
    }

    this.isLoading.set(true);
    try {
      await this.api.callOrThrow('createUser', [
        this.newUser().name,
        this.newUser().email,
        this.newUser().role,
        this.newUser().status
      ]);
      this.newUser.set({ name: '', email: '', role: 'User', status: 'Active' });
      this.loadUsers();
      this.activeTab.set('list');
    } catch (error) {
      this.logger.error('Failed to create user', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteUser(user: User): Promise<void> {
    if (!confirm(`Delete ${user.name}?`)) return;

    try {
      await this.api.callOrThrow('deleteUser', [user.id]);
      this.loadUsers();
    } catch (error) {
      this.logger.error('Failed to delete user', error);
    }
  }
}
```

---

## 🎨 Styling

```css
.sqlite-wrapper {
  padding: 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 12px;
  min-height: 500px;
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  padding: 20px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
}

.sqlite-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.sqlite-tabs button {
  padding: 12px 24px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
}

.sqlite-tabs button.active {
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  border-color: transparent;
  color: #fff;
}

.user-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 120px;
  gap: 16px;
  padding: 12px;
}

.table-header {
  background: rgba(30, 41, 59, 0.8);
  font-weight: 600;
  border-radius: 8px;
}

.table-row {
  background: rgba(30, 41, 59, 0.3);
  border-radius: 8px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.status-badge.status-active {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}
```

---

## ✅ Testing Checklist

### Backend Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_and_get_user() {
        let db = Database::new(":memory:").unwrap();
        db.init().unwrap();

        let user_id = db.insert_user("Test", "test@example.com", "User", "Active")
            .expect("Failed to create user");

        let user = db.get_user_by_id(user_id)
            .expect("Failed to get user")
            .expect("User not found");

        assert_eq!(user.name, "Test");
        assert_eq!(user.email, "test@example.com");
    }

    #[test]
    fn test_update_user() {
        // ... test update logic
    }

    #[test]
    fn test_delete_user() {
        // ... test delete logic
    }

    #[test]
    fn test_duplicate_email_validation() {
        // ... test unique constraint
    }
}
```

### Frontend Tests

```typescript
describe('SqliteCrudComponent', () => {
  it('should load users on init', () => {
    const fixture = TestBed.createComponent(SqliteCrudComponent);
    fixture.detectChanges();
    
    expect(component.users().length).toBeGreaterThan(0);
  });

  it('should filter users by search query', () => {
    component.searchQuery = 'john';
    component.filterUsers();
    
    expect(component.filteredUsers().every(u => 
      u.name.toLowerCase().includes('john')
    )).toBe(true);
  });

  it('should create user with valid data', async () => {
    component.newUser.set({
      name: 'Test User',
      email: 'test@example.com',
      role: 'User',
      status: 'Active'
    });
    
    await component.createUser();
    
    expect(component.users().some(u => u.email === 'test@example.com'))
      .toBe(true);
  });

  it('should show error for duplicate email', async () => {
    // ... test duplicate email handling
  });
});
```

---

## 🚀 Running the Demo

1. **Start the application:**
   ```bash
   ./run.sh
   ```

2. **Navigate to Demo:**
   - Open DevTools panel
   - Click "Thirdparty Demos" → "SQLite CRUD"

3. **Try the features:**
   - View all users in the list
   - Search/filter users
   - Add a new user
   - Edit an existing user
   - Delete a user (with confirmation)

---

## 📝 API Reference

### Backend Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getUsers` | - | `User[]` | Get all users |
| `createUser` | `name, email, role, status` | `i64` | Create new user |
| `updateUser` | `id, name, email, role, status` | `usize` | Update user |
| `deleteUser` | `id` | `usize` | Delete user |

### Frontend Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `loadUsers()` | - | `Promise<void>` | Load all users |
| `createUser()` | - | `Promise<void>` | Create from form |
| `deleteUser(user)` | `User` | `Promise<void>` | Delete user |
| `filterUsers()` | - | `void` | Apply search filter |

---

## 🔒 Security Considerations

1. **Input Validation**
   - Frontend: Required fields, email format
   - Backend: Validate all inputs, check constraints

2. **SQL Injection Prevention**
   - Use parameterized queries (rusqlite does this)
   - Never concatenate user input into SQL

3. **Error Messages**
   - Don't expose internal errors to frontend
   - Log detailed errors, show user-friendly messages

---

## 🎯 Next Steps

- [DuckDB CRUD Demo](#/demo_duckdb_crud) - Try DuckDB version
- [Interactive Checklist](#/demo_checklist) - Feature checklist
- [WebSocket Demo](#/demo_websocket) - Real-time updates

---

**Last Updated:** 2026-03-29  
**Status:** ✅ Production Ready
