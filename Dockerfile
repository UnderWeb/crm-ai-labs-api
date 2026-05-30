# ==============================================================================
# STAGE 1: BASE
# ==============================================================================
FROM node:24-bookworm-slim AS base

ENV NODE_ENV=production \
    TZ=America/Santiago \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

WORKDIR /usr/src/app

# ==============================================================================
# STAGE 2: SYSTEM
# ==============================================================================
FROM base AS system

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      tini \
      openssl \
      ca-certificates \
      curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ==============================================================================
# STAGE 3: DEPENDENCIES
# ==============================================================================
FROM system AS deps

COPY package.json package-lock.json ./

RUN npm ci

# ==============================================================================
# STAGE 4: BUILDER
# ==============================================================================
FROM deps AS builder

COPY . .

ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public

RUN npx prisma generate && \
    npm run build

# ==============================================================================
# STAGE 5: PRODUCTION DEPENDENCIES
# ==============================================================================
FROM system AS prod-deps

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

# ==============================================================================
# STAGE 6: DEVELOPMENT
# ==============================================================================
FROM deps AS development

ENV NODE_ENV=development \
    CHOKIDAR_USEPOLLING=true \
    WATCHPACK_POLLING=true \
    DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public

COPY . .

RUN npx prisma generate

EXPOSE 4000

ENTRYPOINT ["tini", "--"]

CMD ["npm", "run", "start:dev"]

# ==============================================================================
# STAGE 7: PRODUCTION
# ==============================================================================
FROM system AS production

ARG VERSION=1.0.0
ARG GIT_COMMIT=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.title="CRM IA API" \
      org.opencontainers.image.description="Backend API para CRM comercial con asistente de IA" \
      org.opencontainers.image.vendor="APIUX LABS" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.created="${BUILD_DATE}"

RUN groupadd --system --gid 1000 appgroup && \
    useradd \
      --system \
      --uid 1000 \
      --gid appgroup \
      --shell /usr/sbin/nologin \
      --create-home \
      appuser

WORKDIR /usr/src/app

COPY --chown=appuser:appgroup --from=prod-deps /usr/src/app/node_modules ./node_modules

COPY --chown=appuser:appgroup --from=builder /usr/src/app/dist ./dist
COPY --chown=appuser:appgroup --from=builder /usr/src/app/prisma ./prisma
COPY --chown=appuser:appgroup --from=builder /usr/src/app/src/generated ./src/generated
COPY --chown=appuser:appgroup --from=builder /usr/src/app/package.json ./package.json
COPY --chown=appuser:appgroup --from=builder /usr/src/app/prisma.config.ts ./prisma.config.ts

ENV NODE_ENV=production \
    APP_PORT=4000 \
    LOG_LEVEL=info \
    NODE_OPTIONS="--enable-source-maps --max-old-space-size=512" \
    PRISMA_DISABLE_QUERY_ENGINE_DOUBLE_WRITES=1

USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s \
            --timeout=5s \
            --start-period=20s \
            --retries=3 \
    CMD curl --fail http://localhost:4000/health || exit 1

STOPSIGNAL SIGTERM

COPY --chown=appuser:appgroup docker/startup.sh ./startup.sh

RUN chmod +x ./startup.sh

ENTRYPOINT ["tini", "--"]

CMD ["./startup.sh"]
