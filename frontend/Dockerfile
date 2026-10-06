# syntax=docker/dockerfile:1

# Build context is the repository ROOT (see deploy/docker-compose.yml), because the
# frontend depends on the `@tablora/shared` workspace package.
#
# IMPORTANT: NEXT_PUBLIC_API_URL is baked into the client JavaScript at build time,
# not read at runtime. It must be the public URL users' phones will call, e.g.
# https://tablora.ru. The build fails if it is missing so that a broken bundle
# (silently pointing at http://localhost:4000) can never reach production.

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
RUN test -n "$NEXT_PUBLIC_API_URL" || { \
      echo "ERROR: the NEXT_PUBLIC_API_URL build arg is required (e.g. https://tablora.ru)." >&2; \
      echo "It is compiled into the browser bundle; an empty value silently falls back to http://localhost:4000." >&2; \
      exit 1; \
    }
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Manifests first so the (slow) dependency layer is cached across source changes.
# `packages/shared` is copied in full because its `prepare` script compiles it to
# dist/ during `npm ci`.
COPY package.json package-lock.json ./
COPY packages/shared packages/shared
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci

COPY frontend frontend
RUN npm run build:shared && npm run build -w tablora-frontend

# ---------- runtime ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Next's standalone server binds to $HOSTNAME, which Docker otherwise sets to the
# container id — so pin it to 0.0.0.0 here.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app

# The standalone bundle mirrors the monorepo layout: frontend/server.js plus the
# traced node_modules it actually needs. Static assets are not traced, so they are
# copied separately.
COPY --from=build /app/frontend/.next/standalone ./
COPY --from=build /app/frontend/.next/static frontend/.next/static

USER node
EXPOSE 3000
CMD ["node", "frontend/server.js"]
