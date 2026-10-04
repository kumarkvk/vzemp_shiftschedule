# Database Guide

## Overview

Phase 5 uses PostgreSQL 14+ with reversible `db-migrate` migrations, connection pooling through `pg`, and realistic seed data for local and test environments.

- Backend migration directory: `packages/backend/migrations/`
- Seed entry point: `packages/backend/src/database/seeds/seed.ts`
- Test database default: `ecommerce_test`
- Persistence volume: `postgres_data` in `docker-compose.yml`

## Migration workflow

Migration files use a timestamp-first basename:

- Wrapper: `YYYYMMDDHHMMSS_description.js`
- Up SQL: `YYYYMMDDHHMMSS_description.up.sql`
- Down SQL: `YYYYMMDDHHMMSS_description.down.sql`

Current baseline migration:

- `20260922190000_initial_schema`

### Commands

Run from the repository root:

```bash
pnpm db:migrate
pnpm db:rollback
pnpm db:status
pnpm db:reset
pnpm db:seed
```

Backend-local equivalents:

```bash
cd packages/backend
pnpm db:migrate
pnpm db:rollback
pnpm db:status
pnpm db:reset
pnpm db:seed
```

`db:status` uses `db-migrate check` to report whether pending migrations remain.

## Environment configuration

`packages/backend/.env.example` documents the supported variables:

```env
DB_URL=
DB_TEST_URL=
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ecommerce
DB_TEST_NAME=ecommerce_test
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true
DB_ENABLE_QUERY_LOGGING=false
DB_STATEMENT_TIMEOUT=10000
```

### Environment behavior

- **development**: connects to `DB_NAME`
- **test**: connects to `DB_TEST_NAME` or `DB_TEST_URL`
- **production**: enables SSL by default unless overridden

## Schema summary

The initial migration creates:

- `users`
- `categories`
- `products`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `reviews`

### Data integrity rules

- UUID primary keys with `gen_random_uuid()`
- Foreign keys enforced across cart, order, payment, and review tables
- Cascading deletes for user-owned and order-owned dependent data
- `CHECK` constraints for positive prices, positive quantities, valid ratings, and non-negative inventory
- `deletedAt` soft-delete columns on core catalog and order tables
- `createdAt` / `updatedAt` audit columns
- `updatedAt` trigger maintenance on mutable tables

### Flexible data

- `orders.shippingAddress` uses `JSONB` for evolving address shapes
- PostgreSQL enums constrain:
  - `user_role`
  - `order_status`
  - `payment_status`

## Index strategy

The baseline migration optimizes the main read paths:

### Core indexes

- `users(role, createdAt desc)` and unique `email`
- `categories(name)`
- `products(categoryId)`, `products(sku)`, `products(isActive)`
- `cart_items(userId)`, `cart_items(productId)`, unique `(userId, productId)`
- `orders(userId)`, `orders(status)`, `orders(createdAt desc)`
- `order_items(orderId)`, `order_items(productId)`
- `payments(orderId)`, `payments(status)`, `payments(stripePaymentIntentId)`
- `reviews(productId)`, `reviews(userId)`

### Partial indexes

- Active products by category for catalog queries
- Active orders by user and status for order-history views
- Active users by role for admin management screens

These indexes favor:

- product listing by category and activity state
- checkout and cart lookups by owner
- user order history retrieval
- payment reconciliation by Stripe payment intent

## Connection management

`packages/backend/src/config/database.ts` provides:

- connection string construction
- a shared `pg` pool
- min 2 / max 20 connections
- 30-second idle timeout
- 2-second connection timeout
- statement timeout support
- query helper and transaction helper
- pool snapshot monitoring
- validation and health-check queries
- graceful shutdown hooks

Key exports:

- `getDatabase()`
- `query()`
- `withTransaction()`
- `validateDatabaseConnection()`
- `registerDatabaseShutdownHandlers()`
- `ensureDatabaseExists()`

## Seeding

The seed script inserts:

- 5 categories: Electronics, Clothing, Books, Home, Sports
- 20 products across all categories
- 3 users:
  - `user@example.com`
  - `admin@example.com`
  - `guest@example.com`
- sample orders, order items, and payments

Seeding behavior:

1. validates connectivity
2. truncates existing tables with cascading reset
3. inserts categories
4. inserts products
5. hashes passwords with bcrypt
6. inserts users
7. inserts orders, order items, and payments

## Test database setup

Helpers live in `packages/backend/src/database/testing/test-database.ts`.

Capabilities:

- creates `ecommerce_test` if missing
- runs migrations against the test database
- optionally seeds test data
- closes pooled connections during cleanup

Available scripts:

```bash
cd packages/backend
pnpm db:test:prepare
pnpm db:test:cleanup
```

## Backup and recovery

### Logical backup

```bash
pg_dump -U postgres -h localhost -d ecommerce > ecommerce-backup.sql
```

### Restore

```bash
psql -U postgres -h localhost -d ecommerce < ecommerce-backup.sql
```

### Point-in-time recovery concepts

For production, enable WAL archiving and base backups so restores can replay to a target timestamp:

1. take scheduled base backups
2. archive WAL files to durable storage
3. restore the latest base backup
4. replay WAL to the required recovery point

### Docker persistence

`docker-compose.yml` mounts PostgreSQL storage to the named volume:

```yaml
volumes:
  postgres_data:
```

Do not remove that volume in normal restart workflows if you need to preserve local data.

## Query-plan analysis

Use `EXPLAIN (ANALYZE, BUFFERS)` during tuning for slow queries, especially:

- category product listing
- order history queries
- payment lookup by Stripe intent id

Example:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM orders
WHERE "userId" = '00000000-0000-0000-0000-000000000000'
  AND status = 'pending'
  AND "deletedAt" IS NULL
ORDER BY "createdAt" DESC;
```
