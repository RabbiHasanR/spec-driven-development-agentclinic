# syntax=docker/dockerfile:1

# AgentClinic production image: Next.js standalone server + SQLite on a volume.
# Build: docker build -t agentclinic .
# Run:   see docker-compose.yml (STAFF_PASSWORD and SESSION_SECRET required).

ARG NODE_IMAGE=node:24-bookworm-slim

# --- deps: install exact dependencies ----------------------------------------
FROM ${NODE_IMAGE} AS deps
# better-sqlite3 ships prebuilt binaries for x64 only; on arm64 npm compiles
# it, which needs these. This stage is thrown away, so they don't ship.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# --- build: standalone server and bundled DB scripts ---------------------------
FROM deps AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1 STANDALONE_BUILD=1
RUN npm run build && npm run build:scripts \
  # Defence in depth: .dockerignore keeps .env out, but never ship one.
  && rm -f .next/standalone/.env*

# --- runtime: only what the server needs ---------------------------------------
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=/app/data/agentclinic.db
WORKDIR /app

# App files stay root-owned (read-only to the app user); only data/ is writable.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/build/scripts ./scripts
COPY scripts/docker-entrypoint.sh /usr/local/bin/agentclinic-entrypoint
RUN mkdir -p /app/data && chown node:node /app/data

USER node
VOLUME ["/app/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]

ENTRYPOINT ["agentclinic-entrypoint"]
CMD ["node", "server.js"]
