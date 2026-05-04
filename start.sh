#!/bin/bash
# Quick start script for the Art Marketplace Docker setup

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Art Marketplace Docker Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}[!] .env file not found${NC}"
    echo -e "${YELLOW}[*] Creating .env from .env.example${NC}"
    cp .env.example .env
    echo -e "${GREEN}[✓] Created .env file${NC}"
    echo -e "${YELLOW}[!] Please edit .env with your configuration values${NC}\n"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}[✗] Docker daemon is not running${NC}"
    echo -e "${YELLOW}[*] Please start Docker and try again${NC}"
    exit 1
fi

echo -e "${GREEN}[✓] Docker is running${NC}\n"

# Parse arguments
COMMAND=${1:-up}

case "$COMMAND" in
    up)
        echo -e "${BLUE}Starting all services...${NC}"
        docker-compose up -d
        echo -e "${GREEN}[✓] Services started!${NC}\n"

        echo -e "${BLUE}Waiting for services to be ready...${NC}"
        sleep 5

        echo -e "${GREEN}[✓] Services are ready!${NC}\n"
        echo -e "${BLUE}========================================${NC}"
        echo -e "Frontend: ${GREEN}http://localhost:5173${NC}"
        echo -e "Backend:  ${GREEN}http://localhost:3001/api${NC}"
        echo -e "${BLUE}========================================${NC}\n"

        echo -e "${YELLOW}View logs:${NC} docker-compose logs -f"
        echo -e "${YELLOW}Stop services:${NC} docker-compose down"
        ;;

    down)
        echo -e "${BLUE}Stopping all services...${NC}"
        docker-compose down
        echo -e "${GREEN}[✓] Services stopped${NC}"
        ;;

    logs)
        docker-compose logs -f
        ;;

    rebuild)
        echo -e "${BLUE}Rebuilding all services...${NC}"
        docker-compose up -d --build
        echo -e "${GREEN}[✓] Services rebuilt and started${NC}"
        ;;

    rebuild-backend)
        echo -e "${BLUE}Rebuilding backend service...${NC}"
        docker-compose up -d --build backend
        echo -e "${GREEN}[✓] Backend rebuilt and started${NC}"
        ;;

    rebuild-frontend)
        echo -e "${BLUE}Rebuilding frontend service...${NC}"
        docker-compose up -d --build frontend
        echo -e "${GREEN}[✓] Frontend rebuilt and started${NC}"
        ;;

    status)
        echo -e "${BLUE}Service Status:${NC}"
        docker-compose ps
        ;;

    clean)
        echo -e "${YELLOW}This will remove all containers, volumes, and images${NC}"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            docker system prune -a --volumes -f
            echo -e "${GREEN}[✓] Clean complete${NC}"
        fi
        ;;

    tunnel)
        echo -e "${BLUE}Starting with Cloudflare tunnel...${NC}"
        docker-compose --profile tunnel up -d
        echo -e "${GREEN}[✓] Services started with tunnel${NC}"
        ;;

    help)
        echo -e "${BLUE}Usage: ./start.sh [COMMAND]${NC}\n"
        echo "Commands:"
        echo "  up                Start all services (default)"
        echo "  down              Stop all services"
        echo "  logs              View service logs"
        echo "  rebuild           Rebuild and start all services"
        echo "  rebuild-backend   Rebuild and start backend only"
        echo "  rebuild-frontend  Rebuild and start frontend only"
        echo "  status            Show service status"
        echo "  clean             Remove all containers and volumes"
        echo "  tunnel            Start with Cloudflare tunnel"
        echo "  help              Show this help message"
        ;;

    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo "Run './start.sh help' for available commands"
        exit 1
        ;;
esac
