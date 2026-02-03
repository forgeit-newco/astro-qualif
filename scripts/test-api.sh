#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get API URL from Terraform
cd terraform
API_URL=$(terraform output -raw api_gateway_url 2>/dev/null)
cd ..

if [ -z "$API_URL" ]; then
    echo -e "${RED}Error: Could not get API URL from Terraform${NC}"
    echo "Make sure you have deployed the infrastructure first (make terraform-apply)"
    exit 1
fi

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}API Gateway Test Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "API URL: ${GREEN}$API_URL${NC}"
echo ""

# Test 1: Login
echo -e "${YELLOW}Test 1: POST /auth/login${NC}"
echo "Request: {\"email\":\"admin@example.com\",\"password\":\"forge2024\"}"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"forge2024"}')

echo -e "Response: ${GREEN}$LOGIN_RESPONSE${NC}"
echo ""

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Login failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Login successful!${NC}"
echo -e "Token: ${TOKEN:0:50}...${NC}"
echo ""

# Test 2: Get prospects (protected)
echo -e "${YELLOW}Test 2: GET /prospects (protected)${NC}"
echo "Request: Authorization: Bearer <token>"
echo ""

PROSPECTS_RESPONSE=$(curl -s -X GET "$API_URL/prospects" \
  -H "Authorization: Bearer $TOKEN")

echo -e "Response: ${GREEN}$PROSPECTS_RESPONSE${NC}"
echo ""

if echo "$PROSPECTS_RESPONSE" | grep -q "error"; then
    echo -e "${RED}✗ Get prospects failed!${NC}"
else
    echo -e "${GREEN}✓ Get prospects successful!${NC}"
fi
echo ""

# Test 3: Create prospect (public)
echo -e "${YELLOW}Test 3: POST /prospects (public)${NC}"
echo "Request: Creating test prospect..."
echo ""

CREATE_RESPONSE=$(curl -s -X POST "$API_URL/prospects" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+33123456789",
    "company": "ACME Corp",
    "position": "CTO"
  }')

echo -e "Response: ${GREEN}$CREATE_RESPONSE${NC}"
echo ""

if echo "$CREATE_RESPONSE" | grep -q "id"; then
    echo -e "${GREEN}✓ Create prospect successful!${NC}"
    PROSPECT_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//')
    echo -e "Prospect ID: ${BLUE}$PROSPECT_ID${NC}"
else
    echo -e "${RED}✗ Create prospect failed!${NC}"
fi
echo ""

# Test 4: Get single prospect (protected)
if [ ! -z "$PROSPECT_ID" ]; then
    echo -e "${YELLOW}Test 4: GET /prospects/$PROSPECT_ID (protected)${NC}"
    echo "Request: Authorization: Bearer <token>"
    echo ""

    PROSPECT_RESPONSE=$(curl -s -X GET "$API_URL/prospects/$PROSPECT_ID" \
      -H "Authorization: Bearer $TOKEN")

    echo -e "Response: ${GREEN}$PROSPECT_RESPONSE${NC}"
    echo ""

    if echo "$PROSPECT_RESPONSE" | grep -q "$PROSPECT_ID"; then
        echo -e "${GREEN}✓ Get single prospect successful!${NC}"
    else
        echo -e "${RED}✗ Get single prospect failed!${NC}"
    fi
    echo ""
fi

# Test 5: Update prospect (protected)
if [ ! -z "$PROSPECT_ID" ]; then
    echo -e "${YELLOW}Test 5: PATCH /prospects/$PROSPECT_ID (protected)${NC}"
    echo "Request: Update status to 'Qualifié'"
    echo ""

    UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/prospects/$PROSPECT_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"status":"Qualifié"}')

    echo -e "Response: ${GREEN}$UPDATE_RESPONSE${NC}"
    echo ""

    if echo "$UPDATE_RESPONSE" | grep -q "Qualifié"; then
        echo -e "${GREEN}✓ Update prospect successful!${NC}"
    else
        echo -e "${RED}✗ Update prospect failed!${NC}"
    fi
    echo ""
fi

# Test 6: Delete prospect (protected)
if [ ! -z "$PROSPECT_ID" ]; then
    echo -e "${YELLOW}Test 6: DELETE /prospects/$PROSPECT_ID (protected)${NC}"
    echo ""

    DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/prospects/$PROSPECT_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -w "\nHTTP Status: %{http_code}")

    echo -e "Response: ${GREEN}$DELETE_RESPONSE${NC}"
    echo ""

    if echo "$DELETE_RESPONSE" | grep -q "204"; then
        echo -e "${GREEN}✓ Delete prospect successful!${NC}"
    else
        echo -e "${RED}✗ Delete prospect failed!${NC}"
    fi
    echo ""
fi

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}All tests completed!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "API URL: $API_URL"
echo ""
echo "Next steps:"
echo "  1. Open frontend: make deploy-frontend"
echo "  2. Monitor logs: make logs-auth or make logs-crud"
echo "  3. View CloudWatch: aws cloudwatch get-metric-statistics"
echo ""
