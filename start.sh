#!/bin/bash

# AI Smart Building Manager - Start Script
# This script sets up and starts the entire application

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           AI Smart Building Manager                        ║"
echo "║           Starting Application...                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
    echo -e "${RED}✗ .env file not found! Please create one.${NC}"
    exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

# Function to kill processes on specific ports
cleanup_ports() {
    echo -e "${YELLOW}Cleaning up ports...${NC}"

    # Kill anything on backend port
    lsof -ti:$BACKEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}  ✓ Port $BACKEND_PORT cleared${NC}"

    # Kill anything on frontend port
    lsof -ti:$FRONTEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}  ✓ Port $FRONTEND_PORT cleared${NC}"
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    # Kill process groups
    lsof -ti:$BACKEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
    lsof -ti:$FRONTEND_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✓ Application stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Clean up ports first
cleanup_ports

# Check for PostgreSQL
echo -e "\n${BLUE}Checking PostgreSQL...${NC}"
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL found${NC}"
else
    echo -e "${RED}✗ PostgreSQL not found. Please install PostgreSQL.${NC}"
    exit 1
fi

# Check if PostgreSQL is running
if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    else
        sudo service postgresql start 2>/dev/null || true
    fi
    sleep 2
    if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL started${NC}"
    else
        echo -e "${RED}✗ Could not start PostgreSQL. Please start it manually.${NC}"
        exit 1
    fi
fi

# Install backend dependencies
echo -e "\n${BLUE}Installing backend dependencies...${NC}"
cd "$SCRIPT_DIR/backend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Seed database
echo -e "\n${BLUE}Seeding database...${NC}"
node seeds/seed.js
echo -e "${GREEN}✓ Database seeded successfully${NC}"

# Install frontend dependencies
echo -e "\n${BLUE}Installing frontend dependencies...${NC}"
cd "$SCRIPT_DIR/frontend"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Start backend with file watching (auto-reload on changes)
echo -e "\n${BLUE}Starting backend server (port $BACKEND_PORT) with hot reload...${NC}"
cd "$SCRIPT_DIR/backend"
node --watch server.js &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
sleep 2

# Start frontend dev server (Vite with HMR - auto reloads on changes)
echo -e "${BLUE}Starting frontend dev server (port $FRONTEND_PORT) with hot reload...${NC}"
cd "$SCRIPT_DIR/frontend"
npx vite --port $FRONTEND_PORT &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo -e "\n${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           Application is running!                          ║"
echo "║                                                            ║"
echo "║   Frontend:  http://localhost:$FRONTEND_PORT                    ║"
echo "║   Backend:   http://localhost:$BACKEND_PORT                     ║"
echo "║                                                            ║"
echo "║   Login:     admin@smartbuilding.com / password123         ║"
echo "║                                                            ║"
echo "║   Both servers auto-reload on code changes                 ║"
echo "║   Press Ctrl+C to stop                                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Wait for both processes
wait
