# Tablora (Таблора) — Agent Instructions

## Project Overview

Tablora (Таблора) is a real-time competition results table web application.

**Use case:** An organizer creates a results table on a laptop. After creation, two QR codes are generated:
- **Judge QR** → `/t/:id/edit` — judges scan this to enter and update results from their phones
- **Spectator QR** → `/t/:id` — displayed on a screen for the audience; updates in real time via SSE without page reload

**Key constraint:** No authentication. Anyone with the link can edit the table. Authorization and authentication will be added later.

**UI language:** All user-facing copy is Russian (labels, placeholders, buttons, metadata).

## Repository Structure

```
/
├── backend/            # Fastify 5 REST API + SSE (Drizzle ORM + PostgreSQL)
├── frontend/           # Next.js (App Router) + TypeScript + Tailwind + Feature-Sliced Design
└── packages/shared/    # @tablora/shared — wire contract shared by backend and frontend
```

npm workspaces (root `package.json`). npm package names stay `tablora-backend` / `tablora-frontend` — in scripts `-w` refers to the package name, not the directory path.

## Shared contract (`@tablora/shared`)

`packages/shared` is the single source of truth for the wire contract between backend and frontend. It currently exports:

- `COLUMN_TYPES` / `ColumnType` — supported column types (`"number" | "text" | "time"`).
- `SSE_EVENTS` / `SSEEventName` — Server-Sent Event names.

Rules:

- Never redefine these literals in `backend`/`frontend` — import them from `@tablora/shared`.
- The package compiles to `dist/` on `npm install` (via the `prepare` script). After editing its sources, rebuild: `npm run build:shared` (or watch with `npm run dev:shared`).
- It is a real runtime dependency of the backend (ESM, `module: NodeNext`), so it must be built before running or compiling the backend.

## Backend

- Stack: Fastify 5, Drizzle ORM, `postgres` (postgres.js) driver, nanoid. ESM (`"type": "module"`).
- Real-time via Server-Sent Events at `GET /api/tables/:id/events`.
- Scripts: `npm run dev` (tsx watch), `npm run db:generate|db:push|db:migrate` (drizzle-kit), `npm test`.

## Frontend

- Stack: Next.js App Router, TypeScript (strict), Tailwind CSS, `class-variance-authority` + `tailwind-merge`.
- `app/` is thin — routes delegate to page components in `src/_pages`.

### Structure (Feature-Sliced Design)

```
src/
├── _app/       # providers, global styles
├── _pages/     # page composition: home, create-table, table-spectator, table-judge, table-share
├── features/   # reusable user interactions (add-column, edit-column)
├── entities/   # domain entities (table)
└── shared/     # ui, api, config, lib
```

Imports flow downward only: `_pages → features → entities → shared`.

Features are effect-injected: a feature owns the interaction (open/dialog/submitting/error) and receives the effect via an `onSubmit` prop, so the same slice is reused by pages with different behaviours (e.g. API-backed in table-judge, local form state in create-table).

### Path aliases (`tsconfig.json`)

`@/*` → `src/*`, plus explicit aliases: `@/_app`, `@/_pages`, `@/features`, `@/entities`, `@/shared`.

### Design system

- UI kit in `src/shared/ui/*` (Button, Input, Card, Badge, Dialog, Select, QRCode, Header, Footer).
- Tokens live in two places: shadcn HSL variables in `src/_app/styles/globals.css`, and Material-style colors in `tailwind.config.ts` (`surface`, `on-surface`, `primary-fixed`, `outline-variant`, …).

### Component styling convention

Style `shared/ui` components through their `variant` and `size` props, not `className`:

- `<Button>`: `variant` for color, `size` for height. `className` may only carry **width** utilities (e.g. `w-full`, `w-1/2`).

### Real-time data flow

`entities/table/model/use-live-table.ts` fetches the table and subscribes to SSE with auto-reconnect; `shared/api` exposes the typed REST client (`fetchTable`, `createTable`, `submitScores`, `addParticipant`, `addColumn`).

## Local Development

All commands run from the repository root. `-w` refers to the npm package name (`tablora-backend` / `tablora-frontend`), not the directory.

- Install (once): `npm install` — links workspaces and builds `@tablora/shared`.
- Database: `docker compose up -d postgres` (Postgres on 5432; the backend creates tables on startup, so migrations are optional).
- Backend: `npm run dev -w tablora-backend` (tsx watch, http://localhost:4000).
- Frontend: `npm run dev -w tablora-frontend` (Next, http://localhost:3000).
- Only when editing `packages/shared`: `npm run dev:shared`.
- Backend tests: `npm test -w tablora-backend`.
- Build everything: `npm run build`.

The frontend defaults to `NEXT_PUBLIC_API_URL=http://localhost:4000`, matching the backend port.
