# syntax=docker/dockerfile:1

# Build context is the repository ROOT (see deploy/docker-compose.yml), because the
# backend depends on the `@tablora/shared` workspace package at build and run time.

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Manifests first so the (slow) dependency layer is cached across source changes.
# `packages/shared` is copied in full because its `prepare` script compiles it to
# dist/ during `npm ci`.
COPY package.json package-lock.json ./
COPY packages/shared packages/shared
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci

COPY backend backend
RUN npm run build:shared && npm run build -w tablora-backend

# ---------- runtime ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies only, and only for the packages the backend needs.
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY backend/package.json backend/
COPY frontend/package.json frontend/

# @tablora/shared declares a `prepare` script (tsc), and npm runs workspace `prepare`
# scripts during `npm ci` even with --ignore-scripts. typescript is a devDependency and
# is omitted here, so the script would fail; its compiled dist/ is copied from the build
# stage instead. Dropping the script keeps the lockfile valid (npm checks dependencies,
# not scripts).
RUN node -e "const fs=require('fs'),f='packages/shared/package.json',p=JSON.parse(fs.readFileSync(f,'utf8'));delete p.scripts.prepare;fs.writeFileSync(f,JSON.stringify(p,null,2)+'\n')"

RUN npm ci --omit=dev --ignore-scripts \
      --workspace tablora-backend \
      --workspace @tablora/shared \
      --include-workspace-root \
 && npm cache clean --force

COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/backend/dist backend/dist

USER node
EXPOSE 4000
CMD ["node", "backend/dist/server.js"]
