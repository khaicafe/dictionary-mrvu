#!/bin/bash

# Dictionary App Testing Script
# Tests the Excel import and search functionality

echo "=== Dictionary App API Test Suite ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
API_BASE="http://localhost:3000/api"
IMPORT_FILE="tudien.xlsx"
SEARCH_QUERY="hello"

# Function to test endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=$4
  
  echo -e "${YELLOW}Testing: $method $endpoint${NC}"
  
  if [ "$method" = "POST" ]; then
    if [ ! -z "$data" ]; then
      response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE$endpoint" -F "file=$data" -F "replace=true")
    else
      response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE$endpoint")
    fi
  else
    response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓ Status $http_code - PASS${NC}"
    echo "Response: $body" | head -c 200
    echo ""
  else
    echo -e "${RED}✗ Status $http_code (expected $expected_status) - FAIL${NC}"
    echo "Response: $body"
  fi
  echo ""
}

# Check if server is running
echo -e "${YELLOW}Checking if server is running...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
  echo -e "${GREEN}✓ Server is running${NC}"
else
  echo -e "${RED}✗ Server is not running${NC}"
  echo "Start the server with: npm run dev"
  exit 1
fi
echo ""

# Test 1: Check stats before import
echo -e "${YELLOW}=== Test 1: Get Statistics (Before Import) ===${NC}"
test_endpoint "GET" "/dictionary/stats" "" "200"

# Test 2: Import Excel file
if [ -f "$IMPORT_FILE" ]; then
  echo -e "${YELLOW}=== Test 2: Import Excel File ===${NC}"
  test_endpoint "POST" "/dictionary/import" "$IMPORT_FILE" "200"
else
  echo -e "${RED}✗ File not found: $IMPORT_FILE${NC}"
  echo "Please ensure tudien.xlsx is in the current directory"
fi
echo ""

# Test 3: Search for words
echo -e "${YELLOW}=== Test 3: Search Words ===${NC}"
test_endpoint "GET" "/dictionary/search?q=$SEARCH_QUERY&limit=10" "" "200"

# Test 4: Search with no query (should fail)
echo -e "${YELLOW}=== Test 4: Search with No Query (Error Test) ===${NC}"
test_endpoint "GET" "/dictionary/search" "" "400"

# Test 5: Check stats after import
echo -e "${YELLOW}=== Test 5: Get Statistics (After Import) ===${NC}"
test_endpoint "GET" "/dictionary/stats" "" "200"

echo -e "${GREEN}=== Test Suite Completed ===${NC}"
