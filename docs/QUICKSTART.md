# Quick Start Guide

Get the ecommerce application running in minutes!

## Option 1: Docker Compose (Local Development)

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ (for host development)

### Quick Start
```bash
# Clone repository
git clone <repo-url>
cd ecommerce-aks-app

# Copy environment template
cp .env.example .env

# Edit .env with your Stripe keys (optional for demo)
# STRIPE_SECRET_KEY=sk_test_xxx
# STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Start all services
make docker-up

# Run migrations and seed data
docker exec ecommerce-backend npm run db:migrate
docker exec ecommerce-backend npm run db:seed

# Access applications
# Frontend: http://localhost:5173
# API: http://localhost:3000
# API Docs: http://localhost:3000/api/docs (if implemented)
```

### Test User Credentials (after seeding)
```
Email: user@example.com
Password: password123

Admin:
Email: admin@example.com
Password: admin123
```

### Development Workflow
```bash
# Watch logs
make docker-logs

# Stop services
make docker-down

# Rebuild images
make docker-build

# Access database
docker exec -it ecommerce-db psql -U postgres -d ecommerce
```

## Option 2: Local Development (Native)

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+

### Setup
```bash
# Clone repository
git clone <repo-url>
cd ecommerce-aks-app

# Install dependencies
pnpm install

# Copy and configure environment
cp .env.example .env

# Update .env with local database settings:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=postgres
```

### Start Services
```bash
# Terminal 1: Start PostgreSQL
# Option A: Docker
docker run --name ecommerce-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ecommerce \
  -p 5432:5432 \
  -d postgres:14

# Option B: Native PostgreSQL
# psql -U postgres -c "CREATE DATABASE ecommerce;"

# Terminal 2: Database setup
cd packages/backend
pnpm db:migrate
pnpm db:seed

# Terminal 3: Start backend
cd packages/backend
pnpm dev

# Terminal 4: Start web
cd packages/web
pnpm dev

# Terminal 5: Start mobile (optional)
cd packages/mobile
pnpm start
```

### Access Applications
- Web Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Mobile: Scan QR code in terminal with Expo Go app

## Option 3: Kubernetes (Minikube)

### Prerequisites
- Minikube installed
- kubectl installed
- Docker installed (for building images)

### Setup
```bash
# Start Minikube
minikube start --cpus=4 --memory=8192

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server

# Build images
docker build -f docker/Dockerfile.backend -t ecommerce-backend:latest .
docker build -f docker/Dockerfile.web -t ecommerce-web:latest .

# Load images into Minikube
minikube image load ecommerce-backend:latest
minikube image load ecommerce-web:latest

# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl apply -f k8s/secrets.yaml

# Create config
kubectl apply -f k8s/configmap.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/postgresql-pvc.yaml
kubectl apply -f k8s/postgresql-statefulset.yaml
kubectl apply -f k8s/postgresql-service.yaml

# Wait for PostgreSQL
kubectl wait --for=condition=ready pod -l app=postgresql -n ecommerce --timeout=300s

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Deploy web
kubectl apply -f k8s/web-deployment.yaml
kubectl apply -f k8s/web-service.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml

# Get Minikube IP
minikube ip  # e.g., 192.168.64.2

# Update /etc/hosts
echo "192.168.64.2  yourdomain.local" | sudo tee -a /etc/hosts

# Access applications
# http://yourdomain.local
# http://api.yourdomain.local
```

## Common Commands

### Monorepo Commands
```bash
pnpm install          # Install all dependencies
pnpm build           # Build all packages
pnpm test            # Run all tests
pnpm lint            # Lint all code
pnpm type-check      # Check TypeScript types
pnpm clean           # Clean build artifacts
```

### Database Commands
```bash
pnpm db:migrate      # Run pending migrations
pnpm db:rollback     # Rollback last migration
pnpm db:seed         # Seed sample data
pnpm db:reset        # Reset database (migrate + seed)
pnpm db:status       # Show migration status
```

### Development Commands
```bash
make dev             # Start all services
make backend-dev     # Start backend only
make web-dev         # Start web only
make mobile-dev      # Start mobile only
```

### Docker Commands
```bash
make docker-build    # Build images
make docker-up       # Start containers
make docker-down     # Stop containers
make docker-logs     # View logs
```

## Testing

### Run Tests
```bash
# All tests
pnpm test

# Specific package
cd packages/backend && pnpm test

# E2E tests
cd packages/web && pnpm test:e2e

# With coverage
pnpm test:cov
```

### Load Testing (Optional)
```bash
# Install k6
brew install k6  # or download from k6.io

# Run load test
k6 run load-test.js
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port
# Linux/Mac:
lsof -i :3000
kill -9 <PID>

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection credentials in .env
# Ensure DB_HOST, DB_USER, DB_PASSWORD are correct

# Test connection
psql -U postgres -h localhost -d ecommerce
```

### Module Not Found Error
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install

# Clear build cache
pnpm clean

# Rebuild
pnpm build
```

### Port 5173 Not Accessible
```bash
# Check if Vite is running
curl http://localhost:5173

# Restart dev server
# Kill the process and run: pnpm dev
```

## Performance Tips

### Development
- Use Docker Compose for isolated, consistent environment
- Enable hot reload (automatic on dev servers)
- Use Redux DevTools for state debugging
- Monitor browser console for errors

### Production
- Use Docker images with multi-stage builds
- Enable compression (Gzip)
- Optimize database indexes
- Configure connection pooling
- Use CDN for static assets

## Next Steps

1. **Customize**:
   - Update domain names in configuration
   - Add your Stripe keys
   - Configure SMTP for emails
   - Customize product data

2. **Develop**:
   - Review [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup
   - Check [API.md](API.md) for endpoint documentation
   - Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design

3. **Deploy**:
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md) for AKS deployment
   - Use [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) for verification

4. **Monitor**:
   - Setup logging aggregation
   - Configure monitoring and alerts
   - Review [TESTING.md](TESTING.md) for test strategies

## Getting Help

1. Check [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup instructions
2. Review error messages in logs
3. Search [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section
4. Check GitHub issues for similar problems
5. Create a new issue with details

---

**Congratulations!** Your ecommerce application is running! 🎉
