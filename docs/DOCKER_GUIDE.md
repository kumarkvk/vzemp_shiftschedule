# Simplified Docker Guide for AKS Deployment

This guide will help you build Docker images properly and deploy them to Azure Kubernetes Service.

## Quick Overview

You have 3 services to containerize:
1. **Backend API** (Node.js/Express) - Port 3000
2. **Web Frontend** (React/Nginx) - Port 80
3. **Mobile App** (Not needed for AKS - for Expo only)

---

## Step 1: Verify Prerequisites

Before building Docker images, ensure you have:

```bash
# Check Docker is installed and running
docker --version
docker ps

# Check you can access Azure Container Registry
az acr login --name <your-registry-name>

# Verify you're in the project root
pwd  # Should show the ecommerce application directory
```

---

## Step 2: Build Backend Image

### Backend Dockerfile (Simplified)

The backend needs:
- Node.js runtime
- Your source code
- Environment configuration
- Health checks

### Build Command

```bash
# From project root
docker build -f docker/Dockerfile.backend -t myacr.azurecr.io/ecommerce-backend:latest .

# Verify it built
docker images | grep ecommerce-backend

# Test it locally
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce" \
  -e JWT_SECRET="your-secret-key" \
  myacr.azurecr.io/ecommerce-backend:latest
```

### What Goes Into Backend Image

✅ Node.js runtime (20-alpine)
✅ Dependencies from pnpm
✅ Compiled TypeScript (in dist/)
✅ Environment variables (.env.example as template)
✅ Health check endpoint (/health/live)
✅ Non-root user (node)
✅ Small image size (~150MB)

---

## Step 3: Build Web Frontend Image

### Web Dockerfile (Simplified)

The web frontend needs:
- Node.js to build React app
- Nginx to serve static files
- Environment configuration
- Health checks

### Build Command

```bash
# From project root
docker build -f docker/Dockerfile.web -t myacr.azurecr.io/ecommerce-web:latest .

# Verify it built
docker images | grep ecommerce-web

# Test it locally
docker run -p 8080:80 myacr.azurecr.io/ecommerce-web:latest

# Access at http://localhost:8080
```

### What Goes Into Web Image

✅ Node.js for build stage
✅ React app built with Vite
✅ Nginx to serve files
✅ Environment configuration
✅ Health check endpoint (/)
✅ Gzip compression
✅ Small image size (~50MB)

---

## Step 4: Push Images to Azure Container Registry

### Login to ACR

```bash
# Login to your Azure Container Registry
az acr login --name myacr

# Or use credentials
docker login myacr.azurecr.io \
  --username <username> \
  --password <password>
```

### Push Images

```bash
# Push backend
docker push myacr.azurecr.io/ecommerce-backend:latest

# Push web
docker push myacr.azurecr.io/ecommerce-web:latest

# Verify images in ACR
az acr repository list --name myacr

# Check tags
az acr repository show-tags --name myacr --repository ecommerce-backend
```

---

## Step 5: Use Images in Kubernetes

### Update Kubernetes Manifests

Edit `k8s/backend-deployment.yaml`:

```yaml
spec:
  containers:
  - name: backend
    image: myacr.azurecr.io/ecommerce-backend:latest  # ← Update this
    imagePullPolicy: Always
    ports:
    - containerPort: 3000
    env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: ecommerce-secrets
          key: database-url
    - name: JWT_SECRET
      valueFrom:
        secretKeyRef:
          name: ecommerce-secrets
          key: jwt-secret
```

Edit `k8s/web-deployment.yaml`:

```yaml
spec:
  containers:
  - name: web
    image: myacr.azurecr.io/ecommerce-web:latest  # ← Update this
    imagePullPolicy: Always
    ports:
    - containerPort: 80
```

### Deploy to AKS

```bash
# Create namespace
kubectl create namespace ecommerce

# Create secrets (update with your values)
kubectl create secret generic ecommerce-secrets \
  --from-literal=database-url="postgresql://user:pass@postgres:5432/ecommerce" \
  --from-literal=jwt-secret="your-32-character-secret-key-here" \
  -n ecommerce

# Deploy all resources
kubectl apply -f k8s/ -n ecommerce

# Verify deployment
kubectl get pods -n ecommerce
kubectl get svc -n ecommerce
```

---

## Step 6: Verify Deployment

### Check Services

```bash
# Get all pods
kubectl get pods -n ecommerce

# Check pod logs
kubectl logs -n ecommerce -l app=backend --tail=50
kubectl logs -n ecommerce -l app=web --tail=50

# Check services
kubectl get svc -n ecommerce

# Get ingress IP
kubectl get ingress -n ecommerce
```

### Test Backend

```bash
# Get backend service IP
BACKEND_IP=$(kubectl get svc backend -n ecommerce -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test health check
curl http://$BACKEND_IP:3000/health/live

# Test API
curl -X GET http://$BACKEND_IP:3000/products
```

### Test Web Frontend

```bash
# Get ingress IP
INGRESS_IP=$(kubectl get ingress -n ecommerce -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Access in browser
# http://$INGRESS_IP
```

---

## Docker Image Sizes

After building, you should see:

```
ecommerce-backend:latest   ~150MB
ecommerce-web:latest       ~50MB
```

If larger, check:
- Are node_modules included? (They shouldn't be in production)
- Are build artifacts included? (Only dist/)
- Are test files included? (They shouldn't be)

---

## Troubleshooting Docker Builds

### Backend Image Won't Build

**Problem**: `Error: Cannot find module '@ecommerce/backend'`

**Solution**: Ensure you're building from project root with correct path

```bash
# Wrong ❌
cd packages/backend && docker build -f Dockerfile ...

# Correct ✅
docker build -f docker/Dockerfile.backend .
```

### Backend Container Exits Immediately

**Problem**: Container starts then stops

**Solution**: Check logs and environment variables

```bash
# Check why it exited
docker run -it myacr.azurecr.io/ecommerce-backend:latest bash

# Inside container, check what's there
ls -la dist/
npm start  # Try running manually
```

### Web Frontend Returns 404

**Problem**: Frontend loads but pages show 404

**Solution**: Check nginx configuration and build output

```bash
# Verify build worked
docker run -it myacr.azurecr.io/ecommerce-web:latest bash

# Inside container, check files
ls -la /usr/share/nginx/html/
```

---

## Best Practices

### 1. Use .dockerignore

Create `.dockerignore` in project root:

```
node_modules
.git
.github
.env.local
dist
build
.DS_Store
*.log
coverage
.turbo
```

### 2. Non-Root User

Always run as non-root in production:

```dockerfile
RUN useradd -m -u 1000 appuser
USER appuser
```

### 3. Health Checks

Include health checks in both images:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD curl -f http://localhost:3000/health/live || exit 1
```

### 4. Environment Variables

Use environment variables for configuration:

```dockerfile
ENV NODE_ENV=production
ENV LOG_LEVEL=info
```

Never hardcode secrets in images!

### 5. Multi-Stage Builds

Always use multi-stage to keep images small:

```dockerfile
# Stage 1: Build
FROM node:20 AS builder
...build code...

# Stage 2: Runtime
FROM node:20-alpine
...copy only needed files...
```

---

## Environment Variables for AKS

Create a secrets file for Kubernetes:

```yaml
# k8s/secrets-template.yaml
apiVersion: v1
kind: Secret
metadata:
  name: ecommerce-secrets
  namespace: ecommerce
type: Opaque
data:
  database-url: <base64-encoded-postgresql-url>
  jwt-secret: <base64-encoded-secret>
  stripe-secret: <base64-encoded-stripe-key>
```

Create secrets from command line:

```bash
# Encode values
echo -n "postgresql://user:pass@postgres:5432/ecommerce" | base64

# Create secret
kubectl create secret generic ecommerce-secrets \
  --from-literal=database-url="..." \
  --from-literal=jwt-secret="..." \
  --from-literal=stripe-secret="..." \
  -n ecommerce
```

---

## Complete Docker Build & Push Script

Create `scripts/docker-build.sh`:

```bash
#!/bin/bash

set -e

# Configuration
REGISTRY="myacr.azurecr.io"
NAMESPACE="ecommerce"
TAG="latest"

echo "🐳 Building and pushing Docker images..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Build backend
echo -e "${BLUE}Building backend image...${NC}"
docker build -f docker/Dockerfile.backend -t $REGISTRY/$NAMESPACE-backend:$TAG .
echo -e "${GREEN}✓ Backend built${NC}"

# 2. Build web
echo -e "${BLUE}Building web image...${NC}"
docker build -f docker/Dockerfile.web -t $REGISTRY/$NAMESPACE-web:$TAG .
echo -e "${GREEN}✓ Web built${NC}"

# 3. Push backend
echo -e "${BLUE}Pushing backend image...${NC}"
docker push $REGISTRY/$NAMESPACE-backend:$TAG
echo -e "${GREEN}✓ Backend pushed${NC}"

# 4. Push web
echo -e "${BLUE}Pushing web image...${NC}"
docker push $REGISTRY/$NAMESPACE-web:$TAG
echo -e "${GREEN}✓ Web pushed${NC}"

echo -e "${GREEN}🎉 All images built and pushed successfully!${NC}"
echo ""
echo "Images pushed to:"
echo "  - $REGISTRY/$NAMESPACE-backend:$TAG"
echo "  - $REGISTRY/$NAMESPACE-web:$TAG"
```

Run it:

```bash
chmod +x scripts/docker-build.sh
./scripts/docker-build.sh
```

---

## Summary

✅ Backend Image: Express.js API in Node.js container
✅ Web Image: React app served by Nginx
✅ Both: Health checks, non-root user, small sizes
✅ Security: No secrets in images, environment variables
✅ Ready: For Kubernetes deployment

Next steps:
1. Build images locally
2. Test with docker run
3. Push to ACR
4. Update Kubernetes manifests
5. Deploy to AKS

---

For detailed Dockerfile explanations, see the SIMPLIFIED_DOCKERFILES.md file.
