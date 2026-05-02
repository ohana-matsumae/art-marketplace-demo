FROM node:lts-alpine AS builder
WORKDIR /app

ARG VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
ARG VITE_CHAIN_ID=11155111
ARG VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key

ENV VITE_CONTRACT_ADDRESS=${VITE_CONTRACT_ADDRESS}
ENV VITE_CHAIN_ID=${VITE_CHAIN_ID}
ENV VITE_SEPOLIA_RPC_URL=${VITE_SEPOLIA_RPC_URL}

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY frontend ./frontend

RUN pnpm install --frozen-lockfile --filter ./frontend... --prod=false

RUN pnpm --dir frontend run build

FROM nginx:latest AS runner

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
