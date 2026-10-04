#!/bin/bash

# ============================================================================
# Docker Build & Push Script for AKS
# ============================================================================
# Usage: ./scripts/docker-build.sh [--push]
# Example: ./scripts/docker-build.sh  # Just build locally
#          ./scripts/docker-build.sh --push  # Build and push to ACR

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# CONFIGURATION - CHANGE THESE VALUES
# ============================================================================

# Your Azure Container Registry details
ACR_NAME="myacr"  # Change to your ACR name
ACR_URL="${ACR_NAME}.azurecr.io"
IMAGE_PREFIX="ecommerce"
IMAGE_TAG="${1:-latest}"  # Tag from arg or 'latest'
PUSH_IMAGES="${2:---push}"  # Default to --push

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       ECOMMERCE DOCKER BUILD & PUSH SCRIPT FOR AKS            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# VERIFICATION
# ============================================================================

echo -e "${YELLOW}📋 Verifying configuration...${NC}"

# Check Docker is running
if ! docker ps &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check project structure
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Run this script from project root.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Project structure verified${NC}"

# Check Dockerfiles exist
if [ ! -f "docker/Dockerfile.backend" ]; then
    echo -e "${RED}❌ docker/Dockerfile.backend not found${NC}"
    exit 1
fi
if [ ! -f "docker/Dockerfile.web" ]; then
    echo -e "${RED}❌ docker/Dockerfile.web not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dockerfiles found${NC}"

echo ""
echo -e "${YELLOW}🏗️  Build Configuration:${NC}"
echo "  Registry: ${ACR_URL}"
echo "  Image Tag: ${IMAGE_TAG}"
echo "  Push to ACR: $([ "${PUSH_IMAGES}" = "--push" ] && echo 'YES' || echo 'NO')"
echo ""

# ============================================================================
# BUILD BACKEND IMAGE
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Building Backend Image...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

BACKEND_IMAGE="${ACR_URL}/${IMAGE_PREFIX}-backend:${IMAGE_TAG}"

docker build \
    --file docker/Dockerfile.backend \
    --tag "${BACKEND_IMAGE}" \
    --tag "${ACR_URL}/${IMAGE_PREFIX}-backend:latest" \
    --progress=plain \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend image built successfully${NC}"
    BACKEND_SIZE=$(docker images "${BACKEND_IMAGE}" --format "{{.Size}}")
    echo "  Image: ${BACKEND_IMAGE}"
    echo "  Size: ${BACKEND_SIZE}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi

echo ""

# ============================================================================
# BUILD WEB IMAGE
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Building Web Frontend Image...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

WEB_IMAGE="${ACR_URL}/${IMAGE_PREFIX}-web:${IMAGE_TAG}"

docker build \
    --file docker/Dockerfile.web \
    --tag "${WEB_IMAGE}" \
    --tag "${ACR_URL}/${IMAGE_PREFIX}-web:latest" \
    --progress=plain \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Web image built successfully${NC}"
    WEB_SIZE=$(docker images "${WEB_IMAGE}" --format "{{.Size}}")
    echo "  Image: ${WEB_IMAGE}"
    echo "  Size: ${WEB_SIZE}"
else
    echo -e "${RED}❌ Web build failed${NC}"
    exit 1
fi

echo ""

# ============================================================================
# VERIFY IMAGES
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Built Images:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

docker images | grep "${IMAGE_PREFIX}"

echo ""

# ============================================================================
# LOCAL TESTING (Optional)
# ============================================================================

read -p "🧪 Do you want to test images locally? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Testing backend image locally...${NC}"
    echo "Running: docker run --rm -p 3000:3000 ${BACKEND_IMAGE}"
    echo "Press Ctrl+C to stop..."
    docker run --rm -p 3000:3000 -e NODE_ENV=development "${BACKEND_IMAGE}" &
    sleep 3
    
    if curl -s http://localhost:3000/health/live > /dev/null; then
        echo -e "${GREEN}✓ Backend health check passed${NC}"
    else
        echo -e "${YELLOW}⚠ Backend not responding yet (this is ok for quick test)${NC}"
    fi
    
    kill %1 2>/dev/null || true
fi

echo ""

# ============================================================================
# PUSH TO ACR (if --push flag)
# ============================================================================

if [ "${PUSH_IMAGES}" = "--push" ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Pushing Images to ACR...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Check ACR login
    echo -e "${YELLOW}Logging into ACR...${NC}"
    if ! az acr login --name "${ACR_NAME}" 2>/dev/null; then
        echo -e "${RED}❌ Failed to login to ACR. Check ACR name and Azure login.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Logged into ACR${NC}"
    echo ""
    
    # Push backend
    echo -e "${YELLOW}Pushing backend image...${NC}"
    docker push "${BACKEND_IMAGE}"
    docker push "${ACR_URL}/${IMAGE_PREFIX}-backend:latest"
    echo -e "${GREEN}✓ Backend pushed${NC}"
    echo ""
    
    # Push web
    echo -e "${YELLOW}Pushing web image...${NC}"
    docker push "${WEB_IMAGE}"
    docker push "${ACR_URL}/${IMAGE_PREFIX}-web:latest"
    echo -e "${GREEN}✓ Web pushed${NC}"
    echo ""
    
    # Verify in ACR
    echo -e "${YELLOW}Verifying images in ACR...${NC}"
    echo -e "${BLUE}Backend repositories:${NC}"
    az acr repository show-tags --name "${ACR_NAME}" --repository "${IMAGE_PREFIX}-backend" 2>/dev/null || true
    echo -e "${BLUE}Web repositories:${NC}"
    az acr repository show-tags --name "${ACR_NAME}" --repository "${IMAGE_PREFIX}-web" 2>/dev/null || true
fi

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✓ BUILD COMPLETE                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "📦 Images built:"
echo "  Backend: ${BACKEND_IMAGE}"
echo "  Web:     ${WEB_IMAGE}"
echo ""

if [ "${PUSH_IMAGES}" = "--push" ]; then
    echo "🚀 Images pushed to ACR"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Update k8s/backend-deployment.yaml image to: ${BACKEND_IMAGE}"
    echo "  2. Update k8s/web-deployment.yaml image to: ${WEB_IMAGE}"
    echo "  3. Deploy to AKS:"
    echo "     kubectl apply -f k8s/"
    echo ""
    echo "📊 Verify deployment:"
    echo "  kubectl get pods -n ecommerce"
    echo "  kubectl get svc -n ecommerce"
else
    echo "💾 Images ready locally"
    echo ""
    echo "To push to ACR, run:"
    echo "  ./scripts/docker-build.sh --push"
fi

echo ""
