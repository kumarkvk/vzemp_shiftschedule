# Development Guide

## Local Setup

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Docker & Docker Compose

### Installation

1. **Install dependencies**:
```bash
pnpm install
```

2. **Setup environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start PostgreSQL** (via Docker):
```bash
docker run --name ecommerce-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ecommerce -p 5432:5432 -d postgres:14
```

4. **Run migrations and seed data**:
```bash
cd packages/backend
pnpm db:migrate
pnpm db:seed
```

5. **Optional test database prep**:
```bash
cd packages/backend
pnpm db:test:prepare
```

### Development

Start services individually or with docker-compose:

```bash
# Backend
cd packages/backend && pnpm dev

# Web Frontend
cd packages/web && pnpm dev

# Mobile
cd packages/mobile && pnpm start
```

## Project Structure Details

### packages/backend/
```
src/
├── config/          # Configuration management
├── controllers/     # Route handlers
├── models/         # Database models
├── middleware/     # Express middleware
├── services/       # Business logic
├── routes/         # Route definitions
├── utils/          # Utility functions
├── types/          # TypeScript types
└── index.ts        # Entry point
```

### packages/web/
```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── services/      # API calls
├── hooks/         # Custom React hooks
├── context/       # Context providers
├── types/         # TypeScript types
└── main.tsx       # Entry point
```

### packages/mobile/
```
src/
├── screens/       # Screen components
├── components/    # Reusable components
├── navigation/    # Navigation config
├── services/      # API calls
├── store/         # Redux/Context store
├── types/         # TypeScript types
└── App.tsx        # Entry point
```

## Testing

### Run All Tests
```bash
pnpm test
```

### Run Specific Package Tests
```bash
cd packages/backend && pnpm test
cd packages/web && pnpm test:e2e
```

### Coverage Report
```bash
pnpm test:cov
```

## Code Quality

### Linting
```bash
pnpm lint
```

### Type Checking
```bash
pnpm type-check
```

### Formatting
```bash
pnpm format
```

## Debugging

### Backend
Set breakpoint and run with inspector:
```bash
node --inspect-brk dist/index.js
```

Then open `chrome://inspect` in Chrome DevTools.

### Frontend
Use browser DevTools for debugging React components and network calls.

## Database

### View Database
```bash
psql -U postgres -d ecommerce -h localhost
```

### Reset Database
```bash
pnpm db:reset
```

### Migration Status
```bash
pnpm db:status
```

### Create New Migration
```bash
cd packages/backend
pnpm db:create:migration <timestamp_description>
```

Follow the Phase 5 convention:

- `YYYYMMDDHHMMSS_description.js`
- `YYYYMMDDHHMMSS_description.up.sql`
- `YYYYMMDDHHMMSS_description.down.sql`

## API Documentation

See [API.md](API.md) for complete endpoint documentation.

## Troubleshooting

### Port Already in Use
Change the port in .env and restart services.

### Database Connection Failed
Ensure PostgreSQL is running and credentials in .env are correct.

### Module Not Found
Run `pnpm install` and ensure all dependencies are installed.
