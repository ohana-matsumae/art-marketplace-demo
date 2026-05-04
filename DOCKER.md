# Docker Deployment Guide

This project is fully containerized and can be run with a single command.

## Prerequisites

- Docker and Docker Compose installed ([Get Docker](https://docs.docker.com/get-docker/))
- Environment variables configured (see below)

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:
- `VITE_CONTRACT_ADDRESS`: Your deployed smart contract address
- `VITE_SEPOLIA_RPC_URL`: Your Infura/Alchemy RPC endpoint
- `SESSION_SECRET`: A strong random secret for session management
- `CLOUDFLARED_TUNNEL_TOKEN`: (Optional) For Cloudflare tunnel access

### 2. Run the Complete Stack

Start all services with a single command:

```bash
docker-compose up -d
```

This will:
- Build and start the backend (Node.js/Express on port 3001)
- Build and start the frontend (Nginx on port 5173)
- Automatically handle port mappings and networking
- Persist uploaded files in a Docker volume

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health (if available)

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services

```bash
docker-compose down
```

### Stop Services and Remove Volumes

```bash
docker-compose down -v
```

### Rebuild Images (after code changes)

```bash
docker-compose up -d --build
```

### Rebuild Specific Service

```bash
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### View Running Containers

```bash
docker-compose ps
```

## Using Cloudflare Tunnel (Optional)

To expose your application via Cloudflare:

1. Set `CLOUDFLARED_TUNNEL_TOKEN` in `.env`
2. Run with the tunnel profile:

```bash
docker-compose --profile tunnel up -d
```

This adds the `cloudflared` service that tunnels your app through Cloudflare.

## Troubleshooting

### Port Already in Use

If ports 5173 or 3001 are already in use, you can change them in `docker-compose.yml`:

```yaml
ports:
  - "8000:3001"  # maps Docker 3001 to host 8000
  - "5000:8080"  # maps Docker 8080 to host 5000
```

### Build Failures

Clear the Docker build cache and rebuild:

```bash
docker-compose down
docker system prune -a --volumes
docker-compose up -d --build
```

### Frontend Can't Connect to Backend

The frontend container connects to backend via the service name `backend:3001`.
Ensure `VITE_BACKEND_URL=http://backend:3001` in your `.env` file.

### Uploaded Files Not Persisting

Check that the volume is mounted:

```bash
docker inspect artmarket-backend | grep Mounts
```

### Environment Variables Not Applied

Rebuild the frontend image to apply new build args:

```bash
docker-compose up -d --build frontend
```

## Performance Tips

- Use `.dockerignore` files to exclude unnecessary files from builds
- Consider using `docker-compose -f docker-compose.yml config` to validate the compose file
- Monitor resource usage: `docker stats`

## Development vs Production

Currently configured for production. For development:

1. Install dependencies locally:
   ```bash
   npm install
   pnpm install
   ```

2. Run services individually:
   ```bash
   npm run backend:dev  # Terminal 1
   npm run frontend:dev # Terminal 2
   ```

Or use `docker-compose.override.yml` to override settings for development.

## Network Architecture

```
┌─────────────────────────────────────┐
│      Docker Bridge Network          │
│    (art-marketplace)                │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────┐               │
│  │   Frontend       │               │
│  │   (nginx:8080)   │◄──────┐       │
│  │   port 5173      │       │       │
│  └────────┬─────────┘       │       │
│           │                 │       │
│           │ http://backend  │       │
│           │      :3001      │       │
│           │                 │       │
│  ┌────────▼─────────┐       │       │
│  │    Backend       │       │       │
│  │  (Node.js)       │       │       │
│  │   port 3001      │───────┘       │
│  └──────────────────┘               │
│                                     │
│  (Optional)                         │
│  ┌──────────────────┐               │
│  │  Cloudflared     │               │
│  │  (Tunnel)        │               │
│  └──────────────────┘               │
│                                     │
└─────────────────────────────────────┘
```

## File Structure

```
.
├── docker-compose.yml          # Main compose file
├── .env.example                # Environment template
├── backend/
│   ├── Dockerfile              # Backend container
│   └── .dockerignore           # Files to exclude from build
├── frontend/
│   ├── Dockerfile              # Frontend container
│   ├── nginx.conf              # Nginx configuration
│   └── .dockerignore           # Files to exclude from build
└── .dockerignore               # Root-level exclusions
```

## Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Verify `.env` configuration
3. Ensure Docker daemon is running
4. Check Docker and Docker Compose versions
