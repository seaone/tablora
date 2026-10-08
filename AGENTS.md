# Tablora (Таблора) — Agent Instructions

> **This repository is public.** Operational details — hostnames, IP addresses, ports,
> container IDs, deployment runbooks — do not belong in it; they live outside the repo.
> The files under `deploy/` are generic templates and must stay generic.

## Project Overview

Tablora (Таблора) is a real-time competition results table web application.

**Use case:** An organizer creates a results table on a laptop. After creation, two QR codes are generated:
- **Judge QR** → `/t/:id/edit` — judges scan this to enter and update results from their phones
- **Spectator QR** → `/t/:id` — displayed on a screen for the audience; updates in real time via SSE without page reload

**Access model:** Organizers and judges sign in with Yandex ID. The organizer owns the table and invites judges by email; judges can then edit it. Spectator viewing stays anonymous. See the Authentication notes under Backend.

**UI language:** All user-facing copy is Russian (labels, placeholders, buttons, metadata).

## Repository Structure

```
/
├── .github/workflows/  # CI: tests, then container images published to GHCR
├── backend/            # Fastify 5 REST API + SSE (Drizzle ORM + PostgreSQL)
├── frontend/           # Next.js (App Router) + TypeScript + Tailwind + Feature-Sliced Design
├── packages/shared/    # @tablora/shared — wire contract shared by backend and frontend
└── deploy/             # Production Docker Compose stack (see deploy/.env.example)
```

npm workspaces (root `package.json`). npm package names stay `tablora-backend` / `tablora-frontend` — in scripts `-w` refers to the package name, not the directory path.

## Shared contract (`@tablora/shared`)

`packages/shared` is the single source of truth for the wire contract between backend and frontend. It currently exports:

- `COLUMN_TYPES` / `ColumnType` — supported column types (`"number" | "text" | "time"`).
- `SSE_EVENTS` / `SSEEventName` — Server-Sent Event names.
- `AuthUser` — the signed-in user shape returned by the API.
- `TABLE_ACCESS_ROLES` / `TableAccessRole` — a caller's relationship to a table (`"owner" | "judge" | "viewer"`).

Rules:

- Never redefine these literals in `backend`/`frontend` — import them from `@tablora/shared`.
- The package compiles to `dist/` on `npm install` (via the `prepare` script). After editing its sources, rebuild: `npm run build:shared` (or watch with `npm run dev:shared`).
- It is a real runtime dependency of the backend (ESM, `module: NodeNext`), so it must be built before running or compiling the backend.

## Backend

- Stack: Fastify 5, Drizzle ORM, `postgres` (postgres.js) driver, nanoid. ESM (`"type": "module"`).
- Authentication: Yandex ID via `@fastify/oauth2`, with a `@fastify/jwt` session cookie. Auth routes live under `/api/auth` (`/yandex`, `/yandex/callback`, `/me`, `/logout`). Table mutations require the table owner or an authorized judge; reads and the SSE stream stay public (see the `authentication` and `judge-authorization` specs).
- Config: `FRONTEND_URL`, `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`, `YANDEX_REDIRECT_URI`, `AUTH_JWT_SECRET` (see `backend/.env.example`).
- Real-time via Server-Sent Events at `GET /api/tables/:id/events`.
- Scripts: `npm run dev` (tsx watch), `npm run db:generate|db:push|db:migrate` (drizzle-kit), `npm test`.
- Schema bootstrap lives in `src/db/ensureTablesExist()`. postgres.js sends every tagged query as a single prepared statement, so **never put two SQL commands in one `sql` template literal** — Postgres rejects it with `cannot insert multiple commands into a prepared statement`, and the caller only logs a warning, so a partial schema fails silently at runtime. Each statement needs its own `sql` call.

## Frontend

- Stack: Next.js App Router, TypeScript (strict), Tailwind CSS, `class-variance-authority` + `tailwind-merge`.
- `app/` is thin — routes delegate to page components in `src/_pages`.

### Structure (Feature-Sliced Design)

```
src/
├── _app/       # providers (incl. auth), global styles
├── _pages/     # page composition: home, create-table, judge-table, my-tables, share-table, table-spectator
├── features/   # reusable user interactions (account, add/edit/delete column, add/edit/delete participant, delete-table)
├── entities/   # domain entities (table, user)
└── shared/     # ui, api, config, lib
```

Imports flow downward only: `_pages → features → entities → shared`.

Features are effect-injected: a feature owns the interaction (open/dialog/submitting/error) and receives the effect via an `onSubmit` prop, so the same slice is reused by pages with different behaviours (e.g. API-backed in judge-table, local form state in create-table).

### Path aliases (`tsconfig.json`)

`@/*` → `src/*`, plus explicit aliases: `@/_app`, `@/_pages`, `@/features`, `@/entities`, `@/shared`.

### Design system

- UI kit in `src/shared/ui/*` (Button, Input, Card, Item, Badge, Dialog, DropdownMenu, ConfirmDialog, Select, QRCode, Header, Footer).
- Tokens live in two places: shadcn HSL variables in `src/_app/styles/globals.css`, and Material-style colors in `tailwind.config.ts` (`surface`, `on-surface`, `primary-fixed`, `outline-variant`, …).

### Component styling convention

Style `shared/ui` components through their `variant` and `size` props, not `className`:

- `<Button>`: `variant` for color, `size` for height. `className` may only carry **width** utilities (e.g. `w-full`, `w-1/2`).

### Real-time data flow

`entities/table/model/use-live-table.ts` fetches the table and subscribes to SSE with auto-reconnect; the SSE stream is opened with `withCredentials` so the session cookie is shared. `shared/api` exposes the typed REST client (`fetchTable`, `createTable`, `submitScores`, `addParticipant`, `addColumn`) plus the auth calls (`fetchCurrentUser`, the sign-in URL, `signOut`).

## Local Development

All commands run from the repository root. `-w` refers to the npm package name (`tablora-backend` / `tablora-frontend`), not the directory.

- Install (once): `npm install` — links workspaces and builds `@tablora/shared`.
- Database: `docker compose up -d postgres` (Postgres on 5432; the backend creates tables on startup, so migrations are optional).
- Backend: `npm run dev -w tablora-backend` (tsx watch, http://localhost:4000).
- Frontend: `npm run dev -w tablora-frontend` (Next, http://localhost:3000).
- Only when editing `packages/shared`: `npm run dev:shared`.
- Backend tests: `npm test -w tablora-backend` — requires the Postgres container above (a `pretest` step creates the schema; CI provides its own Postgres service).
- Build everything: `npm run build`.

The frontend defaults to `NEXT_PUBLIC_API_URL=http://localhost:4000`, matching the backend port.

For sign-in to work locally, copy `backend/.env.example` to `backend/.env` and fill in the Yandex app credentials plus `AUTH_JWT_SECRET`. The local redirect URI is `http://localhost:4000/api/auth/yandex/callback` and must match the Yandex app registration.

## Production build

CI (`.github/workflows/ci.yml`) runs the backend tests on every push and pull request. On a push to `main` it also builds both images and publishes them to GHCR under the repository owner:

- `ghcr.io/seaone/tablora-backend:latest` and `:sha-<commit>`
- `ghcr.io/seaone/tablora-frontend:latest` and `:sha-<commit>`

The `sha-` tags are immutable and exist so a deployment can be rolled back.

Both Dockerfiles use the **repository root** as the build context — not `backend/` or `frontend/` — because they need the `@tablora/shared` workspace.

Deployment is **not** automated, and its runbook lives outside this repository. On the deployment host, point `deploy/.env` at the published images (see `deploy/.env.example`) and restart the stack:

```sh
docker compose -f deploy/docker-compose.yml pull
docker compose -f deploy/docker-compose.yml up -d --no-build
```

To build and run the whole stack from source instead:

```sh
docker compose -f deploy/docker-compose.yml up -d --build
```

Things that will bite you:

- `NEXT_PUBLIC_API_URL` is baked into the browser bundle at **build** time, not read at runtime, and the build fails if it is empty. In CI it comes from the repository variable `PUBLIC_URL`; a from-source build takes it from `deploy/.env`. Changing it requires a rebuild — restarting a container is not enough.
- `frontend/next.config.ts` sets `output: "standalone"`, which `frontend/Dockerfile` relies on; don't remove it without adjusting the image.
- `deploy/.env` is gitignored — start from `deploy/.env.example`. `TABLORA_IMAGE_PREFIX` there must match the namespace CI publishes to (`ghcr.io/seaone`); `TABLORA_IMAGE_TAG` selects which build to run.
