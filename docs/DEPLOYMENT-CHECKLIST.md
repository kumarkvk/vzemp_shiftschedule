# AKS Deployment Checklist

This checklist ensures your ecommerce application is ready for production deployment on Azure Kubernetes Service (AKS).

## Pre-Deployment Requirements

### Azure Resources
- [ ] AKS cluster created and running
- [ ] Azure Container Registry (ACR) created
- [ ] Resource Group created
- [ ] Virtual Network configured (optional, for private clusters)
- [ ] Azure Monitor / Application Insights configured
- [ ] Azure Key Vault for secrets management

### Domain & SSL
- [ ] Domain registered and DNS configured
- [ ] SSL certificate obtained (Let's Encrypt via cert-manager or pre-purchased)
- [ ] DNS A record pointing to Ingress IP
- [ ] HTTPS redirect configured

### Credentials & Secrets
- [ ] `DB_PASSWORD` set securely in secrets.yaml
- [ ] `JWT_SECRET` generated and securely stored
- [ ] `STRIPE_SECRET_KEY` from Stripe dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` from Stripe webhook settings
- [ ] Database credentials stored in secrets
- [ ] All secrets encrypted at rest in Azure Key Vault

### Database
- [ ] PostgreSQL connection tested
- [ ] Database migrations verified to run successfully
- [ ] Seed data (optional) loaded
- [ ] Backups configured and tested
- [ ] Database user created with proper permissions
- [ ] Connection pooling parameters tuned

### Docker Images
- [ ] Backend image built and tested locally
- [ ] Web frontend image built and tested locally
- [ ] Mobile image built (or EAS Build configured)
- [ ] Images pushed to ACR
- [ ] Image tags follow semantic versioning
- [ ] Image pull secrets configured in AKS

## Pre-Deployment Validation

### Code Quality
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage meets minimum threshold (80% backend)
- [ ] Linting passes without errors
- [ ] TypeScript compilation succeeds
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials in code

### Security
- [ ] Passwords hashed with bcryptjs
- [ ] JWT secret is cryptographically secure
- [ ] CORS configured for specific origins only
- [ ] HTTPS/TLS enabled
- [ ] Security headers configured (Helmet.js)
- [ ] SQL injection protection verified (parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF protection implemented (if needed)
- [ ] Rate limiting configured
- [ ] Network policies applied

### Infrastructure
- [ ] Kubernetes manifests validated with `kubectl apply --dry-run`
- [ ] Resource requests/limits set appropriately
- [ ] Health check endpoints working
- [ ] Liveness probes configured
- [ ] Readiness probes configured
- [ ] PersistentVolumeClaim size appropriate for data
- [ ] Storage class available in AKS cluster

### Monitoring & Logging
- [ ] Application logging configured
- [ ] Log aggregation setup (Azure Monitor/ELK)
- [ ] Metrics collection enabled (Prometheus)
- [ ] Alerts configured for critical thresholds
- [ ] Error tracking setup (e.g., Sentry)
- [ ] Performance monitoring enabled

## Deployment Steps

### Step 1: Prepare Environment
```bash
# Setup Azure CLI connection
az login
az account set --subscription <subscription-id>

# Get AKS credentials
az aks get-credentials \
  --resource-group <resource-group> \
  --name <aks-cluster-name>

# Verify connection
kubectl cluster-info
```

### Step 2: Create Namespace
```bash
kubectl apply -f k8s/namespace.yaml

# Verify
kubectl get namespace ecommerce
```

### Step 3: Configure Secrets
```bash
# Edit k8s/secrets.yaml with real values
# IMPORTANT: Use Azure Key Vault or encrypted storage

# Apply secrets
kubectl apply -f k8s/secrets.yaml

# Verify (should not show values)
kubectl get secrets -n ecommerce
```

### Step 4: Configure ConfigMaps
```bash
# Edit k8s/configmap.yaml with production values

# Apply config
kubectl apply -f k8s/configmap.yaml

# Verify
kubectl get configmap -n ecommerce
```

### Step 5: Deploy Database
```bash
# Create PostgreSQL PVC and StatefulSet
kubectl apply -f k8s/postgresql-pvc.yaml
kubectl apply -f k8s/postgresql-statefulset.yaml
kubectl apply -f k8s/postgresql-service.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod \
  -l app=postgresql \
  -n ecommerce \
  --timeout=300s

# Run migrations
kubectl exec -it postgresql-0 -n ecommerce -- \
  psql -U postgres -d ecommerce \
  -f /migrations/001_create_initial_schema.sql
```

### Step 6: Deploy Backend API
```bash
# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Wait for backend to be ready
kubectl rollout status deployment/backend -n ecommerce

# Check logs
kubectl logs -n ecommerce -l app=backend -f
```

### Step 7: Deploy Web Frontend
```bash
# Deploy web
kubectl apply -f k8s/web-deployment.yaml
kubectl apply -f k8s/web-service.yaml

# Wait for web to be ready
kubectl rollout status deployment/web -n ecommerce

# Check logs
kubectl logs -n ecommerce -l app=web -f
```

### Step 8: Apply Auto-Scaling & Network Policies
```bash
# Deploy HPA
kubectl apply -f k8s/hpa.yaml

# Deploy network policies
kubectl apply -f k8s/networkpolicy.yaml

# Verify
kubectl get hpa -n ecommerce
kubectl get networkpolicies -n ecommerce
```

### Step 9: Deploy Ingress
```bash
# If using cert-manager, ensure it's installed
# kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Update domain names in k8s/ingress.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml

# Get Ingress IP
kubectl get ingress -n ecommerce

# Point DNS to Ingress IP
```

### Step 10: Verify Deployment
```bash
# Check all pods running
kubectl get pods -n ecommerce

# Check services
kubectl get svc -n ecommerce

# Check ingress
kubectl get ingress -n ecommerce

# Test backend health
curl http://backend-ip/health/live

# Test web
curl http://web-ip/

# Monitor logs
kubectl logs -n ecommerce -l app=backend -f
kubectl logs -n ecommerce -l app=web -f
```

## Post-Deployment

### Verification Tests
- [ ] Frontend loads at yourdomain.com
- [ ] API responds at api.yourdomain.com
- [ ] Product listing works
- [ ] User registration works
- [ ] Login functionality works
- [ ] Cart operations work
- [ ] Checkout completes
- [ ] Stripe payment processing works (test mode)
- [ ] All API endpoints accessible
- [ ] Error handling displays correctly

### Monitoring Setup
- [ ] Prometheus scraping metrics
- [ ] Grafana dashboards created
- [ ] Azure Monitor alerts configured
- [ ] Log aggregation working
- [ ] Health check endpoints monitored
- [ ] Performance baselines established

### Backup & Disaster Recovery
- [ ] Database backup job scheduled
- [ ] Backup storage configured
- [ ] Restore procedure tested
- [ ] Disaster recovery plan documented
- [ ] RTO/RPO targets defined

### Documentation
- [ ] Deployment runbook created
- [ ] Troubleshooting guide written
- [ ] Team trained on procedures
- [ ] Escalation procedures defined
- [ ] On-call support configured

## Scaling & Performance

### Auto-Scaling Configuration
- [ ] HPA metrics tested
- [ ] Min/max replica counts verified
- [ ] Scale-up behavior monitored
- [ ] Scale-down behavior tested
- [ ] Database scaling plan prepared

### Load Testing
- [ ] Load test plan created
- [ ] Performance benchmarks established
- [ ] Bottlenecks identified
- [ ] Optimization recommendations applied
- [ ] Stress test completed

## Maintenance & Updates

### Regular Tasks
- [ ] Daily health checks scheduled
- [ ] Weekly backup verification
- [ ] Monthly security updates
- [ ] Quarterly performance review
- [ ] Annual disaster recovery drill

### Update Procedure
- [ ] Update testing environment first
- [ ] Canary deployment strategy prepared
- [ ] Rollback procedure documented
- [ ] Communication plan for maintenance windows
- [ ] Zero-downtime deployment strategy

## Troubleshooting Quick Reference

### Pod Issues
```bash
# Pod in CrashLoopBackOff
kubectl logs <pod-name> -n ecommerce --previous

# Pod pending
kubectl describe pod <pod-name> -n ecommerce

# Check events
kubectl get events -n ecommerce --sort-by='.lastTimestamp'
```

### Database Issues
```bash
# Connect to PostgreSQL
kubectl exec -it postgresql-0 -n ecommerce -- psql -U postgres

# Check connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

# Check database size
\l+ ecommerce
```

### Networking Issues
```bash
# Test connectivity between pods
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- bash

# Check DNS
nslookup backend.ecommerce.svc.cluster.local

# Test service connectivity
curl backend:80
```

### Performance Issues
```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n ecommerce

# Check HPA status
kubectl get hpa -n ecommerce -w

# View metrics
kubectl get metrics pod -n ecommerce
```

## Success Criteria

- [ ] All pods running and healthy
- [ ] All services responding correctly
- [ ] Ingress routing traffic properly
- [ ] SSL/TLS working without warnings
- [ ] Database operations normal
- [ ] Logging and monitoring active
- [ ] Performance within SLA targets
- [ ] Zero downtime during deployment
- [ ] Auto-scaling functioning correctly
- [ ] Backup procedures working

---

**Deployment completed successfully when all items are checked!**
