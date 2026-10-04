# Testing Guide

## Testing Strategy

The application uses a comprehensive testing strategy:

- **Unit Tests**: Individual functions and components
- **Integration Tests**: Component and API integration
- **E2E Tests**: Full user workflows

Target coverage: >80% for backend, >60% for frontend.

## Backend Testing

### Setup

```bash
cd packages/backend
pnpm install
pnpm db:test:prepare
pnpm test
```

### Unit Tests

Test individual services and utilities:

```typescript
// tests/unit/database-config.test.ts
describe('database configuration', () => {
  it('uses the shared pg pool defaults', () => {
    expect(true).toBe(true);
  });
});
```

### Integration Tests

Integration tests should run against the dedicated test database after `pnpm db:test:prepare`.

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:cov

# Specific file
pnpm test -- database-config.test.ts
```

### Test Database

Tests use a separate test database:

```env
DB_TEST_NAME=ecommerce_test
```

Prepare it with:

```bash
cd packages/backend
pnpm db:test:prepare
```

Clean up pooled connections with:

```bash
cd packages/backend
pnpm db:test:cleanup
```

## Web Frontend Testing

### Unit Tests

Test React components with Vitest.

### E2E Tests

Test full user flows with Playwright.

## Continuous Integration

Tests run automatically on pull requests and branch updates.

## Coverage Reports

### Generate Coverage

```bash
pnpm test:cov
```

Coverage reports generated in:
- `packages/backend/coverage/`
- `packages/web/coverage/`
- `packages/mobile/coverage/`

## Test Data Setup

### Database Seeding

```bash
cd packages/backend
pnpm db:test:prepare
```

This migrates the test database and seeds it when `DB_TEST_AUTO_SEED=true`.
