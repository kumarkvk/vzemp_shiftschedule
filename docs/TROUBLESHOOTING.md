# Troubleshooting Guide

Common issues and solutions for the ecommerce application.

## Development Issues

### Frontend Won't Start

**Error**: Port 5173 already in use
```bash
# Solution 1: Kill process on port
lsof -i :5173
kill -9 <PID>

# Solution 2: Use different port
VITE_PORT=5174 pnpm dev
```

**Error**: Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

**Error**: Cannot find config file
```bash
# Ensure you're in correct directory
cd packages/web
pnpm dev
```

### Backend Won't Start

**Error**: Database connection refused
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Or start it:
docker run --name ecommerce-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:14

# Verify connection:
psql -U postgres -h localhost
```

**Error**: Port 3000 already in use
```bash
# Kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**Error**: Cannot find migrations
```bash
# Ensure you're in backend directory
cd packages/backend

# Check migration files exist
ls -la src/database/migrations/

# Run migrations
npm run db:migrate
```

### Mobile App Won't Load

**Error**: Expo server not starting
```bash
# Clear cache
pnpm start --clear

# Or restart from scratch
rm -rf node_modules .expo
pnpm install
pnpm start
```

**Error**: Cannot connect to backend
```bash
# Check backend is running
curl http://localhost:3000/health/live

# Update API URL in app
# Check .env has correct EXPO_PUBLIC_API_URL
```

**Error**: QR code won't scan
```bash
# Use tunnel mode for remote testing
pnpm start --tunnel

# Or use web browser
pnpm start
# Press 'w' for web
```

## Testing Issues

### Tests Won't Run

**Error**: Cannot find test files
```bash
# Ensure you're in correct package
cd packages/backend

# Check test files exist
ls -la src/**/*.test.ts
```

**Error**: Jest timeout
```bash
# Increase timeout
npm test -- --testTimeout=10000

# Or in test file
jest.setTimeout(10000);
```

**Error**: Database connection in tests
```bash
# Ensure test database exists
psql -U postgres -c "CREATE DATABASE ecommerce_test;"

# Or use test setup
npm run db:prepare:test
```

### E2E Tests Failing

**Error**: Browser not found
```bash
# Install Playwright browsers
pnpm exec playwright install

# Or in web package
cd packages/web
pnpm exec playwright install
```

**Error**: Test timeout
```bash
# Increase timeout in playwright.config.ts
timeout: 30000,

# Or run tests with --debug
pnpm test:e2e --debug
```

**Error**: Port not available
```bash
# Ensure app is running
pnpm dev

# Or update test URL
# Check playwright.config.ts baseURL
```

## Docker Issues

### Container Won't Start

**Error**: Build failed
```bash
# Check Dockerfile syntax
docker build -f docker/Dockerfile.backend .

# View build output
docker build -f docker/Dockerfile.backend . --progress=plain

# Check build context
docker build -f docker/Dockerfile.backend . --no-cache
```

**Error**: Port mapping conflict
```bash
# Check what's using port
docker ps

# Use different port
docker run -p 3001:3000 ecommerce-backend
```

**Error**: Image not found
```bash
# Build image first
docker build -f docker/Dockerfile.backend -t ecommerce-backend .

# List available images
docker images | grep ecommerce
```

### Docker Compose Issues

**Error**: Service won't connect
```bash
# Check service names in docker-compose.yml
# Use service name as hostname (e.g., postgresql:5432)

# View logs
docker-compose logs <service-name>

# Restart services
docker-compose down
docker-compose up -d
```

**Error**: Database won't initialize
```bash
# Check database environment variables
docker-compose exec postgresql env | grep POSTGRES

# Connect to database
docker-compose exec postgresql psql -U postgres

# Check volume
docker volume ls
```

**Error**: Migrations not running
```bash
# Run migrations manually
docker-compose exec backend npm run db:migrate

# Check if backend is healthy
docker-compose exec backend npm run health:check
```

## Database Issues

### Connection Problems

**Error**: "Connection refused"
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Or with Docker
docker ps | grep postgres

# Start PostgreSQL
docker run --name ecommerce-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres:14
```

**Error**: "Too many connections"
```bash
# Increase max_connections in PostgreSQL
# In docker: edit postgresql.conf
# max_connections = 200

# Check current connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

# Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE usename = 'postgres' AND application_name = '<connection_name>';
```

### Query Problems

**Error**: "No such table"
```bash
# Run migrations
pnpm db:migrate

# Check migration status
pnpm db:status

# Or manually create table
psql -U postgres -d ecommerce -f migrations/001_initial_schema.sql
```

**Error**: "Unique constraint violation"
```bash
# Check for duplicate data
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

# Delete duplicate
DELETE FROM users WHERE id NOT IN (SELECT DISTINCT ON (email) id FROM users ORDER BY email, id);
```

**Error**: "Foreign key constraint failed"
```bash
# Check if referenced record exists
SELECT * FROM categories WHERE id = '<category-id>';

# Ensure referenced record exists before inserting
```

## API Issues

### Endpoint Problems

**Error**: "404 Not Found"
```bash
# Check endpoint exists
curl http://localhost:3000/products

# Check route is registered
# Search for route in packages/backend/src/routes/

# Verify API URL in client
# Check .env VITE_API_URL or API_URL
```

**Error**: "401 Unauthorized"
```bash
# Check auth token
curl -H "Authorization: Bearer <token>" http://localhost:3000/profile

# Generate new token
# POST /auth/login with credentials

# Check JWT_SECRET is set
env | grep JWT_SECRET
```

**Error**: "403 Forbidden"
```bash
# Check user role
SELECT email, role FROM users WHERE email = 'your@email.com';

# Admin route requires admin role
# Login as admin user

# Check role-based middleware
packages/backend/src/middleware/auth.middleware.ts
```

### CORS Errors

**Error**: "CORS error" in browser
```bash
# Add origin to API_CORS_ORIGIN
# In .env: API_CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Restart backend
npm run dev

# Check CORS headers
curl -H "Origin: http://localhost:5173" -i http://localhost:3000/products
```

**Error**: "Preflight request failed"
```bash
# Ensure OPTIONS method is allowed
# Should be automatic with Express CORS

# Check CORS middleware is first
// app.use(cors(...));  // Should be before routes
```

## Stripe Issues

### Payment Processing

**Error**: "Invalid API key"
```bash
# Verify Stripe credentials
env | grep STRIPE

# Get keys from Stripe dashboard
# https://dashboard.stripe.com/apikeys

# Ensure test keys for development
# Should start with sk_test_ and pk_test_
```

**Error**: "Payment intent failed"
```bash
# Check payment intent status
curl -u <stripe_key>: https://api.stripe.com/v1/payment_intents/<intent_id>

# Common reasons:
# - Card declined: test with 4242424242424242
# - Invalid parameters: check createPaymentIntent request
# - API key expired or revoked: regenerate
```

**Error**: "Webhook not received"
```bash
# Ensure webhook URL is correct
# https://dashboard.stripe.com/webhooks

# Check webhook secret
env | grep STRIPE_WEBHOOK_SECRET

# Verify webhook handler
# packages/backend/src/routes/payments.route.ts

# Test webhook locally
# Use Stripe CLI: stripe listen --forward-to localhost:3000/webhook/stripe
```

## Kubernetes Issues

### Deployment Problems

**Error**: "ImagePullBackOff"
```bash
# Check image exists in registry
az acr repository list --name myregistry

# Verify pull secrets
kubectl get imagepullsecrets -n ecommerce

# Check image tag
kubectl describe pod <pod-name> -n ecommerce
```

**Error**: "CrashLoopBackOff"
```bash
# Check logs
kubectl logs <pod-name> -n ecommerce --previous

# Check events
kubectl describe pod <pod-name> -n ecommerce

# Common causes:
# - Database not ready: wait for postgresql pod
# - Missing env vars: check ConfigMap and Secrets
# - Port already in use: check other pods
```

**Error**: "Pending" pod
```bash
# Check resource requests
kubectl describe pod <pod-name> -n ecommerce

# Check node resources
kubectl top nodes
kubectl describe node <node-name>

# Add more nodes to cluster
az aks scale --resource-group <rg> --name <cluster> --node-count 5
```

### Service Issues

**Error**: "Service unreachable"
```bash
# Check service exists
kubectl get svc -n ecommerce

# Check endpoints
kubectl get endpoints -n ecommerce

# Check service selector matches pod labels
kubectl get pods --show-labels -n ecommerce

# Test connectivity
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- bash
# Inside pod: curl backend:80
```

**Error**: "DNS not resolving"
```bash
# Check CoreDNS is running
kubectl get pods -n kube-system | grep coredns

# Test DNS
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- bash
# Inside pod: nslookup backend.ecommerce.svc.cluster.local
```

### Ingress Issues

**Error**: "Ingress not getting IP"
```bash
# Check ingress controller
kubectl get ingress -n ecommerce

# Check ingress controller running
kubectl get pods -n ingress-nginx

# Install NGINX ingress if missing
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/aws/deploy.yaml
```

**Error**: "503 Service Unavailable"
```bash
# Check backend pods are running
kubectl get pods -n ecommerce -l app=backend

# Check backend service
kubectl get svc backend -n ecommerce

# Check ingress routing
kubectl describe ingress ecommerce-ingress -n ecommerce
```

## Performance Issues

### Slow Requests

**Error**: "Request timeout"
```bash
# Check backend performance
kubectl top pods -n ecommerce

# Check database performance
psql -U postgres -d ecommerce
# \timing on
# SELECT * FROM products;  -- Should be <100ms

# Check query plan
EXPLAIN SELECT * FROM products WHERE price < 100;
```

**Error**: "High memory usage"
```bash
# Check memory limits
kubectl get pods -n ecommerce -o jsonpath='{.items[*].spec.containers[*].resources.limits.memory}'

# Check actual usage
kubectl top pods -n ecommerce

# Increase limits if needed
# Edit k8s/backend-deployment.yaml
# resources:
#   limits:
#     memory: 1Gi
```

**Error**: "High CPU usage"
```bash
# Check CPU limits
kubectl get pods -n ecommerce -o jsonpath='{.items[*].spec.containers[*].resources.limits.cpu}'

# Check what's using CPU
# Inside pod: top -c

# Scale out with HPA
kubectl get hpa -n ecommerce -w
```

## Monitoring & Logging

### No Logs

**Error**: "No application logs"
```bash
# Ensure logging is configured
# Check LOG_LEVEL env var
echo $LOG_LEVEL

# Logs to stdout/stderr in Kubernetes
kubectl logs <pod-name> -n ecommerce

# Stream logs
kubectl logs <pod-name> -n ecommerce -f

# Previous logs (crashed pod)
kubectl logs <pod-name> -n ecommerce --previous
```

**Error**: "Can't access monitoring dashboard"
```bash
# Check Prometheus/Grafana is deployed
kubectl get pods -n prometheus

# Port forward to access
kubectl port-forward -n prometheus svc/grafana 3000:80

# Access at http://localhost:3000
```

## Getting Help

If you can't find a solution:

1. **Gather logs**:
   ```bash
   # Application logs
   kubectl logs <pod-name> -n ecommerce
   
   # System events
   kubectl get events -n ecommerce --sort-by='.lastTimestamp'
   
   # Describe pod
   kubectl describe pod <pod-name> -n ecommerce
   ```

2. **Check configuration**:
   ```bash
   # Environment variables
   kubectl exec <pod-name> -n ecommerce -- env
   
   # Config and secrets
   kubectl get configmap app-config -n ecommerce -o yaml
   ```

3. **Create GitHub issue** with:
   - Error message (complete)
   - Logs output
   - Steps to reproduce
   - Your environment (OS, versions)

---

**Still stuck?** See [DEVELOPMENT.md](DEVELOPMENT.md) and [DEPLOYMENT.md](DEPLOYMENT.md) for more detailed information.
