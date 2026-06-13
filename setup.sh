#!/usr/bin/env bash

# AutoSort Application Setup Script
# This script automates the complete setup process
set -e
echo "🚀 AutoSort Setup Script"
echo "========================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${YELLOW}[1/5]${NC} Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"

# Step 2: Install root dependencies
echo ""
echo -e "${YELLOW}[2/5]${NC} Installing root dependencies..."

if [ -f "package.json" ]; then
    npm install --legacy-peer-deps
    echo -e "${GREEN}✓ Root dependencies installed${NC}"
else
    echo -e "${RED}✗ package.json not found${NC}"
    exit 1
fi

# Step 3: Install renderer dependencies
echo ""
echo -e "${YELLOW}[3/5]${NC} Installing renderer dependencies..."

if [ -f "renderer/package.json" ]; then
    cd renderer
    npm install --legacy-peer-deps
    cd ..
    echo -e "${GREEN}✓ Renderer dependencies installed${NC}"
else
    echo -e "${RED}✗ renderer/package.json not found${NC}"
    exit 1
fi

# Step 4: Create environment files
echo ""
echo -e "${YELLOW}[4/5]${NC} Setting up environment files..."

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ .env created from template${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists or template not found${NC}"
fi

# Step 5: Verify installation
echo ""
echo -e "${YELLOW}[5/5]${NC} Verifying installation..."

# Check critical files
REQUIRED_FILES=(
    "package.json"
    "renderer/package.json"
    "electron-main/main.ts"
    "renderer/src/main.tsx"
    "shared/types.ts"
    "db/database.ts"
)

ALL_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ Missing: $file${NC}"
        ALL_EXIST=false
    fi
done

if [ "$ALL_EXIST" = true ]; then
    echo -e "${GREEN}✓ All required files present${NC}"
else
    echo -e "${RED}✗ Some required files are missing${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "  1. npm run dev           (Start development server)"
echo "  2. npm run build         (Build for production)"
echo "  3. npm run dist          (Create installer)"
echo ""
echo "Documentation:"
echo "  - README.md              (Full documentation)"
echo "  - QUICKSTART.md          (Quick setup guide)"
echo "  - PROJECT_STRUCTURE.md   (File structure overview)"
echo ""
