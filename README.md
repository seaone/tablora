# Таблора (Tablora)

Приложение для ведения результатов соревнований в реальном времени.

**Язык:** Русский · [English](#tablora)

## Как это работает

Организатор входит через Яндекс ID и создаёт таблицу результатов на ноутбуке. После создания генерируются два QR-кода:

- **QR для судей** → `/t/:id/edit` — судьи сканируют его и вводят/обновляют результаты с телефонов. Редактировать таблицу могут только её владелец и судьи, которых он пригласил по email; остальным показывается отказ в доступе.
- **QR для зрителей** → `/t/:id` — открывается на экране для аудитории и обновляется в реальном времени через SSE, без перезагрузки страницы. Просмотр анонимный.

Вход выполняется через Яндекс ID, отдельного пароля нет. В разделе «Мои таблицы» (`/my`) владелец и судьи находят таблицы, к которым у них есть доступ; удалять таблицу может только владелец.

Интерфейс полностью на русском языке.

## Стек

| Часть | Технологии |
|---|---|
| `backend/` | Fastify 5, Drizzle ORM, PostgreSQL (драйвер `postgres.js`), nanoid, Server-Sent Events, Яндекс ID (OAuth 2.0), JWT-сессии |
| `frontend/` | Next.js (App Router), TypeScript (strict), Tailwind CSS, shadcn/ui, Feature-Sliced Design |
| `packages/shared/` | `@tablora/shared` — общий wire-контракт (типы колонок, имена SSE-событий, роли доступа, данные пользователя) |

Репозиторий — монорепозиторий на **npm workspaces** (три пакета; корневой `package.json`).

## Структура репозитория

```text
.
├── backend/            # Fastify 5 REST API + SSE (Drizzle ORM + PostgreSQL)
├── frontend/           # Next.js (App Router) + TypeScript + Tailwind + Feature-Sliced Design
├── packages/shared/    # @tablora/shared — wire-контракт, общий для backend и frontend
├── openspec/           # Артефакты spec-driven разработки
├── docker-compose.yml  # Локальный PostgreSQL
├── deploy/             # Прод-стек Docker Compose (см. deploy/.env.example)
└── AGENTS.md           # Инструкции для агентов
```

## Локальный запуск

Требуются Node.js 22+ и Docker. Все команды выполняются из корня репозитория.

```sh
npm install                        # один раз: линкует workspaces и собирает @tablora/shared
docker compose up -d postgres      # PostgreSQL на порту 5432
npm run dev -w tablora-backend     # API + SSE на http://localhost:4000
npm run dev -w tablora-frontend    # UI на http://localhost:3000
```

Откройте http://localhost:3000. Фронтенд по умолчанию обращается к API по `NEXT_PUBLIC_API_URL=http://localhost:4000`.

Для входа через Яндекс ID скопируйте `backend/.env.example` в `backend/.env` и заполните `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET` и `AUTH_JWT_SECRET`. Redirect URI должен указывать на `http://localhost:4000/api/auth/yandex/callback` и совпадать с настройками приложения в Яндексе.

При старте backend сам создаёт таблицы в БД, поэтому применять миграции не обязательно.

### Изменения в `@tablora/shared`

Пакет собирается в `dist/`. Если правите его исходники, пересоберите его (watch-режим в отдельном терминале):

```sh
npm run dev:shared
```

## Скрипты (из корня)

| Команда | Назначение |
|---|---|
| `npm run build` | Собрать всё: `shared` → `backend` → `frontend` |
| `npm run build:shared` | Собрать `@tablora/shared` |
| `npm run dev:shared` | Watch-сборка `@tablora/shared` |
| `npm test -w tablora-backend` | Тесты backend |
| `npm run db:push -w tablora-backend` | Синхронизировать схему БД (dev) |
| `npm run db:migrate -w tablora-backend` | Применить миграции Drizzle |

В скриптах `-w` ссылается на **имя npm-пакета** (`tablora-backend` / `tablora-frontend`), а не на путь каталога.

---

# Tablora

A real-time competition results table web application.

**Language:** [Русский](#таблора-tablora) · English

## How it works

An organizer signs in with Yandex ID and creates a results table on a laptop. After creation, two QR codes are generated:

- **Judge QR** → `/t/:id/edit` — judges scan it to enter and update results from their phones. Editing is limited to the table's owner and the judges they invite by email; everyone else sees an access-denied notice.
- **Spectator QR** → `/t/:id` — displayed on a screen for the audience and updated in real time via SSE, without a page reload. Viewing is anonymous.

Sign-in is handled by Yandex ID; there is no Tablora password. The "My tables" directory (`/my`) lists the tables a user owns or judges, and only the owner can delete a table.

All user-facing copy is in Russian.

## Stack

| Part | Technologies |
|---|---|
| `backend/` | Fastify 5, Drizzle ORM, PostgreSQL (`postgres.js` driver), nanoid, Server-Sent Events, Yandex ID (OAuth 2.0), JWT sessions |
| `frontend/` | Next.js (App Router), TypeScript (strict), Tailwind CSS, shadcn/ui, Feature-Sliced Design |
| `packages/shared/` | `@tablora/shared` — the shared wire contract (column types, SSE event names, access roles, user data) |

The repository is an **npm workspaces** monorepo (three packages; root `package.json`).

## Repository structure

```text
.
├── backend/            # Fastify 5 REST API + SSE (Drizzle ORM + PostgreSQL)
├── frontend/           # Next.js (App Router) + TypeScript + Tailwind + Feature-Sliced Design
├── packages/shared/    # @tablora/shared — wire contract shared by backend and frontend
├── openspec/           # Spec-driven development artifacts
├── docker-compose.yml  # Local PostgreSQL
├── deploy/             # Production Docker Compose stack (see deploy/.env.example)
└── AGENTS.md           # Agent instructions
```

## Local development

Requires Node.js 22+ and Docker. All commands run from the repository root.

```sh
npm install                        # once: links workspaces and builds @tablora/shared
docker compose up -d postgres      # PostgreSQL on port 5432
npm run dev -w tablora-backend     # API + SSE on http://localhost:4000
npm run dev -w tablora-frontend    # UI on http://localhost:3000
```

Open http://localhost:3000. The frontend talks to the API at `NEXT_PUBLIC_API_URL=http://localhost:4000` by default.

For sign-in, copy `backend/.env.example` to `backend/.env` and fill in `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`, and `AUTH_JWT_SECRET`. The redirect URI must be `http://localhost:4000/api/auth/yandex/callback` and must match the Yandex app registration.

On startup the backend creates the database tables itself, so applying migrations is optional.

### Changes to `@tablora/shared`

The package is compiled to `dist/`. If you edit its sources, rebuild it (watch mode in a separate terminal):

```sh
npm run dev:shared
```

## Scripts (from the root)

| Command | Purpose |
|---|---|
| `npm run build` | Build everything: `shared` → `backend` → `frontend` |
| `npm run build:shared` | Build `@tablora/shared` |
| `npm run dev:shared` | Watch-build `@tablora/shared` |
| `npm test -w tablora-backend` | Backend tests |
| `npm run db:push -w tablora-backend` | Sync the DB schema (dev) |
| `npm run db:migrate -w tablora-backend` | Apply Drizzle migrations |

In scripts, `-w` refers to the **npm package name** (`tablora-backend` / `tablora-frontend`), not the directory path.
