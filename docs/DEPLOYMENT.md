# Deployment Guide

## Overview

This guide covers deploying the ecommerce application to Azure Kubernetes Service (AKS).

## Prerequisites

- Azure CLI (`az`) installed and authenticated
- kubectl installed
- AKS cluster running in Azure
- Azure Container Registry (ACR) for Docker images

## Local Kubernetes Testing

### Using Minikube
```bash
minikube start
minikube dashboard
```

### Apply Manifests
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/
```

### View Resources
```bash
kubectl get all -n ecommerce
kubectl get pods -n ecommerce -w
```

### View Logs
```bash
kubectl logs -n ecommerce -l app=backend -f
```

## Azure AKS Deployment

### 1. Create AKS Cluster (if needed)
```bash
az aks create \
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --node-count 3 \
  --enable-managed-identity \
  --network-plugin azure \
  --vm-set-type VirtualMachineScaleSets
```

### 2. Get Credentials
```bash
az aks get-credentials \
  --resource-group myResourceGroup \
  --name myAKSCluster
```

### 3. Create ACR (if needed)
```bash
az acr create \
  --resource-group myResourceGroup \
  --name myRegistry \
  --sku Basic
```

### 4. Build and Push Images
```bash
az acr build \
  --registry myRegistry \
  --image ecommerce-backend:latest \
  --file docker/Dockerfile.backend .

az acr build \
  --registry myRegistry \
  --image ecommerce-web:latest \
  --file docker/Dockerfile.web .
```

### 5. Configure Kubernetes Secrets
```bash
# Create secret for ACR
az aks update \
  -n myAKSCluster \
  -g myResourceGroup \
  --attach-acr myRegistry

# Create other secrets
kubectl create secret generic app-secrets \
  -n ecommerce \
  --from-literal=jwt-secret=your-secret-key \
  --from-literal=stripe-secret-key=your-stripe-key
```

### 6. Configure Environment
Edit `k8s/configmap.yaml` with your settings:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: ecommerce
data:
  NODE_ENV: production
  DB_HOST: postgresql
  API_URL: https://api.yourdomain.com
```

### 7. Deploy to AKS
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgresql-*.yaml
kubectl apply -f k8s/backend-*.yaml
kubectl apply -f k8s/web-*.yaml
kubectl apply -f k8s/ingress.yaml
```

### 8. Verify Deployment
```bash
# Check pods
kubectl get pods -n ecommerce

# Check services
kubectl get svc -n ecommerce

# Check ingress
kubectl get ingress -n ecommerce

# Check logs
kubectl logs -n ecommerce -l app=backend -f
```

## CI/CD with Azure Pipelines

### Pipeline Stages

1. **Build & Test**
   - Install dependencies
   - Run linting
   - Run unit tests
   - Generate coverage report

2. **Docker Build**
   - Build backend image
   - Build web frontend image
   - Build mobile app

3. **Push to ACR**
   - Tag images
   - Push to Azure Container Registry

4. **Deploy to AKS**
   - Update image references in manifests
   - Apply Kubernetes manifests
   - Wait for rollout

### Setup Pipeline

1. Create `azure-pipelines.yml` in root
2. Go to Azure DevOps
3. Create new pipeline
4. Select "Existing Azure Pipelines YAML"
5. Configure triggers and variables
6. Run pipeline

### Example Variables

```yaml
variables:
  REGISTRY: myRegistry.azurecr.io
  BACKEND_IMAGE: $(REGISTRY)/ecommerce-backend
  WEB_IMAGE: $(REGISTRY)/ecommerce-web
  AKS_CLUSTER: myAKSCluster
  AKS_RESOURCE_GROUP: myResourceGroup
```

## Monitoring

### View Metrics
```bash
kubectl top nodes
kubectl top pods -n ecommerce
```

### Setup Azure Monitor
```bash
az aks enable-addons \
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --addons monitoring
```

### View Container Logs
```bash
# Live logs
kubectl logs -n ecommerce -l app=backend -f

# Show previous pod logs
kubectl logs -n ecommerce -l app=backend --previous
```

## Scaling

### Manual Scaling
```bash
kubectl scale deployment backend \
  -n ecommerce \
  --replicas=5
```

### Auto-Scaling
Configured in `k8s/hpa.yaml`:
```bash
kubectl get hpa -n ecommerce
```

## Database Migrations in Kubernetes

```bash
# Run migrations
kubectl exec -it postgresql-0 -n ecommerce -- \
  psql -U postgres -d ecommerce -f /migrations/001_initial.sql
```

## Troubleshooting

### Pod Stuck in Pending
```bash
kubectl describe pod <pod-name> -n ecommerce
```

### CrashLoopBackOff
```bash
kubectl logs <pod-name> -n ecommerce --previous
```

### Node Not Ready
```bash
kubectl describe node <node-name>
```

### Network Issues
```bash
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- bash
```

## Rollback

### Rollback Deployment
```bash
kubectl rollout history deployment/backend -n ecommerce
kubectl rollout undo deployment/backend -n ecommerce
```

## Cost Optimization

- Use spot instances for non-critical workloads
- Right-size node pools
- Enable cluster autoscaler
- Use resource quotas to limit overprovisioning

---

See [ARCHITECTURE.md](ARCHITECTURE.md) for infrastructure details.
