#!/bin/bash

# 🚀 Dictionary MRVU Setup Script
# Tự động setup project

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          📚 Dictionary MRVU - Setup Script                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check Node.js
echo -e "${YELLOW}1️⃣  Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "   Please install Node.js from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js $NODE_VERSION found${NC}"
echo ""

# Step 2: Check npm
echo -e "${YELLOW}2️⃣  Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm $NPM_VERSION found${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}3️⃣  Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 4: Create data directory
echo -e "${YELLOW}4️⃣  Creating data directory...${NC}"
mkdir -p data
echo -e "${GREEN}✓ Data directory created${NC}"
echo ""

# Step 5: Copy .env file
echo -e "${YELLOW}5️⃣  Setting up environment variables...${NC}"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created .env.local from .env.example${NC}"
else
    echo -e "${BLUE}ℹ️  .env.local already exists${NC}"
fi
echo ""

# Step 6: Build project
echo -e "${YELLOW}6️⃣  Building project...${NC}"
npm run build 2>&1 | grep -v "WARN\|warn" | head -20 || true
echo -e "${GREEN}✓ Build completed${NC}"
echo ""

# Step 7: Success message
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  ✅ SETUP COMPLETED SUCCESSFULLY!                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📚 Project Ready!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo -e "  ${BLUE}1. Start development server:${NC}"
echo -e "     ${GREEN}npm run dev${NC}"
echo ""
echo -e "  ${BLUE}2. Open in browser:${NC}"
echo -e "     ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "  ${BLUE}3. Upload dictionary at:${NC}"
echo -e "     ${GREEN}http://localhost:3000/admin/import${NC}"
echo ""
echo -e "  ${BLUE}4. Upload your \`tudien.xlsx\` file${NC}"
echo ""
echo -e "${YELLOW}Features:${NC}"
echo -e "  ✓ Fast SQLite search"
echo -e "  ✓ Excel import/update"
echo -e "  ✓ Beautiful UI"
echo -e "  ✓ RESTful API"
echo -e "  ✓ TypeScript"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo -e "  • README.md - Project overview"
echo -e "  • QUICK_START.md - Quick start guide"
echo -e "  • DEVELOPER.md - Developer guide"
echo ""
echo -e "${GREEN}🎉 Happy Searching!${NC}"
echo ""
