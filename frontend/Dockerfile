FROM node:lts-alpine AS builder
WORKDIR /app

ARG VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
ARG VITE_CHAIN_ID=11155111
ARG VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
ARG VITE_BACKEND_URL=http://backend:3001

ENV VITE_CONTRACT_ADDRESS=${VITE_CONTRACT_ADDRESS}
ENV VITE_CHAIN_ID=${VITE_CHAIN_ID}
ENV VITE_SEPOLIA_RPC_URL=${VITE_SEPOLIA_RPC_URL}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

RUN corepack enable

# Copy root-level package files for monorepo
COPY package.json pnpm-workspace.yaml ./

# Copy frontend workspace
COPY frontend ./frontend

# Install dependencies
RUN pnpm install --frozen-lockfile --filter ./frontend... --prod=false

# Build the frontend
RUN pnpm --dir frontend run build

FROM nginx:alpine AS runner

# Create nginx config if it doesn't exist
RUN mkdir -p /etc/nginx/conf.d

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf || true

# Copy built frontend assets
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
