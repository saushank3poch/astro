#!/bin/bash

# Astro Development Environment Startup Script

echo "🌟 Starting Astro Development Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: Please run this script from the project root directory${NC}"
  exit 1
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists node; then
  echo -e "${RED}✗ Node.js is not installed${NC}"
  echo "Please install Node.js 18+ from https://nodejs.org/"
  exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) found${NC}"

if ! command_exists npm; then
  echo -e "${RED}✗ npm is not installed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ npm $(npm --version) found${NC}"

# Check if PostgreSQL is accessible
if ! command_exists psql; then
  echo -e "${YELLOW}⚠ PostgreSQL client (psql) not found${NC}"
  echo "  Make sure you have a PostgreSQL database available"
fi

echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing root dependencies..."
  npm install
  echo ""
fi

if [ ! -d "apps/api/node_modules" ]; then
  echo "📦 Installing API dependencies..."
  cd apps/api && npm install && cd ../..
  echo ""
fi

if [ ! -d "apps/web/node_modules" ]; then
  echo "📦 Installing Web dependencies..."
  cd apps/web && npm install && cd ../..
  echo ""
fi

# Check if .env exists
if [ ! -f "apps/api/.env" ]; then
  echo -e "${YELLOW}⚠ No .env file found in apps/api/${NC}"
  echo "  Copying from .env.example..."
  cp apps/api/.env.example apps/api/.env
  echo -e "${YELLOW}  Please edit apps/api/.env and set your DATABASE_URL${NC}"
  echo ""
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
cd apps/api && npm run db:generate && cd ../..
echo ""

# Ask if user wants to push schema
echo -e "${YELLOW}Do you want to push the database schema? (y/n)${NC}"
read -r push_schema

if [ "$push_schema" = "y" ]; then
  echo "📊 Pushing database schema..."
  cd apps/api && npm run db:push && cd ../..
  echo ""

  echo -e "${YELLOW}Do you want to seed the database with test data? (y/n)${NC}"
  read -r seed_db

  if [ "$seed_db" = "y" ]; then
    echo "🌱 Seeding database..."
    cd apps/api && npm run db:seed && cd ../..
    echo ""
  fi
fi

echo "✨ Environment ready!"
echo ""
echo "To start the application:"
echo ""
echo -e "${GREEN}1. Start the API (in this terminal):${NC}"
echo "   cd apps/api && npm run dev"
echo ""
echo -e "${GREEN}2. Start the Web App (in a new terminal):${NC}"
echo "   cd apps/web && npm run dev"
echo ""
echo -e "${GREEN}3. Open your browser:${NC}"
echo "   http://localhost:3000"
echo ""
echo "📚 See TESTING_GUIDE.md for detailed testing instructions"
echo ""
