# ⚡ 5-Minute Quick Start - Docker to AKS

> **Get your ecommerce app running on AKS in 5 simple steps**

---

## Step 1️⃣ Build (2 minutes)

```bash
cd /path/to/ecommerce-aks-app
make docker-build-all
```

✅ **Done!** You now have three Docker images:
- `ecommerce-backend:latest` (150MB)
- `ecommerce-web:latest` (50MB)
- `ecommerce-mobile:latest` (520MB)

---

## Step 2️⃣ Test Locally (2 minutes)

```bash
make docker-test
```

✅ **Done!** Full stack is running:
- Backend: http://localhost:3000
- Web: http://localhost:8080
- Database: localhost:5432

Stop with: `make docker-down`

---

## Step 3️⃣ Setup Azure ACR (3 minutes)

```bash
bash scripts/setup-acr.sh
```

Answer the prompts:
- ACR name: `myacr`
- Resource Group: `ecommerce-rg`
- Location: `eastus`

✅ **Done!** Your Azure Container Registry is ready.

---

## Step 4️⃣ Push to ACR (3 minutes)

```bash
make docker-push-acr
```

✅ **Done!** Your images are now in Azure:
```
myacr.azurecr.io/ecommerce-backend:latest
myacr.azurecr.io/ecommerce-web:latest
myacr.azurecr.io/ecommerce-mobile:latest
```

---

## Step 5️⃣ Deploy to AKS (5 minutes)

### A. Update Kubernetes Manifests

Edit `k8s/backend-deployment.yaml`:
```yaml
image: myacr.azurecr.io/ecommerce-backend:latest
```

Edit `k8s/web-deployment.yaml`:
```yaml
image: myacr.azurecr.io/ecommerce-web:latest
```

### B. Deploy

```bash
make k8s-deploy
```

### C. Verify

```bash
make k8s-status

# Expected:
# All pods: READY 1/1, STATUS Running
```

✅ **Done!** Your app is live on AKS! 🎉

---

## 🎯 Verification

```bash
# Check everything is running
kubectl get pods -n ecommerce

# Access your app
kubectl port-forward -n ecommerce svc/ecommerce-backend 3000:3000
# Then: curl http://localhost:3000/health/live

# View logs
kubectl logs -f -n ecommerce deployment/ecommerce-backend
```

---

## 📖 Need More Details?

- **Full guide:** `docs/DOCKER_DEPLOYMENT_GUIDE.md`
- **Step-by-step:** `docs/AKS_DEPLOYMENT_CHECKLIST.md`
- **Summary:** `docs/SIMPLIFIED_DOCKER_SUMMARY.md`

---

## ⚠️ Troubleshooting

### Images not building?
```bash
docker system prune -a  # Clean up
make docker-build-all   # Retry
```

### ACR setup failed?
```bash
az login  # Ensure you're logged in
bash scripts/setup-acr.sh  # Retry
```

### Pods won't start?
```bash
kubectl describe pod <pod-name> -n ecommerce  # See error
kubectl logs <pod-name> -n ecommerce          # Check logs
```

---

**Status:** ✅ Ready to Deploy  
**Time Spent:** ~15 minutes  
**Next:** Monitor your app!

