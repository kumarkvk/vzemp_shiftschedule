# 🐳 Docker & AKS Deployment Guide - Complete Instructions

## Overview

This guide walks you through building Docker images for the ecommerce application and deploying them to Azure Kubernetes Service (AKS). The simplified Dockerfiles produce optimized images (~150MB backend, ~50MB web) ready for production deployment.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Image Architecture](#docker-image-architecture)
3. [Building Images Locally](#building-images-locally)
4. [Testing Images Locally](#testing-images-locally)
5. [Azure Container Registry (ACR) Setup](#azure-container-registry-acr-setup)
6. [Pushing Images to ACR](#pushing-images-to-acr)
7. [Deploying to AKS](#deploying-to-aks)
8. [Verifying Deployment](#verifying-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

### Local Development
- **Docker**: `docker --version` (must be >= 20.10)
- **Node.js**: `node --version` (must be >= 18)
- **pnpm**: `pnpm --version` (package manager)

### Azure Tools
- **Azure CLI**: `az --version`
- **kubectl**: `kubectl version --client`
- **Azure subscription**: Access to create resources
- **AKS cluster**: Existing or ability to create one

### Verification
```bash
# Check all prerequisites
docker ps
node --version
pnpm --version
az account show
kubectl cluster-info
```

---

## Docker Image Architecture

### Backend Image (`Dockerfile.backend`)

**Multi-stage build optimized for size:**

1. **Dependencies Stage** (Node 20 Alpine)
   - Install pnpm
   - Install all npm dependencies
   - Cached layer for faster rebuilds

2. **Build Stage** 
   - Copy source code
   - Compile TypeScript → JavaScript
   - Remove dev dependencies

3. **Production Stage** (Alpine 3.20)
   - Copy only compiled code + runtime deps
   - Non-root user (appuser)
   - Health checks enabled
   - Final size: ~150MB

**Key Features:**
- Alpine Linux (small base image)
- Multi-stage (no source in final image)
- Non-root user (security)
- Health checks (Kubernetes integration)

### Web Frontend Image (`Dockerfile.web`)

**Multi-stage build for static site:**

1. **Builder Stage** (Node 20 Alpine)
   - Install pnpm
   - Install dev dependencies
   - Build React app with Vite
   - Output: `/app/packages/web/dist`

2. **Production Stage** (Nginx Alpine)
   - Nginx web server
   - Only static files from builder
   - Non-root user
   - Health checks
   - Final size: ~50MB

**Key Features:**
- Nginx for static file serving
- Environment variable substitution
- CORS headers configured
- Gzip compression enabled

---

## Building Images Locally

### Quick Start

```bash
# From project root
cd /path/to/ecommerce-aks-app

# Build both images
./scripts/docker-build.sh

# Build and push to ACR
./scripts/docker-build.sh --push
```

### Manual Build (if script unavailable)

#### Build Backend
```bash
docker build \
  --file docker/Dockerfile.backend \
  --tag ecommerce-backend:latest \
  .
```

#### Build Web
```bash
docker build \
  --file docker/Dockerfile.web \
  --tag ecommerce-web:latest \
  .
```

### Understanding the Build Output

```
Step 1/20 : FROM node:20-alpine AS builder
Step 2/20 : ENV PNPM_HOME=/pnpm
...
Step 15/20 : COPY --from=builder /app/packages/web/dist /usr/share/nginx/html
...
Successfully tagged ecommerce-web:latest
```

**Expected times:**
- First build: 5-10 minutes (downloads dependencies)
- Subsequent builds: 1-2 minutes (uses cache)

---

## Testing Images Locally

### Test Backend Image

```bash
# Run backend container
docker run --rm \
  -p 3000:3000 \
  -e NODE_ENV=development \
  -e DATABASE_URL=postgres://user:pass@localhost:5432/ecommerce \
  ecommerce-backend:latest

# In another terminal, test endpoints
curl http://localhost:3000/health/live
curl http://localhost:3000/api/products

# Expected response: 200 OK
```

### Test Web Image

```bash
# Run web container
docker run --rm \
  -p 8080:8080 \
  ecommerce-web:latest

# Test in browser or curl
curl http://localhost:8080/
# or
open http://localhost:8080
```

### Using docker-compose for Full Stack Test

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Test backend
curl http://localhost:3000/health/live

# Test web
curl http://localhost:8080/

# Stop all
docker-compose down
```

### Verify Image Details

```bash
# Check image size
docker images | grep ecommerce

# Expected output:
# ecommerce-backend  latest  a1b2c3d4  2 minutes ago  148MB
# ecommerce-web      latest  e5f6g7h8  3 minutes ago  48MB

# Inspect image
docker inspect ecommerce-backend:latest

# Check layers
docker history ecommerce-backend:latest
```

---

## Azure Container Registry (ACR) Setup

### Create ACR Resource

```bash
# Set variables
ACR_NAME="myacr"
RESOURCE_GROUP="ecommerce-rg"
LOCATION="eastus"

# Create resource group
az group create \
  --name ${RESOURCE_GROUP} \
  --location ${LOCATION}

# Create ACR
az acr create \
  --resource-group ${RESOURCE_GROUP} \
  --name ${ACR_NAME} \
  --sku Basic \
  --admin-enabled true

# Get login server
ACR_URL=$(az acr show \
  --resource-group ${RESOURCE_GROUP} \
  --name ${ACR_NAME} \
  --query loginServer \
  --output tsv)

echo "ACR URL: ${ACR_URL}"
# Output: myacr.azurecr.io
```

### Configure Docker Authentication

```bash
# Login to ACR
az acr login --name ${ACR_NAME}

# Get ACR credentials
az acr credential show \
  --resource-group ${RESOURCE_GROUP} \
  --name ${ACR_NAME} \
  --query passwords[0].value \
  -o tsv

# Or use managed identity (recommended for AKS)
# See "AKS Integration" section below
```

### Verify ACR Access

```bash
# Test push access
docker tag ecommerce-backend:latest ${ACR_URL}/ecommerce-backend:test

docker push ${ACR_URL}/ecommerce-backend:test

# List repositories
az acr repository list --name ${ACR_NAME}

# Expected output:
# [
#   "ecommerce-backend",
#   "ecommerce-web"
# ]
```

---

## Pushing Images to ACR

### Using the Build Script (Recommended)

```bash
# Build and push with one command
./scripts/docker-build.sh --push

# The script will:
# 1. Build both images
# 2. Login to ACR
# 3. Tag images with ACR URL
# 4. Push to ACR
# 5. Verify in registry
```

### Manual Push

```bash
# Set variables
ACR_URL="myacr.azurecr.io"
IMAGE_TAG="v1.0.0"  # or "latest"

# Build images (or use existing)
docker build -f docker/Dockerfile.backend -t ecommerce-backend:${IMAGE_TAG} .
docker build -f docker/Dockerfile.web -t ecommerce-web:${IMAGE_TAG} .

# Login to ACR
az acr login --name myacr

# Tag for ACR
docker tag ecommerce-backend:${IMAGE_TAG} ${ACR_URL}/ecommerce-backend:${IMAGE_TAG}
docker tag ecommerce-backend:${IMAGE_TAG} ${ACR_URL}/ecommerce-backend:latest

docker tag ecommerce-web:${IMAGE_TAG} ${ACR_URL}/ecommerce-web:${IMAGE_TAG}
docker tag ecommerce-web:${IMAGE_TAG} ${ACR_URL}/ecommerce-web:latest

# Push images
docker push ${ACR_URL}/ecommerce-backend:${IMAGE_TAG}
docker push ${ACR_URL}/ecommerce-backend:latest

docker push ${ACR_URL}/ecommerce-web:${IMAGE_TAG}
docker push ${ACR_URL}/ecommerce-web:latest

# Verify
az acr repository show-tags --name myacr --repository ecommerce-backend
```

### Image Tagging Strategy

**Recommended approach:**
```
Development:  ${ACR_URL}/ecommerce-backend:dev
Testing:      ${ACR_URL}/ecommerce-backend:test
Production:   ${ACR_URL}/ecommerce-backend:v1.0.0
Latest:       ${ACR_URL}/ecommerce-backend:latest (stable)
```

---

## Deploying to AKS

### Prerequisites

- AKS cluster created and configured
- kubectl connected to AKS cluster
- Images pushed to ACR
- Database created and accessible

### Update Kubernetes Manifests

**1. Edit `k8s/backend-deployment.yaml`:**

```yaml
spec:
  containers:
  - name: backend
    image: myacr.azurecr.io/ecommerce-backend:v1.0.0  # ← Update this
    imagePullPolicy: IfNotPresent
    ports:
    - containerPort: 3000
    env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: ecommerce-secrets
          key: database-url
    # ... rest of config
```

**2. Edit `k8s/web-deployment.yaml`:**

```yaml
spec:
  containers:
  - name: web
    image: myacr.azurecr.io/ecommerce-web:v1.0.0  # ← Update this
    imagePullPolicy: IfNotPresent
    ports:
    - containerPort: 8080
    # ... rest of config
```

### Create Kubernetes Secrets

**For database connection:**

```bash
# Create secret for database URL
kubectl create secret generic ecommerce-secrets \
  --from-literal=database-url='postgresql://user:password@postgres:5432/ecommerce' \
  -n ecommerce

# Verify
kubectl get secrets -n ecommerce
```

**For ACR authentication (if not using managed identity):**

```bash
# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name myacr --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name myacr --query passwords[0].value -o tsv)

# Create pull secret
kubectl create secret docker-registry acr-secret \
  --docker-server=myacr.azurecr.io \
  --docker-username=${ACR_USERNAME} \
  --docker-password=${ACR_PASSWORD} \
  --docker-email=admin@example.com \
  -n ecommerce

# Verify
kubectl get secrets -n ecommerce
```

### Deploy Applications

```bash
# Create namespace
kubectl create namespace ecommerce

# Deploy PostgreSQL (if needed)
kubectl apply -f k8s/postgresql-pvc.yaml
kubectl apply -f k8s/postgresql-configmap.yaml
kubectl apply -f k8s/postgresql-statefulset.yaml

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Deploy web frontend
kubectl apply -f k8s/web-deployment.yaml
kubectl apply -f k8s/web-service.yaml

# Deploy ingress (external access)
kubectl apply -f k8s/ingress.yaml

# Deploy autoscaler
kubectl apply -f k8s/hpa.yaml

# Check deployment status
kubectl get deployments -n ecommerce
kubectl get pods -n ecommerce
kubectl get svc -n ecommerce
```

---

## Verifying Deployment

### Check Pod Status

```bash
# List all pods
kubectl get pods -n ecommerce

# Expected output:
# NAME                               READY   STATUS    RESTARTS   AGE
# postgresql-0                       1/1     Running   0          2m
# ecommerce-backend-5d8c9f7c-abc12   1/1     Running   0          1m
# ecommerce-web-7f3a2b1e-def45       1/1     Running   0          1m

# Check pod logs
kubectl logs -n ecommerce deployment/ecommerce-backend --tail=50

# Describe pod (if issues)
kubectl describe pod -n ecommerce <pod-name>
```

### Check Service Access

```bash
# List services
kubectl get svc -n ecommerce

# Get ingress IP
kubectl get ingress -n ecommerce
# Copy the EXTERNAL-IP

# Test backend
curl http://<EXTERNAL-IP>/api/health

# Test web
curl http://<EXTERNAL-IP>/
```

### Health Checks

```bash
# Check liveness probes
kubectl get pods -n ecommerce -o wide

# View health check status
kubectl describe pod -n ecommerce <pod-name> | grep -A 5 "Liveness"

# Manual health check
kubectl exec -it <pod-name> -n ecommerce -- curl http://localhost:3000/health/live
```

### Performance Monitoring

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n ecommerce

# View HPA status
kubectl get hpa -n ecommerce
kubectl describe hpa -n ecommerce ecommerce-backend-hpa

# Check events
kubectl get events -n ecommerce --sort-by='.lastTimestamp'
```

---

## Troubleshooting

### Image Pull Errors

**Problem:** `ImagePullBackOff` status

**Solutions:**

```bash
# Check pod events
kubectl describe pod <pod-name> -n ecommerce

# Verify image exists in ACR
az acr repository show-tags --name myacr --repository ecommerce-backend

# Check image pull secret
kubectl get secrets -n ecommerce

# Verify ACR login credentials
docker login myacr.azurecr.io

# Re-push image
docker push myacr.azurecr.io/ecommerce-backend:latest
```

### Pod Fails to Start

**Problem:** Pod status is `CrashLoopBackOff` or `Error`

**Solutions:**

```bash
# Check pod logs
kubectl logs <pod-name> -n ecommerce
kubectl logs <pod-name> -n ecommerce --previous  # Previous attempt

# Check environment variables
kubectl exec <pod-name> -n ecommerce -- env | grep DATABASE

# Verify database connection
kubectl exec <pod-name> -n ecommerce -- psql $DATABASE_URL -c "SELECT 1;"

# Check secrets exist
kubectl get secrets -n ecommerce
kubectl describe secret ecommerce-secrets -n ecommerce
```

### Connection Refused

**Problem:** `Connection refused` when accessing service

**Solutions:**

```bash
# Test from within cluster
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
# Inside pod:
curl http://ecommerce-backend:3000/health/live

# Check service DNS
nslookup ecommerce-backend.ecommerce.svc.cluster.local

# Verify port forwarding
kubectl port-forward -n ecommerce svc/ecommerce-backend 3000:3000
# Then: curl localhost:3000/health/live
```

### Slow Startup

**Problem:** Pods take long time to become ready

**Solutions:**

```bash
# Increase startup period in deployment
# Edit k8s/backend-deployment.yaml:
startupProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 30     # ← Increase this
  periodSeconds: 10
  failureThreshold: 6         # ← Increase this (30 seconds total)

# Check initialization logs
kubectl logs -f <pod-name> -n ecommerce

# Monitor startup
watch kubectl get pods -n ecommerce
```

### Database Connection Issues

**Problem:** Backend can't connect to PostgreSQL

**Solutions:**

```bash
# Verify PostgreSQL is running
kubectl get statefulset -n ecommerce
kubectl describe pod -n ecommerce postgresql-0

# Check database URL secret
kubectl get secret ecommerce-secrets -n ecommerce -o yaml

# Test connection from pod
kubectl exec -it <backend-pod> -n ecommerce -- \
  psql postgresql://user:password@postgresql:5432/ecommerce -c "SELECT 1;"

# Check network policy
kubectl get networkpolicy -n ecommerce
```

### High Memory Usage

**Problem:** Pods killed due to memory limit

**Solutions:**

```bash
# Check current memory usage
kubectl top pods -n ecommerce

# Increase memory limit
kubectl set resources deployment ecommerce-backend \
  -n ecommerce \
  --limits=memory=1Gi

# Or edit deployment YAML
kubectl edit deployment ecommerce-backend -n ecommerce
# Update: resources.limits.memory: "1Gi"
```

### Build Fails Locally

**Problem:** `docker build` fails with specific error

**Common Issues:**

```bash
# "No space left on device"
docker system prune -a
docker image prune -a

# "Cannot find module"
rm -rf node_modules
pnpm install

# "ENOENT: no such file"
# Check .dockerignore doesn't exclude needed files
cat .dockerignore | grep dist

# "Alpine: command not found"
# apk add curl  (in Dockerfile already included)
```

---

## Quick Reference

### Essential Commands

```bash
# Build locally
docker build -f docker/Dockerfile.backend -t ecommerce-backend:latest .

# Push to ACR
docker push myacr.azurecr.io/ecommerce-backend:latest

# Deploy to AKS
kubectl apply -f k8s/

# View status
kubectl get pods -n ecommerce
kubectl logs <pod-name> -n ecommerce

# Port forward
kubectl port-forward -n ecommerce svc/ecommerce-backend 3000:3000

# Delete deployment
kubectl delete -f k8s/ -n ecommerce
```

### Environment Variables

```bash
# ACR Configuration
export ACR_NAME="myacr"
export ACR_URL="${ACR_NAME}.azurecr.io"
export IMAGE_TAG="latest"

# AKS Configuration
export CLUSTER_NAME="ecommerce-aks"
export RESOURCE_GROUP="ecommerce-rg"
export REGION="eastus"

# Database Configuration
export DATABASE_HOST="postgresql.ecommerce.svc.cluster.local"
export DATABASE_PORT="5432"
export DATABASE_NAME="ecommerce"
export DATABASE_USER="ecommerce"
```

---

## Next Steps

1. ✅ Build Docker images locally
2. ✅ Test with docker-compose
3. ✅ Create Azure Container Registry
4. ✅ Push images to ACR
5. ✅ Update Kubernetes manifests
6. ✅ Deploy to AKS
7. ✅ Verify all pods running
8. ✅ Configure DNS/ingress
9. ✅ Set up monitoring
10. ✅ Document production runbook

---

## Support & Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Azure Container Registry Docs](https://docs.microsoft.com/azure/container-registry/)
- [Azure Kubernetes Service Docs](https://docs.microsoft.com/azure/aks/)

---

**Last Updated:** 2024
**Version:** 1.0
