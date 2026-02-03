#!/bin/bash

set -e

# Move to project root
cd "$(dirname "$0")/.."

echo "================================"
echo "Astro Qualif - Setup Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

command -v aws >/dev/null 2>&1 || { echo -e "${RED}AWS CLI not found. Please install it first.${NC}" >&2; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo -e "${RED}Terraform not found. Please install it first.${NC}" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js not found. Please install it first.${NC}" >&2; exit 1; }
command -v yarn >/dev/null 2>&1 || { echo -e "${RED}Yarn not found. Please install it first.${NC}" >&2; exit 1; }

echo -e "${GREEN}✓ All prerequisites installed${NC}"
echo ""

# Check AWS credentials
echo "Checking AWS credentials..."
if aws sts get-caller-identity >/dev/null 2>&1; then
    echo -e "${GREEN}✓ AWS credentials configured${NC}"
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo "  Account ID: $AWS_ACCOUNT_ID"
else
    echo -e "${RED}✗ AWS credentials not configured${NC}"
    echo "  Run: aws configure"
    exit 1
fi
echo ""

# Create terraform.tfvars if not exists
if [ ! -f terraform/terraform.tfvars ]; then
    echo -e "${YELLOW}Creating terraform.tfvars from example...${NC}"
    cp terraform/terraform.tfvars.example terraform/terraform.tfvars
    echo -e "${GREEN}✓ Created terraform/terraform.tfvars${NC}"
    echo -e "${YELLOW}  Please edit this file with your configuration${NC}"
else
    echo -e "${GREEN}✓ terraform.tfvars already exists${NC}"
fi
echo ""

# Prompt for configuration
read -p "Do you want to configure terraform.tfvars now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter admin email: " ADMIN_EMAIL
    read -sp "Enter admin password: " ADMIN_PASSWORD
    echo ""
    read -p "Enter reCAPTCHA site key (press Enter for test key): " RECAPTCHA_SITE_KEY
    read -p "Enter reCAPTCHA secret key (press Enter for test key): " RECAPTCHA_SECRET_KEY

    # Update terraform.tfvars
    sed -i.bak "s/admin_email.*/admin_email    = \"$ADMIN_EMAIL\"/" terraform/terraform.tfvars
    sed -i.bak "s/admin_password.*/admin_password = \"$ADMIN_PASSWORD\"/" terraform/terraform.tfvars

    if [ ! -z "$RECAPTCHA_SITE_KEY" ]; then
        sed -i.bak "s/recaptcha_site_key.*/recaptcha_site_key   = \"$RECAPTCHA_SITE_KEY\"/" terraform/terraform.tfvars
    fi

    if [ ! -z "$RECAPTCHA_SECRET_KEY" ]; then
        sed -i.bak "s/recaptcha_secret_key.*/recaptcha_secret_key = \"$RECAPTCHA_SECRET_KEY\"/" terraform/terraform.tfvars
    fi

    rm -f terraform/terraform.tfvars.bak
    echo -e "${GREEN}✓ Configuration updated${NC}"
fi
echo ""

# Install Lambda dependencies
echo "Installing Lambda dependencies..."

# Create empty yarn.lock files to treat lambdas as independent projects
for lambda_dir in lambda/auth lambda/authorizer lambda/crud lambda/recaptcha; do
    [ ! -f "$lambda_dir/yarn.lock" ] && touch "$lambda_dir/yarn.lock"
done

(cd lambda/auth && NPM_TOKEN=dummy yarn install) || { echo -e "${RED}✗ Failed to install auth dependencies${NC}"; exit 1; }
(cd lambda/authorizer && NPM_TOKEN=dummy yarn install) || { echo -e "${RED}✗ Failed to install authorizer dependencies${NC}"; exit 1; }
(cd lambda/crud && NPM_TOKEN=dummy yarn install) || { echo -e "${RED}✗ Failed to install crud dependencies${NC}"; exit 1; }
(cd lambda/recaptcha && NPM_TOKEN=dummy yarn install) || { echo -e "${RED}✗ Failed to install recaptcha dependencies${NC}"; exit 1; }
echo -e "${GREEN}✓ Lambda dependencies installed${NC}"
echo ""

# Initialize Terraform
echo "Initializing Terraform..."
(cd terraform && terraform init >/dev/null 2>&1)
echo -e "${GREEN}✓ Terraform initialized${NC}"
echo ""

echo "================================"
echo -e "${GREEN}Setup completed!${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo "  1. Review terraform/terraform.tfvars"
echo "  2. Run: make terraform-plan"
echo "  3. Run: make terraform-apply"
echo "  4. Run: make init-admin"
echo "  5. Run: make deploy-frontend"
echo ""
echo "Or simply run: make deploy-all"
echo ""
