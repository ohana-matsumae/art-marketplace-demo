# Quick start script for the Art Marketplace Docker setup

param(
    [string]$Command = "up"
)

# Color codes
$Green = [System.ConsoleColor]::Green
$Blue = [System.ConsoleColor]::Blue
$Yellow = [System.ConsoleColor]::Yellow
$Red = [System.ConsoleColor]::Red

function Write-ColorOutput($Color, $Message) {
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    Write-ColorOutput $Blue "========================================"
    Write-ColorOutput $Blue "Art Marketplace Docker Setup"
    Write-ColorOutput $Blue "========================================"
    Write-Host ""
}

function Write-Footer {
    Write-ColorOutput $Blue "========================================"
}

# Main script
Write-Header

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-ColorOutput $Yellow "[!] .env file not found"
    Write-ColorOutput $Yellow "[*] Creating .env from .env.example"
    Copy-Item ".env.example" ".env"
    Write-ColorOutput $Green "[✓] Created .env file"
    Write-ColorOutput $Yellow "[!] Please edit .env with your configuration values"
    Write-Host ""
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-ColorOutput $Green "[✓] Docker is running"
} catch {
    Write-ColorOutput $Red "[✗] Docker daemon is not running"
    Write-ColorOutput $Yellow "[*] Please start Docker and try again"
    exit 1
}

Write-Host ""

switch ($Command) {
    "up" {
        Write-ColorOutput $Blue "Starting all services..."
        docker-compose up -d
        Write-ColorOutput $Green "[✓] Services started!"
        Write-Host ""

        Write-ColorOutput $Blue "Waiting for services to be ready..."
        Start-Sleep -Seconds 5

        Write-ColorOutput $Green "[✓] Services are ready!"
        Write-Host ""
        Write-Footer
        Write-ColorOutput $Green "Frontend: http://localhost:5173"
        Write-ColorOutput $Green "Backend:  http://localhost:3001/api"
        Write-Footer
        Write-Host ""

        Write-ColorOutput $Yellow "View logs: docker-compose logs -f"
        Write-ColorOutput $Yellow "Stop services: docker-compose down"
    }

    "down" {
        Write-ColorOutput $Blue "Stopping all services..."
        docker-compose down
        Write-ColorOutput $Green "[✓] Services stopped"
    }

    "logs" {
        docker-compose logs -f
    }

    "rebuild" {
        Write-ColorOutput $Blue "Rebuilding all services..."
        docker-compose up -d --build
        Write-ColorOutput $Green "[✓] Services rebuilt and started"
    }

    "rebuild-backend" {
        Write-ColorOutput $Blue "Rebuilding backend service..."
        docker-compose up -d --build backend
        Write-ColorOutput $Green "[✓] Backend rebuilt and started"
    }

    "rebuild-frontend" {
        Write-ColorOutput $Blue "Rebuilding frontend service..."
        docker-compose up -d --build frontend
        Write-ColorOutput $Green "[✓] Frontend rebuilt and started"
    }

    "status" {
        Write-ColorOutput $Blue "Service Status:"
        docker-compose ps
    }

    "clean" {
        Write-ColorOutput $Yellow "This will remove all containers, volumes, and images"
        $confirmation = Read-Host "Are you sure? (y/N)"
        if ($confirmation -eq "y" -or $confirmation -eq "Y") {
            docker-compose down -v
            docker system prune -a --volumes -f
            Write-ColorOutput $Green "[✓] Clean complete"
        }
    }

    "tunnel" {
        Write-ColorOutput $Blue "Starting with Cloudflare tunnel..."
        docker-compose --profile tunnel up -d
        Write-ColorOutput $Green "[✓] Services started with tunnel"
    }

    "help" {
        Write-ColorOutput $Blue "Usage: .\start.ps1 -Command <COMMAND>"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  up                Start all services (default)"
        Write-Host "  down              Stop all services"
        Write-Host "  logs              View service logs"
        Write-Host "  rebuild           Rebuild and start all services"
        Write-Host "  rebuild-backend   Rebuild and start backend only"
        Write-Host "  rebuild-frontend  Rebuild and start frontend only"
        Write-Host "  status            Show service status"
        Write-Host "  clean             Remove all containers and volumes"
        Write-Host "  tunnel            Start with Cloudflare tunnel"
        Write-Host "  help              Show this help message"
    }

    default {
        Write-ColorOutput $Red "Unknown command: $Command"
        Write-Host "Run '.\start.ps1 -Command help' for available commands"
        exit 1
    }
}
