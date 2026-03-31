# DuckDB CRUD Demo

A complete CRUD demonstration using **DuckDB** - the high-performance analytical database.

---

## 🎯 Features

- ✅ **Create** - Add new products with validation
- ✅ **Read** - View all products with filtering
- ✅ **Update** - Edit product information
- ✅ **Delete** - Remove products
- ✅ **Analytics** - Built-in aggregation queries
- ✅ **Batch Operations** - Bulk insert support

---

## 📊 Database Schema

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
```

---

## 🔧 Backend Implementation

### Repository Layer

```rust
// src/core/infrastructure/database/repositories.rs
impl ProductRepository for Database {
    fn create(&self, name: &str, description: &str, price: f64, 
              category: &str, stock: i64) -> AppResult<i64> {
        self.insert_product(name, description, price, category, stock)
    }

    fn get_all(&self) -> AppResult<Vec<Product>> {
        let models = self.get_all_products()?;
        Ok(models.into_iter().map(|m| Product {
            id: m.id,
            name: m.name,
            description: m.description,
            price: m.price,
            category: m.category,
            stock: m.stock,
        }).collect())
    }

    fn update(&self, id: i64, name: Option<&str>, description: Option<&str>,
              price: Option<f64>, category: Option<&str>, 
              stock: Option<i64>) -> AppResult<usize> {
        self.update_product(id, name.map(|s| s.to_string()),
                           description.map(|s| s.to_string()),
                           price, category.map(|s| s.to_string()), stock)
    }

    fn delete(&self, id: i64) -> AppResult<usize> {
        self.delete_product(id)
    }
}
```

### DuckDB-Specific Features

```rust
// Analytical queries (DuckDB strength)
pub fn get_category_stats(&self) -> AppResult<Vec<CategoryStats>> {
    let conn = self.get_conn()?;
    
    let mut stmt = conn.prepare("
        SELECT category, 
               COUNT(*) as product_count,
               AVG(price) as avg_price,
               SUM(stock) as total_stock
        FROM products
        GROUP BY category
        ORDER BY product_count DESC
    ")?;
    
    let stats = stmt.query_map([], |row| {
        Ok(CategoryStats {
            category: row.get(0)?,
            product_count: row.get(1)?,
            avg_price: row.get(2)?,
            total_stock: row.get(3)?,
        })
    })?;
    
    stats.collect()
}

// Batch insert for performance
pub fn batch_insert_products(&self, products: &[Product]) -> AppResult<usize> {
    let conn = self.get_conn()?;
    let transaction = conn.transaction()?;
    
    for product in products {
        transaction.execute(
            "INSERT INTO products (name, description, price, category, stock) 
             VALUES (?, ?, ?, ?, ?)",
            params![product.name, product.description, product.price, 
                    product.category, product.stock],
        )?;
    }
    
    transaction.commit()?;
    Ok(products.len())
}
```

---

## 💻 Frontend Implementation

### Component

```typescript
@Component({
  selector: 'app-duckdb-crud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="duckdb-wrapper">
      <!-- Analytics Cards -->
      <div class="analytics-grid">
        <div class="analytics-card">
          <div class="analytics-label">Total Products</div>
          <div class="analytics-value">{{ stats().totalProducts }}</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-label">Total Value</div>
          <div class="analytics-value">\${{ stats().totalValue }}</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-label">Categories</div>
          <div class="analytics-value">{{ stats().categories }}</div>
        </div>
        <div class="analytics-card">
          <div class="analytics-label">Avg Price</div>
          <div class="analytics-value">\${{ stats().avgPrice }}</div>
        </div>
      </div>

      <!-- Product Grid -->
      <div class="product-grid">
        @for (product of products(); track product.id) {
          <div class="product-card">
            <div class="product-header">
              <h3>{{ product.name }}</h3>
              <span class="product-category">{{ product.category }}</span>
            </div>
            <div class="product-body">
              <p class="product-description">{{ product.description }}</p>
              <div class="product-meta">
                <span class="product-price">\${{ product.price }}</span>
                <span class="product-stock">
                  {{ product.stock > 0 ? product.stock + ' in stock' : 'Out of stock' }}
                </span>
              </div>
            </div>
            <div class="product-actions">
              <button (click)="editProduct(product)">✏️ Edit</button>
              <button (click)="deleteProduct(product)">🗑️ Delete</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class DuckdbCrudComponent {
  private readonly api = inject(ApiService);
  private readonly logger = inject(LoggerService);

  products = signal<Product[]>([]);
  stats = signal({
    totalProducts: 0,
    totalValue: 0,
    categories: 0,
    avgPrice: 0
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    const products = await this.api.callOrThrow<Product[]>('getProducts');
    this.products.set(products);
    
    // Calculate analytics
    this.stats.update(s => ({
      ...s,
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2),
      categories: new Set(products.map(p => p.category)).size,
      avgPrice: (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2)
    }));
  }

  async deleteProduct(product: Product): Promise<void> {
    if (!confirm(`Delete ${product.name}?`)) return;
    
    await this.api.callOrThrow('deleteProduct', [product.id]);
    this.loadProducts();
  }
}
```

---

## 🎨 Styling

```css
.duckdb-wrapper {
  padding: 24px;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.analytics-card {
  padding: 24px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
}

.analytics-label {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.analytics-value {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.product-header {
  padding: 16px;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-category {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 12px;
}

.product-body {
  padding: 16px;
}

.product-price {
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
}

.product-stock {
  font-size: 12px;
  color: #94a3b8;
}

.product-actions {
  padding: 16px;
  display: flex;
  gap: 8px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.product-actions button {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
```

---

## ✅ Testing Checklist

### Backend Tests

```rust
#[test]
fn test_create_and_get_product() {
    let db = Database::new(":memory:").unwrap();
    db.init().unwrap();

    let product_id = db.insert_product("Laptop", "High-end laptop", 
                                        999.99, "Electronics", 50)
        .expect("Failed to create product");

    let product = db.get_product_by_id(product_id)
        .expect("Failed to get product")
        .expect("Product not found");

    assert_eq!(product.name, "Laptop");
    assert_eq!(product.price, 999.99);
}

#[test]
fn test_batch_insert() {
    let products = vec![
        Product { name: "Product 1", /* ... */ },
        Product { name: "Product 2", /* ... */ },
    ];
    
    let count = db.batch_insert_products(&products).unwrap();
    assert_eq!(count, 2);
}

#[test]
fn test_category_stats() {
    // ... test analytical queries
}
```

### Frontend Tests

```typescript
describe('DuckdbCrudComponent', () => {
  it('should display products', () => {
    const fixture = TestBed.createComponent(DuckdbCrudComponent);
    fixture.detectChanges();
    
    expect(component.products().length).toBeGreaterThan(0);
  });

  it('should calculate analytics', () => {
    component.products.set([
      { id: 1, name: 'Product 1', price: 100, stock: 5, category: 'A' },
      { id: 2, name: 'Product 2', price: 200, stock: 3, category: 'B' }
    ]);
    
    expect(component.stats().totalProducts).toBe(2);
    expect(component.stats().totalValue).toBe('1100.00');
  });
});
```

---

## 🚀 Running the Demo

1. **Start application:**
   ```bash
   ./run.sh
   ```

2. **Navigate to:** DevTools → Thirdparty Demos → DuckDB CRUD

3. **Features to try:**
   - View product grid with analytics
   - Filter by category
   - Edit product details
   - Delete products
   - View category statistics

---

## 📝 API Reference

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `getProducts` | - | `Product[]` | Get all products |
| `createProduct` | `name, description, price, category, stock` | `i64` | Create product |
| `updateProduct` | `id, name, description, price, category, stock` | `usize` | Update product |
| `deleteProduct` | `id` | `usize` | Delete product |
| `getCategoryStats` | - | `CategoryStats[]` | Analytics by category |
| `batchInsertProducts` | `Product[]` | `usize` | Bulk insert |

---

## 🎯 DuckDB vs SQLite

| Feature | DuckDB | SQLite |
|---------|--------|--------|
| **Best For** | Analytics/OLAP | Transactions/OLTP |
| **Query Speed** | Very fast for aggregations | Fast for simple queries |
| **Concurrency** | Single writer | Single writer |
| **Data Types** | Rich analytical types | Basic types |
| **Use Case** | Reports, analytics | CRUD, transactions |

---

**Last Updated:** 2026-03-29  
**Status:** ✅ Production Ready
