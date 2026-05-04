FROM node:lts AS builder
WORKDIR /app

ARG VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
ARG VITE_CHAIN_ID=11155111
ARG VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
ARG VITE_BACKEND_URL=

ENV VITE_CONTRACT_ADDRESS=${VITE_CONTRACT_ADDRESS}
ENV VITE_CHAIN_ID=${VITE_CHAIN_ID}
ENV VITE_SEPOLIA_RPC_URL=${VITE_SEPOLIA_RPC_URL}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Install deps standalone (not via the root npm workspace) so npm resolves
# platform-native bindings for Linux rather than reusing the Windows lockfile
COPY frontend/package.json ./
RUN npm install

# Copy the rest of the frontend source and build
COPY frontend .
RUN npm run build

FROM nginx:alpine AS runner

# Shared proxy headers included by each location block in nginx.conf
COPY frontend/proxy_params.conf /etc/nginx/proxy_params.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
