# Production CRUD Documentation Index

Focused documentation for production-ready DuckDB and SQLite CRUD integrations.

---

## 📚 Documentation Structure

### Core Guides

| Document | Description | Icon |
|----------|-------------|------|
| [Getting Started](01-GETTING_STARTED.md) | Quick start and setup | 🚀 |
| [SQLite CRUD Production](02-sqlite-crud-production.md) | Complete SQLite implementation | 🗄️ |
| [DuckDB CRUD Production](03-duckdb-crud-production.md) | Complete DuckDB implementation | 🦆 |
| [API Reference](04-api-reference.md) | Complete API documentation | 📚 |
| [Security Best Practices](05-security-best-practices.md) | Security patterns | 🔒 |
| [Deployment Production](06-deployment-production.md) | Production deployment | 📦 |

---

## 🎯 Quick Navigation

### For New Developers
1. **[Getting Started](01-GETTING_STARTED.md)** - Setup and first run
2. **[SQLite CRUD Guide](02-sqlite-crud-production.md)** - Learn the basics
3. **[API Reference](04-api-reference.md)** - Understand the interfaces

### For Database Implementation
- **Transaction-focused (OLTP):** [SQLite Guide](02-sqlite-crud-production.md)
- **Analytics-focused (OLAP):** [DuckDB Guide](03-duckdb-crud-production.md)

### For Production Deployment
1. **[Security Guide](05-security-best-practices.md)** - Secure your application
2. **[Deployment Guide](06-deployment-production.md)** - Deploy to production

---

## 📊 Database Comparison

| Feature | SQLite | DuckDB |
|---------|--------|--------|
| **Use Case** | Transactions (OLTP) | Analytics (OLAP) |
| **Best For** | CRUD operations | Data analysis |
| **Storage** | Row-based | Columnar |
| **Performance** | Fast point queries | Fast aggregations |

---

## 🔧 Common Tasks

### Build Commands

```bash
# Development build
./run.sh --build

# Release build
./run.sh --release

# Clean build
./run.sh --clean
```

### Database Operations

```typescript
// SQLite: User CRUD
const users = await sqliteService.getUsers();
await sqliteService.createUser({ name: 'John', email: 'john@example.com' });

// DuckDB: Analytics
const stats = await duckDbService.getCategoryStats();
const trend = await duckDbService.getSalesTrend(30);
```

---

## 📁 Archived Documentation

Older general documentation has been moved to `docs/archive/`:
- Project overview
- Architecture guide  
- Changelog
- Build system details
- Development workflow
- Old demo files

---

## 📞 Getting Help

1. Check the relevant guide above
2. Review [API Reference](04-api-reference.md)
3. Check application logs: `logs/application.log`
4. Use DevTools panel for debugging

---

**Last Updated:** 2026-03-31  
**Focus:** Production-Ready CRUD Integrations
