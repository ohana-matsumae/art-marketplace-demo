# Docker Setup - Changes Summary

## Overview
The Art Marketplace project has been fully containerized and optimized to run with a single command:

```bash
docker-compose up -d
```

Or using the convenience scripts:
- **Linux/Mac**: `./start.sh`
- **Windows PowerShell**: `.\start.ps1`

## Changes Made

### 1. **docker-compose.yml** - Updated
- ✅ Added proper port mappings (now accessible on localhost):
  - Frontend: `localhost:5173` → container:8080
  - Backend: `localhost:3001` → container:3001
- ✅ Changed from `expose` to `ports` for external accessibility
- ✅ Added health checks for the backend service
- ✅ Added proper Docker bridge network (`art-marketplace`)
- ✅ Fixed service dependencies with proper conditions
- ✅ Added default values for all environment variables
- ✅ Added optional Cloudflare tunnel service with `--profile tunnel`
- ✅ Fixed container naming (e.g., `tippost-cloudflared` → `artmarket-cloudflared`)
- ✅ Improved service communication (backend accessible at `http://backend:3001` internally)

### 2. **frontend/Dockerfile** - Updated
- ✅ Fixed monorepo structure handling (now copies `pnpm-workspace.yaml` and root `package.json`)
- ✅ Added missing `VITE_BACKEND_URL` build argument to pass during build time
- ✅ Updated to use `nginx:alpine` (smaller image)
- ✅ Added fallback for nginx.conf (won't fail if missing)
- ✅ Fixed build process to properly filter dependencies for frontend workspace

### 3. **frontend/nginx.conf** - New File
- ✅ Proper reverse proxy configuration for backend API
- ✅ SPA routing support (all non-file requests → index.html)
- ✅ Proxy endpoints for:
  - `/api/*` → backend API routes
  - `/session` → session endpoints
  - `/rpc` → blockchain RPC endpoints
- ✅ Static asset caching (1 year for versioned assets)
- ✅ Gzip compression enabled
- ✅ Proper CORS headers passed through

### 4. **backend/Dockerfile** - Already Optimized
- ✅ Multi-stage build (deps → builder → runner)
- ✅ Production-only dependencies in final image
- ✅ Proper volume mounting for uploads persistence
- ✅ Uses alpine image for smaller footprint

### 5. **.dockerignore Files** - New/Updated
- ✅ Root `.dockerignore` - Excludes unnecessary files from all builds
- ✅ `backend/.dockerignore` - Optimized for backend builds
- ✅ `frontend/.dockerignore` - Optimized for frontend builds
- **Benefits**: Faster builds, smaller Docker context, improved caching

### 6. **.env.example** - New File
- ✅ Complete environment variable template
- ✅ Documented all required and optional variables
- ✅ Safe defaults provided
- ✅ Instructions for obtaining missing values (RPC URLs, etc.)

### 7. **DOCKER.md** - New Comprehensive Guide
- ✅ Quick start instructions
- ✅ Common commands reference
- ✅ Troubleshooting section
- ✅ Network architecture diagram
- ✅ File structure overview
- ✅ Environment variable documentation

### 8. **start.sh** - New Bash Convenience Script
- ✅ Single-command startup for Linux/Mac
- ✅ Automatic .env creation if missing
- ✅ Docker daemon check
- ✅ Available commands:
  - `up` - Start all services
  - `down` - Stop all services
  - `logs` - View real-time logs
  - `rebuild` - Rebuild all services
  - `rebuild-backend` - Rebuild just backend
  - `rebuild-frontend` - Rebuild just frontend
  - `status` - Show container status
  - `clean` - Full cleanup
  - `tunnel` - Start with Cloudflare tunnel
  - `help` - Command reference

### 9. **start.ps1** - New PowerShell Convenience Script
- ✅ Single-command startup for Windows
- ✅ Identical commands to bash version
- ✅ Color-coded output
- ✅ Windows-native PowerShell implementation

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Docker Bridge Network                   │
│      (art-marketplace network)                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Frontend Container (Nginx)              │   │
│  │  - Port: 8080 (internal)                 │   │
│  │  - Maps to: localhost:5173               │   │
│  │  - Proxies /api → backend:3001           │   │
│  └─────────────────────────────────────────┘   │
│           │                                     │
│           │ http://backend:3001                │
│           ▼                                     │
│  ┌─────────────────────────────────────────┐   │
│  │  Backend Container (Node.js)             │   │
│  │  - Port: 3001 (internal)                 │   │
│  │  - Maps to: localhost:3001               │   │
│  │  - Mounts: /app/uploads (volume)         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  (Optional)                                     │
│  ┌─────────────────────────────────────────┐   │
│  │  Cloudflare Tunnel (cloudflared)         │   │
│  │  - Profile: tunnel                       │   │
│  │  - Tunnels frontend through Cloudflare   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Key Improvements

### Before
- Only exposed ports via `expose` (internal only)
- Frontend couldn't be accessed from host machine
- No health checks
- Monorepo structure not properly handled in frontend build
- No nginx configuration
- Manual environment variable setup required
- No startup automation

### After
- ✅ All services accessible from host
- ✅ Automatic healthchecks for reliability
- ✅ Proper monorepo support in Docker builds
- ✅ Complete nginx reverse proxy setup
- ✅ Environment variable templates with defaults
- ✅ One-command startup with error handling
- ✅ Service dependencies properly configured
- ✅ Optimized builds with .dockerignore
- ✅ Internal service networking via Docker DNS

## Quick Start

### Minimal (3 steps)
```bash
# 1. Copy example environment
cp .env.example .env

# 2. Edit .env with your values (contract address, RPC URL, etc.)
# (or skip for defaults)

# 3. Start everything
docker-compose up -d
```

### Convenience Scripts
```bash
# Linux/Mac
./start.sh up

# Windows PowerShell
.\start.ps1 -Command up
```

## Environment Variables

All variables are defined in `.env.example`. Key ones:
- `VITE_CONTRACT_ADDRESS` - Your deployed smart contract
- `VITE_SEPOLIA_RPC_URL` - RPC endpoint (Infura/Alchemy)
- `SESSION_SECRET` - Random secret for sessions
- `CLOUDFLARED_TUNNEL_TOKEN` - For Cloudflare tunnel (optional)

## Network Access

Once running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Backend Health**: http://localhost:3001/health
- **Uploads**: /uploads volume (persists between restarts)

## File Changes Summary

| File | Status | Purpose |
|------|--------|---------|
| docker-compose.yml | Updated | Main orchestration config |
| frontend/Dockerfile | Updated | Frontend container build |
| backend/Dockerfile | ✅ No change | Already optimized |
| frontend/nginx.conf | New | Reverse proxy & routing |
| .dockerignore | New | Build optimization |
| backend/.dockerignore | Updated | Build optimization |
| frontend/.dockerignore | New | Build optimization |
| .env.example | New | Environment template |
| DOCKER.md | New | Complete documentation |
| start.sh | New | Linux/Mac startup script |
| start.ps1 | New | Windows startup script |

## Testing the Setup

```bash
# Start
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Test endpoints
curl http://localhost:3001/health
curl http://localhost:5173

# Stop
docker-compose down
```

## Common Issues & Solutions

### Services won't start
- Ensure ports 3001 and 5173 are available: `netstat -an`
- Check logs: `docker-compose logs`
- Rebuild with: `docker-compose up -d --build`

### Frontend can't reach backend
- Check VITE_BACKEND_URL in .env: should be `http://localhost:3001`
- Or in docker-compose internally: `http://backend:3001`
- Frontend nginx config handles the routing

### Uploads not persisting
- Volume must be mounted: check `docker inspect artmarket-backend | grep -A 10 Mounts`
- Verify `uploads_data` volume exists: `docker volume ls`

### Build failures
- Clear cache: `docker system prune -a --volumes`
- Check .dockerignore files aren't excluding needed files
- Verify pnpm-lock.yaml and package.json exist

## Next Steps

1. Configure `.env` with your contract and RPC details
2. Run `docker-compose up -d` (or use start script)
3. Access http://localhost:5173
4. Monitor logs with `docker-compose logs -f`
5. Stop with `docker-compose down`

See [DOCKER.md](DOCKER.md) for detailed instructions and troubleshooting.
