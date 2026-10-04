# ✅ AKS Deployment Checklist & Quick Start Guide

> **Complete step-by-step guide to build Docker images and deploy to Azure Kubernetes Service (AKS)**

---

## 🎯 Overview

This checklist walks you through:
1. **Building** optimized Docker images locally
2. **Testing** images with docker-compose
3. **Setting up** Azure Container Registry (ACR)
4. **Pushing** images to ACR
5. **Deploying** to AKS cluster
6. **Verifying** everything works

**Total time:** ~30 minutes (excluding initial AKS cluster creation)

---

## 📋 Phase 1: Prerequisites Check

### System Requirements
- [ ] Docker installed: `docker --version` (>= 20.10)
- [ ] Node.js installed: `node --version` (>= 18)
- [ ] pnpm installed: `pnpm --version`
- [ ] Azure CLI installed: `az --version`
- [ ] kubectl installed: `kubectl version --client`
- [ ] Git repository cloned

### Azure Setup
- [ ] Azure subscription active
- [ ] Azure CLI logged in: `az account show`
- [ ] AKS cluster exists or can be created
- [ ] kubectl connected to AKS: `kubectl cluster-info`

### Verification Commands
```bash
# Run this to verify everything
docker ps
node --version
pnpm --version
az account show
kubectl cluster-info
```

---

## 🐳 Phase 2: Build Docker Images Locally

### Step 1: Navigate to Project Root
```bash
cd /path/to/ecommerce-aks-app
ls -la Makefile docker/Dockerfile.* .dockerignore
```

### Step 2: Build Backend Image
```bash
# Option A: Using Makefile (recommended)
make docker-build-backend

# Option B: Using docker directly
docker build \
  --file docker/Dockerfile.backend \
  --tag ecommerce-backend:latest \
  .
```

- [ ] Backend image built successfully
- [ ] Check size: `docker images | grep ecommerce-backend`
- [ ] Expected size: ~150MB

### Step 3: Build Web Frontend Image
```bash
# Option A: Using Makefile
make docker-build-web

# Option B: Using docker directly
docker build \
  --file docker/Dockerfile.web \
  --tag ecommerce-web:latest \
  .
```

- [ ] Web image built successfully
- [ ] Check size: `docker images | grep ecommerce-web`
- [ ] Expected size: ~50MB

### Step 4: Build Mobile Image (for CI/CD)
```bash
make docker-build-mobile
```

- [ ] Mobile image built successfully

### Step 5: Verify All Images
```bash
docker images | grep ecommerce
```

Expected output:
```
ecommerce-backend  latest  abc123  2 minutes ago  148MB
ecommerce-web      latest  def456  3 minutes ago  48MB
ecommerce-mobile   latest  ghi789  1 minute ago   520MB
```

- [ ] All three images present
- [ ] Sizes are reasonable (backend ~150MB, web ~50MB)

---

## 🧪 Phase 3: Test Images Locally

### Option A: Full Stack Test with docker-compose
```bash
make docker-test
```

This will:
- [ ] Start PostgreSQL
- [ ] Start Backend
- [ ] Start Web Frontend
- [ ] Test all endpoints

**Expected output:**
```
✓ Backend health OK
✓ Web frontend OK
```

**Stop services:**
```bash
make docker-down
```

### Option B: Test Individual Images

#### Test Backend
```bash
make docker-test-backend

# Or manually:
docker run --rm -p 3000:3000 ecommerce-backend:latest
# In another terminal:
curl http://localhost:3000/health/live
```

- [ ] Backend responds to health check
- [ ] Status: 200 OK

#### Test Web
```bash
make docker-test-web

# Or manually:
docker run --rm -p 8080:8080 ecommerce-web:latest
# In browser:
# http://localhost:8080
```

- [ ] Web app loads in browser
- [ ] No errors in console

### Troubleshooting
- If `docker-compose` fails, check PostgreSQL is running
- If backend crashes, check `docker logs <container-id>`
- If web won't start, check `.dockerignore` isn't excluding needed files

---

## ☁️ Phase 4: Azure Container Registry Setup

### Step 1: Run ACR Setup Script
```bash
bash scripts/setup-acr.sh
```

The script will ask for:
- [ ] ACR name (e.g., `myacr`)
- [ ] Resource Group name (e.g., `ecommerce-rg`)
- [ ] Region (e.g., `eastus`)

### Step 2: Save Configuration
After setup completes, a `.acr-config.sh` file is created:
```bash
source .acr-config.sh
echo $ACR_URL  # Should show: myacr.azurecr.io
```

- [ ] ACR created successfully
- [ ] Configuration file saved
- [ ] Can log in: `az acr login --name <ACR_NAME>`

### Step 3: Verify ACR Access
```bash
az acr repository list --name myacr
```

Should return empty list `[]` (will have repos after push)

- [ ] ACR accessible via Azure CLI
- [ ] No authentication errors

---

## 🚀 Phase 5: Push Images to Azure Container Registry

### Step 1: Build with ACR Tags
```bash
# This tags images with ACR URL
make docker-build-all
```

### Step 2: Push All Images
```bash
# Option A: Using Makefile (recommended)
make docker-push-acr

# Option B: Manual push
az acr login --name myacr

docker tag ecommerce-backend:latest myacr.azurecr.io/ecommerce-backend:latest
docker tag ecommerce-web:latest myacr.azurecr.io/ecommerce-web:latest

docker push myacr.azurecr.io/ecommerce-backend:latest
docker push myacr.azurecr.io/ecommerce-web:latest
```

- [ ] Successfully logged into ACR
- [ ] Backend image pushed
- [ ] Web image pushed
- [ ] Mobile image pushed

### Step 3: Verify Images in ACR
```bash
az acr repository list --name myacr

# Should show:
# [
#   "ecommerce-backend",
#   "ecommerce-mobile",
#   "ecommerce-web"
# ]
```

```bash
# Check tags
az acr repository show-tags --name myacr --repository ecommerce-backend
```

- [ ] All repositories show in ACR
- [ ] Each repo has `latest` tag
- [ ] Image sizes shown correctly

---

## ☸️ Phase 6: Update Kubernetes Manifests

### Step 1: Get ACR URL
```bash
source .acr-config.sh
echo $ACR_URL
# Output: myacr.azurecr.io
```

### Step 2: Update Backend Deployment
Edit `k8s/backend-deployment.yaml`:

```yaml
spec:
  containers:
  - name: backend
    image: myacr.azurecr.io/ecommerce-backend:latest  # ← Update this
    imagePullPolicy: IfNotPresent
    ports:
    - containerPort: 3000
    env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: ecommerce-secrets
          key: database-url
```

- [ ] Image URL updated to ACR URL
- [ ] imagePullPolicy set to `IfNotPresent`

### Step 3: Update Web Deployment
Edit `k8s/web-deployment.yaml`:

```yaml
spec:
  containers:
  - name: web
    image: myacr.azurecr.io/ecommerce-web:latest  # ← Update this
    imagePullPolicy: IfNotPresent
    ports:
    - containerPort: 8080
```

- [ ] Image URL updated to ACR URL

### Step 4: Create Kubernetes Secrets
```bash
# Create namespace
kubectl create namespace ecommerce --dry-run=client -o yaml | kubectl apply -f -

# Create database secret
kubectl create secret generic ecommerce-secrets \
  --from-literal=database-url='postgresql://user:password@postgresql:5432/ecommerce' \
  -n ecommerce
```

- [ ] Namespace created
- [ ] Database secret created
- [ ] Verify: `kubectl get secrets -n ecommerce`

### Step 5: Create ACR Pull Secret (if needed)
```bash
# Only needed if NOT using managed identity with AKS

ACR_USERNAME=$(az acr credential show --name myacr --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name myacr --query passwords[0].value -o tsv)

kubectl create secret docker-registry acr-secret \
  --docker-server=myacr.azurecr.io \
  --docker-username=${ACR_USERNAME} \
  --docker-password=${ACR_PASSWORD} \
  --docker-email=admin@example.com \
  -n ecommerce
```

- [ ] Secrets created
- [ ] Verify: `kubectl get secrets -n ecommerce`

---

## 🎉 Phase 7: Deploy to AKS

### Step 1: Verify AKS Connection
```bash
kubectl cluster-info
kubectl get nodes
```

- [ ] Connected to correct AKS cluster
- [ ] Nodes are Ready

### Step 2: Deploy Applications
```bash
# Deploy all Kubernetes resources
kubectl apply -f k8s/ -n ecommerce

# Or use Makefile
make k8s-deploy
```

This will deploy:
- [ ] PostgreSQL StatefulSet
- [ ] Backend Deployment
- [ ] Web Frontend Deployment
- [ ] Services and Ingress
- [ ] ConfigMaps and Secrets

### Step 3: Wait for Rollout
```bash
# Watch deployment progress
kubectl rollout status deployment/ecommerce-backend -n ecommerce
kubectl rollout status deployment/ecommerce-web -n ecommerce

# Or use watch
watch kubectl get pods -n ecommerce
```

- [ ] All pods are in `Running` state
- [ ] Backend pods: READY 1/1
- [ ] Web pods: READY 1/1
- [ ] PostgreSQL pod: READY 1/1

**Wait time:** 2-5 minutes depending on cluster

---

## ✅ Phase 8: Verify Deployment

### Step 1: Check Pod Status
```bash
kubectl get pods -n ecommerce

# Expected output:
# NAME                               READY   STATUS    RESTARTS   AGE
# postgresql-0                       1/1     Running   0          2m
# ecommerce-backend-5d8c9f7c-abc12   1/1     Running   0          1m
# ecommerce-web-7f3a2b1e-def45       1/1     Running   0          1m
```

- [ ] All pods showing `Running` status
- [ ] No `ImagePullBackOff` errors
- [ ] No `CrashLoopBackOff` errors

### Step 2: Check Services
```bash
kubectl get svc -n ecommerce

# Expected output:
# NAME                  TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)
# ecommerce-backend     ClusterIP   10.0.x.x        <none>        3000/TCP
# ecommerce-web         ClusterIP   10.0.x.x        <none>        8080/TCP
# postgresql            ClusterIP   10.0.x.x        <none>        5432/TCP
```

- [ ] All services created
- [ ] ClusterIP assigned

### Step 3: Check Ingress
```bash
kubectl get ingress -n ecommerce

# Expected output:
# NAME              CLASS   HOSTS                 ADDRESS        PORTS   AGE
# ecommerce-ingress   nginx   api.example.com       1.2.3.4        80      1m
```

- [ ] Ingress created
- [ ] External IP assigned (may take a few minutes)

### Step 4: Access Services

#### Option A: Port Forward (for quick testing)
```bash
# Terminal 1: Forward backend
kubectl port-forward -n ecommerce svc/ecommerce-backend 3000:3000

# Terminal 2: Forward web
kubectl port-forward -n ecommerce svc/ecommerce-web 8080:8080

# Test:
curl http://localhost:3000/health/live
curl http://localhost:8080/
```

- [ ] Backend responds to health check
- [ ] Web app loads

#### Option B: Via Ingress (production)
```bash
# Get ingress IP
INGRESS_IP=$(kubectl get ingress -n ecommerce -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}')

# Test
curl http://${INGRESS_IP}/api/health
curl http://${INGRESS_IP}/
```

- [ ] Can access via ingress IP
- [ ] No DNS errors (if using DNS)

### Step 5: Check Logs
```bash
# Backend logs
kubectl logs -n ecommerce deployment/ecommerce-backend --tail=50

# Web logs
kubectl logs -n ecommerce deployment/ecommerce-web --tail=50

# PostgreSQL logs
kubectl logs -n ecommerce postgresql-0 --tail=50
```

- [ ] No error messages
- [ ] Services initialized successfully
- [ ] Database connected

---

## 🔧 Phase 9: Troubleshooting

### Issue: `ImagePullBackOff`

**Cause:** Image not found in ACR or authentication failed

**Solution:**
```bash
# Verify image exists
az acr repository show-tags --name myacr --repository ecommerce-backend

# Verify ACR login
docker login myacr.azurecr.io

# Check pod event
kubectl describe pod <pod-name> -n ecommerce

# Re-push image
make docker-push-acr
```

- [ ] Image verified in ACR
- [ ] Pod redeploy

### Issue: `CrashLoopBackOff`

**Cause:** Application crashed or failed to start

**Solution:**
```bash
# Check logs
kubectl logs <pod-name> -n ecommerce
kubectl logs <pod-name> -n ecommerce --previous

# Check environment
kubectl exec <pod-name> -n ecommerce -- env

# Check database connection
kubectl exec <pod-name> -n ecommerce -- curl http://postgresql:5432
```

- [ ] Root cause identified in logs
- [ ] Environment variables correct
- [ ] Database accessible

### Issue: `Connection refused`

**Cause:** Service not listening or networking issue

**Solution:**
```bash
# Test from within cluster
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
# Inside pod:
curl http://ecommerce-backend:3000/health/live

# Check network policy
kubectl get networkpolicy -n ecommerce

# Check service
kubectl get svc -n ecommerce
kubectl describe svc ecommerce-backend -n ecommerce
```

- [ ] Service endpoint verified
- [ ] Network policy allows traffic

### Issue: `Pending` pod

**Cause:** Resource limits, node capacity, or scheduler issue

**Solution:**
```bash
# Check pod description
kubectl describe pod <pod-name> -n ecommerce

# Check node status
kubectl get nodes
kubectl describe nodes

# Check resource requests
kubectl top nodes
kubectl top pods -n ecommerce
```

- [ ] Nodes have available resources
- [ ] Pod resource requests reasonable

---

## 📊 Phase 10: Monitoring & Verification

### Health Checks
```bash
# Get all endpoints
kubectl get endpoints -n ecommerce

# Manual health check
kubectl exec -it <backend-pod> -n ecommerce -- curl http://localhost:3000/health/live

# Check HPA status
kubectl get hpa -n ecommerce
```

- [ ] All endpoints registered
- [ ] Health checks passing
- [ ] HPA working (if configured)

### Performance Monitoring
```bash
# Resource usage
kubectl top nodes
kubectl top pods -n ecommerce

# Events
kubectl get events -n ecommerce --sort-by='.lastTimestamp'

# HPA status
kubectl get hpa -n ecommerce
kubectl describe hpa ecommerce-backend-hpa -n ecommerce
```

- [ ] Pods using expected resources
- [ ] No warning events
- [ ] HPA scaling correctly

---

## 🎓 Quick Reference Commands

```bash
# Build locally
make docker-build-all

# Test locally
make docker-test

# Setup ACR
bash scripts/setup-acr.sh

# Push to ACR
make docker-push-acr

# Deploy to AKS
make k8s-deploy

# Check status
make k8s-status

# View logs
make k8s-logs

# Port forward
kubectl port-forward -n ecommerce svc/ecommerce-backend 3000:3000

# Delete deployment
make k8s-delete
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Azure Container Registry](https://docs.microsoft.com/azure/container-registry/)
- [Azure Kubernetes Service](https://docs.microsoft.com/azure/aks/)

---

## ✨ What's Next?

After successful deployment:

1. **Configure DNS** - Map domain to ingress IP
2. **Setup Monitoring** - Enable Application Insights
3. **Configure Auto-scaling** - Set resource limits
4. **Setup Logging** - Enable log aggregation
5. **Database Backups** - Configure PostgreSQL backups
6. **SSL Certificates** - Install TLS certificates
7. **CI/CD Pipeline** - Automate builds and deployments

---

**Last Updated:** 2024  
**Status:** ✅ Complete - Ready for Production Deployment
