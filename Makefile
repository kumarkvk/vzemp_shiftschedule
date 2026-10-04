.PHONY: help install dev build test lint type-check clean db-migrate db-seed \
        docker-build-backend docker-build-web docker-build-mobile docker-build-all \
        docker-test docker-test-backend docker-test-web \
        docker-login-acr docker-push-acr docker-push-backend docker-push-web docker-push-mobile \
        k8s-deploy k8s-delete k8s-status k8s-logs docker-up docker-down

# Color output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

# Configuration
ACR_NAME ?= myacr
ACR_URL := $(ACR_NAME).azurecr.io
IMAGE_TAG ?= latest
NAMESPACE ?= ecommerce

help:
	@echo "$(BLUE)╔════════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║    ECOMMERCE DOCKER & KUBERNETES - BUILD & DEPLOY             ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)📦 DEVELOPMENT:$(NC)"
	@echo "  make install               - Install dependencies"
	@echo "  make dev                   - Start all in development"
	@echo "  make build                 - Build all packages"
	@echo "  make test                  - Run all tests"
	@echo "  make lint                  - Lint all code"
	@echo ""
	@echo "$(YELLOW)🐳 DOCKER BUILD:$(NC)"
	@echo "  make docker-build-backend  - Build backend image"
	@echo "  make docker-build-web      - Build web image"
	@echo "  make docker-build-mobile   - Build mobile image"
	@echo "  make docker-build-all      - Build all images"
	@echo ""
	@echo "$(YELLOW)🧪 DOCKER TEST:$(NC)"
	@echo "  make docker-test           - Full stack with docker-compose"
	@echo "  make docker-test-backend   - Test backend on port 3000"
	@echo "  make docker-test-web       - Test web on port 8080"
	@echo "  make docker-up             - Start docker-compose"
	@echo "  make docker-down           - Stop docker-compose"
	@echo ""
	@echo "$(YELLOW)☁️  AZURE REGISTRY:$(NC)"
	@echo "  make docker-login-acr      - Login to Azure Container Registry"
	@echo "  make docker-push-backend   - Push backend to ACR"
	@echo "  make docker-push-web       - Push web to ACR"
	@echo "  make docker-push-acr       - Push all to ACR"
	@echo ""
	@echo "$(YELLOW)☸️  KUBERNETES:$(NC)"
	@echo "  make k8s-deploy            - Deploy to AKS"
	@echo "  make k8s-status            - Show status"
	@echo "  make k8s-logs              - Show logs"
	@echo "  make k8s-delete            - Delete deployment"
	@echo ""
	@echo "$(YELLOW)CONFIG: ACR_NAME=$(ACR_NAME)  IMAGE_TAG=$(IMAGE_TAG)  NAMESPACE=$(NAMESPACE)$(NC)"
	@echo ""

# ============================================================================
# DEVELOPMENT
# ============================================================================

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm test

test-cov:
	pnpm test:cov

lint:
	pnpm lint

type-check:
	pnpm type-check

clean:
	rm -rf packages/backend/dist
	rm -rf packages/web/dist
	rm -rf packages/mobile/dist
	find . -type d -name "node_modules" -prune

db-migrate:
	pnpm db:migrate

db-seed:
	pnpm db:seed

db-reset:
	pnpm db:reset

# ============================================================================
# DOCKER BUILD
# ============================================================================

docker-build-backend:
	@echo "$(GREEN)Building backend image...$(NC)"
	docker build \
		--file docker/Dockerfile.backend \
		--tag ecommerce-backend:$(IMAGE_TAG) \
		--tag $(ACR_URL)/ecommerce-backend:$(IMAGE_TAG) \
		--progress=plain \
		.
	@echo "$(GREEN)✓ Backend built$(NC)"

docker-build-web:
	@echo "$(GREEN)Building web image...$(NC)"
	docker build \
		--file docker/Dockerfile.web \
		--tag ecommerce-web:$(IMAGE_TAG) \
		--tag $(ACR_URL)/ecommerce-web:$(IMAGE_TAG) \
		--progress=plain \
		.
	@echo "$(GREEN)✓ Web built$(NC)"

docker-build-mobile:
	@echo "$(GREEN)Building mobile image...$(NC)"
	docker build \
		--file docker/Dockerfile.mobile \
		--tag ecommerce-mobile:$(IMAGE_TAG) \
		--tag $(ACR_URL)/ecommerce-mobile:$(IMAGE_TAG) \
		--progress=plain \
		.
	@echo "$(GREEN)✓ Mobile built$(NC)"

docker-build-all: docker-build-backend docker-build-web docker-build-mobile
	@echo "$(GREEN)✓ All images built$(NC)"
	@docker images | grep ecommerce

docker-build:
	$(MAKE) docker-build-all

# ============================================================================
# DOCKER TEST
# ============================================================================

docker-up:
	docker-compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"

docker-down:
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

docker-logs:
	docker-compose logs -f

docker-test:
	@echo "$(GREEN)Starting full stack...$(NC)"
	$(MAKE) docker-up
	@sleep 5
	@echo "$(GREEN)Testing endpoints...$(NC)"
	@curl -s http://localhost:3000/health/live && echo "✓ Backend OK" || echo "⚠ Backend not ready"
	@curl -s http://localhost:8080/ > /dev/null && echo "✓ Web OK" || echo "⚠ Web not ready"
	@echo ""
	@echo "View logs: make docker-logs"
	@echo "Stop: make docker-down"

docker-test-backend:
	@docker run --rm -d --name test-backend -p 3000:3000 ecommerce-backend:$(IMAGE_TAG)
	@sleep 3
	@curl http://localhost:3000/health/live && echo "" && echo "✓ Backend OK"
	@docker stop test-backend

docker-test-web:
	@docker run --rm -d --name test-web -p 8080:8080 ecommerce-web:$(IMAGE_TAG)
	@sleep 3
	@curl http://localhost:8080/ > /dev/null && echo "✓ Web OK"
	@docker stop test-web

# ============================================================================
# ACR PUSH
# ============================================================================

docker-login-acr:
	@echo "$(YELLOW)Logging into ACR...$(NC)"
	az acr login --name $(ACR_NAME)
	@echo "$(GREEN)✓ Logged in$(NC)"

docker-push-backend: docker-login-acr
	@echo "$(YELLOW)Pushing backend...$(NC)"
	docker push $(ACR_URL)/ecommerce-backend:$(IMAGE_TAG)
	docker push $(ACR_URL)/ecommerce-backend:latest
	@echo "$(GREEN)✓ Backend pushed$(NC)"

docker-push-web: docker-login-acr
	@echo "$(YELLOW)Pushing web...$(NC)"
	docker push $(ACR_URL)/ecommerce-web:$(IMAGE_TAG)
	docker push $(ACR_URL)/ecommerce-web:latest
	@echo "$(GREEN)✓ Web pushed$(NC)"

docker-push-mobile: docker-login-acr
	@echo "$(YELLOW)Pushing mobile...$(NC)"
	docker push $(ACR_URL)/ecommerce-mobile:$(IMAGE_TAG)
	docker push $(ACR_URL)/ecommerce-mobile:latest
	@echo "$(GREEN)✓ Mobile pushed$(NC)"

docker-push-acr: docker-build-all docker-push-backend docker-push-web docker-push-mobile
	@echo "$(GREEN)✓ All images pushed$(NC)"

# ============================================================================
# KUBERNETES
# ============================================================================

k8s-deploy:
	@echo "$(YELLOW)Deploying to AKS...$(NC)"
	kubectl create namespace $(NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -
	kubectl apply -f k8s/ -n $(NAMESPACE)
	@echo "$(GREEN)✓ Deployment initiated$(NC)"
	@sleep 5
	kubectl get pods -n $(NAMESPACE)

k8s-delete:
	@read -p "Delete from $(NAMESPACE)? (y/N) " confirm; \
	if [ "$$confirm" = "y" ]; then \
		kubectl delete -f k8s/ -n $(NAMESPACE) || true; \
		echo "$(GREEN)✓ Deleted$(NC)"; \
	else \
		echo "Cancelled"; \
	fi

k8s-status:
	@echo "$(BLUE)Deployments in $(NAMESPACE):$(NC)"
	kubectl get deployments -n $(NAMESPACE)
	@echo ""
	@echo "$(BLUE)Pods:$(NC)"
	kubectl get pods -n $(NAMESPACE)
	@echo ""
	@echo "$(BLUE)Services:$(NC)"
	kubectl get svc -n $(NAMESPACE)

k8s-logs:
	kubectl logs -f -n $(NAMESPACE) -l app=ecommerce-backend 2>/dev/null || \
	kubectl logs -f -n $(NAMESPACE) -l app=ecommerce-web 2>/dev/null || \
	echo "No logs available"

# Backward compatibility
k8s-apply: k8s-deploy
k8s-delete-local: k8s-delete
k8s-deploy-local: k8s-deploy

.DEFAULT_GOAL := help
