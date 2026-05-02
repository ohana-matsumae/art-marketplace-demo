FROM node:22-alpine AS base
WORKDIR /app
# sharp requires the vips C library on Alpine
RUN apk add --no-cache vips-dev fftw-dev build-base python3

# ── Install deps ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json ./
RUN npm install

# ── Build TypeScript ──────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Production image ──────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production

COPY package.json ./
# Re-install production deps so native modules (sharp) are compiled for the
# final image's platform rather than the builder's.
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# uploads/ is mounted as a Docker volume — persists between container restarts.
VOLUME ["/app/uploads"]
ENV UPLOADS_DIR=/app/uploads

EXPOSE 3001
CMD ["node", "dist/index.js"]
