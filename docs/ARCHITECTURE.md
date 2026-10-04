# System Architecture

## Overview

The ecommerce application follows a modern microservices-ready architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
├──────────────────────────────┬──────────────────────────────┤
│  Web Frontend (React)        │  Mobile App (React Native)   │
│  - Vite                      │  - Expo                      │
│  - React Router              │  - React Navigation          │
│  - Tailwind CSS              │  - Redux/Context             │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               └──────────────┬───────────────┘
                              │
                     HTTP/REST API
                              │
               ┌──────────────▼───────────────┐
               │   API Gateway / Ingress      │
               │  (NGINX / APIM)              │
               └──────────────┬───────────────┘
                              │
               ┌──────────────▼───────────────┐
               │   Backend API Service        │
               ├──────────────────────────────┤
               │  Express.js (TypeScript)     │
               │  - JWT Authentication       │
               │  - REST Endpoints           │
               │  - Stripe Integration       │
               │  - Request Validation       │
               │  - Error Handling           │
               │  - Logging & Monitoring     │
               └──────────────┬───────────────┘
                              │
               ┌──────────────┴───────────────────┬──────────────┐
               │                                  │              │
               ▼                                  ▼              ▼
          PostgreSQL                        Redis Cache      Stripe API
          - Users                          (Planned)         - Payments
          - Products
          - Orders
          - Payments
```

## Component Details

### 1. Client Layer

#### Web Frontend (packages/web/)
- **Technology**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Context API + local state
- **API Communication**: Axios with interceptors
- **Build Tool**: Vite for fast development and optimized production builds

#### Mobile App (packages/mobile/)
- **Technology**: React Native + Expo + TypeScript
- **Navigation**: React Navigation
- **State Management**: Redux or Context API
- **API Communication**: Axios
- **Platform Support**: iOS and Android

### 2. Backend API (packages/backend/)

- **Framework**: Express.js with TypeScript
- **Authentication**: JWT tokens
- **Database**: PostgreSQL with node-postgres
- **Validation**: express-validator middleware
- **Error Handling**: Custom middleware
- **Logging**: Winston logger
- **Payment Processing**: Stripe API integration

### 3. Data Layer

#### PostgreSQL Database
- Connection pooling with configurable pool size
- Migrations for schema versioning
- Seed data for testing
- Tables: users, products, categories, cart_items, orders, order_items, payments

### 4. Infrastructure

#### Docker
- Multi-stage builds for optimized images
- docker-compose for local development
- Separate Dockerfiles for each service

#### Kubernetes (AKS)
- Deployments for stateless services
- StatefulSet for PostgreSQL
- Services for networking
- Ingress for external access
- HPA for auto-scaling
- Network policies for security
- Health checks and monitoring

---

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment architecture.
