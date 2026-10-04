#!/bin/bash

# ============================================================================
# Setup Azure Container Registry (ACR)
# ============================================================================
# This script creates and configures Azure Container Registry for AKS

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       AZURE CONTAINER REGISTRY SETUP                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# INPUT
# ============================================================================

read -p "Enter ACR name (e.g., myacr): " ACR_NAME
read -p "Enter Resource Group name (e.g., ecommerce-rg): " RESOURCE_GROUP
read -p "Enter location (e.g., eastus): " LOCATION

# Default to Basic SKU
SKU="Basic"

echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  ACR Name: ${ACR_NAME}"
echo "  Resource Group: ${RESOURCE_GROUP}"
echo "  Location: ${LOCATION}"
echo "  SKU: ${SKU}"
echo ""

# ============================================================================
# VERIFY AZURE CLI
# ============================================================================

if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed${NC}"
    echo "Install from: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check Azure login
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}You need to login to Azure...${NC}"
    az login
fi

CURRENT_ACCOUNT=$(az account show --query user.name -o tsv)
echo -e "${GREEN}✓ Logged in as: ${CURRENT_ACCOUNT}${NC}"
echo ""

# ============================================================================
# CREATE RESOURCE GROUP
# ============================================================================

echo -e "${YELLOW}Creating Resource Group...${NC}"

RG_EXISTS=$(az group exists --name ${RESOURCE_GROUP} --query value -o tsv 2>/dev/null || echo "false")

if [ "${RG_EXISTS}" = "true" ]; then
    echo -e "${GREEN}✓ Resource Group '${RESOURCE_GROUP}' already exists${NC}"
else
    echo "Creating new Resource Group..."
    az group create \
        --name ${RESOURCE_GROUP} \
        --location ${LOCATION}
    echo -e "${GREEN}✓ Resource Group created${NC}"
fi

echo ""

# ============================================================================
# CREATE ACR
# ============================================================================

echo -e "${YELLOW}Creating Azure Container Registry...${NC}"

ACR_EXISTS=$(az acr show --name ${ACR_NAME} --resource-group ${RESOURCE_GROUP} &>/dev/null && echo "true" || echo "false")

if [ "${ACR_EXISTS}" = "true" ]; then
    echo -e "${GREEN}✓ ACR '${ACR_NAME}' already exists${NC}"
else
    echo "Creating new ACR..."
    az acr create \
        --resource-group ${RESOURCE_GROUP} \
        --name ${ACR_NAME} \
        --sku ${SKU} \
        --admin-enabled true
    echo -e "${GREEN}✓ ACR created${NC}"
fi

echo ""

# ============================================================================
# GET ACR DETAILS
# ============================================================================

echo -e "${YELLOW}Retrieving ACR details...${NC}"

ACR_URL=$(az acr show \
    --resource-group ${RESOURCE_GROUP} \
    --name ${ACR_NAME} \
    --query loginServer \
    --output tsv)

ACR_ID=$(az acr show \
    --resource-group ${RESOURCE_GROUP} \
    --name ${ACR_NAME} \
    --query id \
    --output tsv)

echo -e "${GREEN}ACR URL: ${ACR_URL}${NC}"
echo -e "${GREEN}ACR ID: ${ACR_ID}${NC}"

echo ""

# ============================================================================
# GET CREDENTIALS
# ============================================================================

echo -e "${YELLOW}Getting ACR credentials...${NC}"

ACR_USERNAME=$(az acr credential show \
    --resource-group ${RESOURCE_GROUP} \
    --name ${ACR_NAME} \
    --query username \
    -o tsv)

ACR_PASSWORD=$(az acr credential show \
    --resource-group ${RESOURCE_GROUP} \
    --name ${ACR_NAME} \
    --query passwords[0].value \
    -o tsv)

echo -e "${GREEN}✓ Username: ${ACR_USERNAME}${NC}"
echo -e "${GREEN}✓ Password: ****${NC}"

echo ""

# ============================================================================
# TEST LOGIN
# ============================================================================

echo -e "${YELLOW}Testing Docker login...${NC}"

if docker login ${ACR_URL} -u ${ACR_USERNAME} -p ${ACR_PASSWORD} &>/dev/null; then
    echo -e "${GREEN}✓ Docker login successful${NC}"
else
    echo -e "${YELLOW}⚠ Docker login failed (Docker may not be running)${NC}"
fi

echo ""

# ============================================================================
# SAVE CONFIGURATION
# ============================================================================

echo -e "${YELLOW}Saving configuration...${NC}"

cat > .acr-config.sh << EOF
#!/bin/bash
# Azure Container Registry Configuration
# Auto-generated by setup-acr.sh

export ACR_NAME="${ACR_NAME}"
export ACR_URL="${ACR_URL}"
export ACR_USERNAME="${ACR_USERNAME}"
export RESOURCE_GROUP="${RESOURCE_GROUP}"
export LOCATION="${LOCATION}"
export ACR_ID="${ACR_ID}"

echo "ACR Configuration loaded:"
echo "  Name: \${ACR_NAME}"
echo "  URL: \${ACR_URL}"
echo "  Resource Group: \${RESOURCE_GROUP}"
EOF

chmod +x .acr-config.sh
echo -e "${GREEN}✓ Configuration saved to .acr-config.sh${NC}"

echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✓ SETUP COMPLETE                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo "📝 Quick Reference:"
echo ""
echo "ACR Login Server:  ${ACR_URL}"
echo "ACR Username:      ${ACR_USERNAME}"
echo "ACR Password:      (shown above)"
echo ""

echo "🔑 Environment variables:"
echo "  source .acr-config.sh"
echo ""

echo "🐳 Docker commands:"
echo "  docker login ${ACR_URL}"
echo "  docker tag ecommerce-backend:latest ${ACR_URL}/ecommerce-backend:latest"
echo "  docker push ${ACR_URL}/ecommerce-backend:latest"
echo ""

echo "📦 Build and push:"
echo "  make docker-build-all"
echo "  make docker-push-acr"
echo ""

echo "☸️  Link to AKS:"
echo "  # In k8s/backend-deployment.yaml, update:"
echo "  image: ${ACR_URL}/ecommerce-backend:latest"
echo ""

echo "🔒 For AKS with Managed Identity (recommended):"
echo "  az aks update -g ${RESOURCE_GROUP} -n <cluster-name> --attach-acr ${ACR_ID}"
echo ""

echo -e "${YELLOW}📚 Next Steps:${NC}"
echo "  1. Update Dockerfile image references"
echo "  2. Run: make docker-build-all"
echo "  3. Run: make docker-push-acr"
echo "  4. Update k8s manifests with ${ACR_URL}"
echo "  5. Run: make k8s-deploy"
echo ""
