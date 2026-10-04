# Ecommerce AKS App

A complete, production-ready ecommerce application built with **Node.js/Express**, **React**, **React Native**, **PostgreSQL**, **Docker**, and **Kubernetes (AKS)**.

## 🎯 Project Overview

This is an enterprise-grade ecommerce platform with:

- **Backend API**: Express.js with TypeScript, JWT authentication, Stripe payments
- **Web Frontend**: React + Vite with Tailwind CSS, product browsing, cart, checkout
- **Mobile App**: React Native + Expo for iOS/Android
- **Database**: PostgreSQL with migrations and seed data
- **Containerization**: Docker for all services with docker-compose for local development
- **Orchestration**: Kubernetes manifests for AKS deployment with autoscaling, health checks, and network policies
- **CI/CD**: Azure Pipelines for automated testing, building, and deployment
- **Testing**: Unit, integration, and E2E test suites with >80% coverage

## 📦 Project Structure

```
.
├── packages/
│   ├── backend/           # Express API server
│   ├── web/              # React web application
│   └── mobile/           # React Native mobile app
├── k8s/                  # Kubernetes manifests for AKS
├── docker/               # Docker build contexts and configs
├── scripts/              # Utility and automation scripts
├── docs/                 # Complete documentation
├── Makefile              # Development commands
├── docker-compose.yml    # Local development setup
└── package.json          # Monorepo configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** 8+
- **Docker** and **Docker Compose** (for containerized development)
- **PostgreSQL** 14+ (or use Docker)
- **kubectl** (for Kubernetes deployment)

### Local Development

1. **Clone and install dependencies**:
   ```bash
   git clone <repo-url>
   cd ecommerce-aks-app
   pnpm install
   ```

2. **Setup environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose** (recommended):
   ```bash
   make docker-up
   make db-migrate
   make db-seed
   ```

4. **Or start individual services**:
   ```bash
   # Terminal 1 - Backend API
   cd packages/backend && pnpm dev

   # Terminal 2 - Web Frontend
   cd packages/web && pnpm dev

   # Terminal 3 - Mobile App
   cd packages/mobile && pnpm start
   ```

5. **Access the applications**:
   - Web App: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api/docs
   - Mobile: Expo Go app (QR code in terminal)

## 🏗️ Architecture

### Backend API

- **Authentication**: JWT-based authentication with secure password hashing
- **Products**: Full CRUD operations with categories and search
- **Shopping Cart**: Persistent cart management
- **Orders**: Order processing with order items tracking
- **Payments**: Stripe integration for real payment processing
- **Admin Panel**: Administrative endpoints for system management
- **Validation**: Input validation with express-validator
- **Error Handling**: Comprehensive error handling middleware
- **Logging**: Winston logger for application and error logging
- **Database**: PostgreSQL with connection pooling

**Key Endpoints**:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /products` - List products (with pagination/search)
- `POST /cart/items` - Add to cart
- `POST /orders` - Create order
- `POST /orders/:id/pay` - Process payment via Stripe
- `GET /admin/dashboard` - Admin dashboard data

### Web Frontend

- **UI Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with responsive design
- **Routing**: React Router v6
- **State Management**: Context API + local state
- **API Client**: Axios with interceptors
- **Forms**: React Hook Form with validation
- **Components**: Reusable component library

**Key Pages**:
- Product listing with filtering and search
- Product detail page
- Shopping cart
- Checkout flow
- Order history
- User profile
- Admin dashboard

### Mobile App

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **State Management**: Redux/Context API
- **API Client**: Axios
- **Payment**: Stripe mobile SDK
- **Platform Support**: iOS and Android

**Key Features**:
- Same features as web (products, cart, checkout)
- Mobile-optimized UI
- Offline support (planned)
- Push notifications (planned)

### Database

PostgreSQL database with the following schema:

- `users` - User accounts and profiles
- `products` - Product catalog
- `categories` - Product categories
- `cart_items` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Items in an order
- `payments` - Payment records
- `reviews` - Product reviews (planned)

See [DATABASE.md](docs/DATABASE.md) for detailed schema.

### Infrastructure

- **Containerization**: Docker multi-stage builds for optimized images
- **Orchestration**: Kubernetes (tested on AKS)
- **Service Mesh**: (Optional) Istio ready
- **Ingress**: NGINX ingress controller
- **Networking**: Network policies for security
- **Autoscaling**: Horizontal Pod Autoscaler (HPA)
- **Health Checks**: Liveness and readiness probes

## 📚 Documentation

**Getting Started:**
- **[QUICKSTART.md](docs/QUICKSTART.md)** - 5-minute quick start (Docker Compose, Local, or Kubernetes)

**Detailed Guides:**
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and component overview
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Local development setup and workflows
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - AKS deployment guide with step-by-step instructions
- **[API.md](docs/API.md)** - Complete API endpoint documentation with examples
- **[DATABASE.md](docs/DATABASE.md)** - Database schema, migrations, and management
- **[TESTING.md](docs/TESTING.md)** - Testing strategy, unit tests, integration tests, and E2E tests
- **[MOBILE.md](docs/MOBILE.md)** - React Native setup, building, and app store submission

**Reference:**
- **[DEPLOYMENT-CHECKLIST.md](docs/DEPLOYMENT-CHECKLIST.md)** - Pre-deployment verification and post-deployment steps
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🧪 Testing

Run tests with:

```bash
# All tests
pnpm test

# With coverage
pnpm test:cov

# Specific package
cd packages/backend && pnpm test

# Watch mode
pnpm test:watch
```

## 🐳 Docker & Kubernetes

### Local Development with Docker

```bash
# Start all services
make docker-up

# View logs
make docker-logs

# Stop services
make docker-down
```

### Deploy to AKS

```bash
# Apply Kubernetes manifests
make k8s-apply

# View resources
kubectl get pods -n ecommerce

# View logs
kubectl logs -n ecommerce -l app=backend

# Delete resources
make k8s-delete
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed AKS deployment instructions.

## 🔐 Security

- **Passwords**: Hashed with bcryptjs
- **JWT**: Secure token-based authentication
- **CORS**: Configured for specific origins
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Helmet.js headers
- **Rate Limiting**: Redis-based rate limiting (planned)
- **Secrets Management**: Environment variables + Kubernetes secrets

## 📊 Performance

- **Database**: Connection pooling with configurable pool size
- **Caching**: Redis caching (planned)
- **CDN**: Static asset optimization
- **Compression**: gzip compression on responses
- **Load Balancing**: Kubernetes service load balancing
- **Auto-scaling**: HPA with CPU/memory metrics

## 🚢 CI/CD Pipeline

Automated with Azure Pipelines:

1. **Build Stage**: Lint, type-check, run tests
2. **Package Stage**: Build Docker images
3. **Push Stage**: Push to Azure Container Registry (ACR)
4. **Deploy Stage**: Deploy to AKS with Helm (optional) or kubectl

See `azure-pipelines.yml` for pipeline configuration.

## 📝 Available Commands

```bash
# Install and build
make install          # Install all dependencies
make build           # Build all packages
make clean           # Clean build artifacts

# Development
make dev             # Start all services
make backend-dev     # Start backend only
make web-dev         # Start web only
make mobile-dev      # Start mobile only

# Testing
make test            # Run all tests
make test-cov        # Run tests with coverage
make lint            # Lint all packages
make type-check      # TypeScript type checking

# Database
make db-migrate      # Run migrations
make db-seed         # Seed test data
make db-reset        # Reset database

# Docker
make docker-build    # Build images
make docker-up       # Start containers
make docker-down     # Stop containers
make docker-logs     # View logs

# Kubernetes
make k8s-apply       # Deploy to AKS
make k8s-delete      # Remove from AKS
```

## 🤝 Contributing

1. Create a feature branch
2. Make changes with proper tests
3. Run linting and type-checking
4. Create a pull request

## 📄 License

MIT

## 🆘 Support

For issues and questions:
1. Check existing documentation in `/docs`
2. Review API documentation
3. Create a GitHub issue

---

**Built with ❤️ for production ecommerce applications**
