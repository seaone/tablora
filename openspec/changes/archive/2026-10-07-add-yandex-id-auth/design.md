# Design

## Context

See `proposal.md` — Why. Relevant current state:

- The backend mounts all routes under `/api` (`backend/src/app.ts`) with `@fastify/cors`
  configured as `origin: true` and no credentials; tables are created on startup by
  `ensureTablesExist()`, so Drizzle migrations are optional.
- Every table route in `backend/src/routes/tables.ts` is open: create, read, mutate, delete,
  and the SSE stream at `GET /api/tables/:id/events`.
- `tables` has no owner column; there is no user or session concept anywhere.
- The frontend is Next.js App Router; `app/` is thin and delegates to `src/_pages`
  (home, create-table, judge-table, share-table, table-spectator). REST access goes through
  `src/shared/api`; live updates through `entities/table/model/use-live-table.ts`.
- Deployment is via published images; `NEXT_PUBLIC_API_URL` is baked in at build, and
  operational values live in gitignored `deploy/.env` (see `AGENTS.md`).

## Goals / Non-Goals

**Goals:**

- Yandex ID sign-in with a revocable, server-managed session, reachable from the frontend.
- Tables owned by their creator; per-table judge authorization; enforcement on every
  table-mutating endpoint.
- An identity model that accepts additional providers (VK ID, Google) later without
  reshaping the schema.
- Keep spectator viewing and the SSE stream anonymous.

**Non-Goals:**

- Implementing VK ID or Google now (schema and provider boundary must merely allow it).
- Spectator accounts, roles beyond owner/judge, an admin surface, or email notifications
  for invitations.
- Linking several providers to a single Tablora account.
- Backfilling owners for pre-existing tables (see Migration Plan).

## Decisions

### 1. Yandex ID via `@fastify/oauth2` (Authorization Code flow)

Use the `@fastify/oauth2` plugin instead of hand-rolling the flow. Register a Yandex provider
with `authorizationEndpoint: https://oauth.yandex.ru/authorize`,
`tokenEndpoint: https://oauth.yandex.ru/token`, the `login:email` and `login:info` scopes,
`startRedirectPath: /api/auth/yandex`, and `callbackUri` taken from `YANDEX_REDIRECT_URI`.
The plugin generates the authorize redirect and handles the `state` CSRF value; the callback
route (`/api/auth/yandex/callback`) is ours and calls
`fastify.oauth2Yandex.getAccessTokenFromAuthorizationCodeFlow(request)`, then reads the
profile from `https://login.yandex.ru/info?format=json`. A `returnTo` value (validated to be
a same-site frontend path) is carried in a short-lived cookie to send the user back after
login. (`@fastify/oauth2` decorates the namespace as `fastify.oauth2Yandex`, not
`fastify.oauth2.yandex`.)

- Alternative: hand-rolled authorize/token/userinfo calls. Rejected — it reimplements the
  redirect building, `state` handling, and token exchange the plugin already covers, and
  duplicates security-sensitive code.
- Alternative: an SPA-only flow (implicit / PKCE) with the frontend talking to Yandex
  directly. Rejected — it exposes the flow to the browser, complicates cookie issuance
  cross-origin, and we need the backend to create a session anyway.

### 2. Session token: `@fastify/jwt` cookie, revoked through a `sessions` row

On a successful callback the backend signs a session JWT with `@fastify/jwt` (`sub` = user
id, plus the user's email and a `jti` = session id), sets it in an `httpOnly`, `SameSite=Lax`,
`Secure`-in-production cookie, and inserts a `sessions` row for that `jti`. A preHandler
verifies the JWT through `@fastify/jwt`, then confirms the `jti` still has an active
`sessions` row — that row is what makes logout and revocation immediate. `/api/auth/logout`
clears the cookie and deletes the row. `@fastify/cookie` (a dependency of `@fastify/jwt`)
carries the cookie.

- Alternative: a plain opaque session id in the cookie, no JWT. Simpler, but the session
  token would carry no identity; the JWT keeps identity in a tamper-evident token while the
  `jti` row preserves revocability.
- Alternative: a fully stateless JWT with no `sessions` table. Simpler and lighter, but it
  cannot satisfy the spec's revoked-session scenario before expiry. Choosing it means
  relaxing the "Session persistence" requirement and dropping the `sessions` table — noted
  as an option, not chosen here.

### 3. Provider-agnostic identity: `users` + `identities`

`users` holds the Tablora account (id, display name, primary email, timestamps).
`identities` holds one row per provider account, unique on `(provider, provider_user_id)`,
referencing a user. Yandex sign-in upserts `identities(provider='yandex', provider_user_id,
email)` and its `users` row.

- Alternative: a single `users.yandex_id` column. Simpler today, but adding VK ID/Google
  means a schema migration and a second unlinked user table. Rejected given the stated
  roadmap.

### 4. Authorization model: `tables.owner_id` + `table_judges`

`tables` gains a nullable `owner_id`; `table_judges` holds `(table_id, email)` uniquely,
managed by the owner. Access is computed per request from the session user:

- owner ⟺ `tables.owner_id = user.id`
- judge ⟺ the user's email matches a `table_judges` row for that table
- otherwise: viewer (read-only) or anonymous

Enforcement lives in a Fastify preHandler that decorates `request.user` and a helper that
loads the caller's role for a table. Mutations require owner or judge; judge management and
table deletion require owner. Spectator reads and the SSE stream stay public.

- Alternative: a `memberships` table with a `role` column (owner/judge as rows). Considered
  cleaner conceptually but adds a row for the owner and a join on every check; the
  owner column plus a small judge table is simpler and matches "one owner per table".
- Alternative: invitation-by-user-id after the judge signs in. Rejected — the owner cannot
  know a judge's Tablora id before that judge has ever signed in; matching by email lets the
  owner invite someone who has not used the app yet.

### 5. Where the frontend learns about auth

`/api/auth/me` is the single source of truth; a small provider (in `src/_app`) loads it and
exposes the current user and sign-in/out actions. Sign-in is a full-page navigation to
`GET /api/auth/yandex`, so no token handling in the browser. The judge page renders an
access-denied state when the table reports the caller is not authorized; the share page
gains judge management (list/add/remove) visible to the owner.

FSD placement: a `user` entity (types + `me` query) and a `sign-in`/`sign-out` feature;
`shared/api` gains the auth calls. Wire types (authenticated user, table access role) are
added to `@tablora/shared` and imported, never redefined.

### 6. CORS, cookies, and SSE

`@fastify/cors` keeps reflecting the request origin (`origin: true`) but adds
`credentials: true`. Reflecting the origin — rather than pinning the single `FRONTEND_URL`
origin — is deliberate: judges open the app from phones on the LAN, whose origin differs from
the configured one. Session cookies are `SameSite=Lax`, so a reflected origin cannot turn a
cross-site request into an authenticated one; in production the frontend and API share an
origin and CORS does not apply. `EventSource` in `use-live-table.ts` sets
`withCredentials: true`, so the SSE route must echo the caller's origin with
`Access-Control-Allow-Credentials` instead of the previous `Access-Control-Allow-Origin: *`
(a `*` origin is rejected by the browser when credentials are sent).

### 7. Configuration

New environment variables, documented in `.env.example` (and `deploy/.env.example`) with
placeholders only: `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`, `YANDEX_REDIRECT_URI`,
`AUTH_JWT_SECRET` (signs session tokens), and `FRONTEND_URL` (for CORS origin and post-login
redirect). `YANDEX_REDIRECT_URI` is per
environment — `http://localhost:4000/api/auth/yandex/callback` locally (the backend mounts
all routes under `/api`) and `<production-origin>/api/auth/yandex/callback` in production,
where the hostname is operational detail that stays out of the repo. Real values go in
gitignored env files; the secret is never committed.

## Risks / Trade-offs

- [Shipping enforcement before the frontend is ready locks judges out] → deploy backend and
  frontend together; the backend accepts the session cookie that the frontend also relies on.
- [Email-based matching breaks if a judge's Yandex email changes or is absent] → Yandex
  account scope must include `login:email`; email is treated as the invitation key, and the
  owner can re-invite. Documented limitation.
- [Cross-origin cookies are easy to misconfigure (`SameSite`, `Secure`, `credentials`,
  CORS origin)] → one place resolves CORS/`FRONTEND_URL`; local dev uses a non-`Secure`
  cookie over `localhost`.
- [A leaked `AUTH_JWT_SECRET` lets anyone forge session tokens] → keep it in gitignored env,
  rotate it on exposure, and keep the session TTL finite.
- [The provided OAuth client secret has already been exposed in chat] → treat it as
  compromised, rotate it in the Yandex app, and keep only placeholders in the repo.
- [Unowned legacy tables] → nobody is authorized to edit them; they remain viewable. See
  Migration Plan.

## Migration Plan

1. `ensureTablesExist()` creates `users`, `identities`, `sessions`, `table_judges`, and adds
   a nullable `owner_id` to `tables` (each statement in its own `sql` call, per the backend
   convention). Existing rows stay valid with `owner_id = NULL`.
2. Ship backend then frontend in one release. Legacy tables keep serving the anonymous
   spectator view; they have no owner, so no one can edit or manage them (a documented,
   acceptable outcome — they were created before accounts existed). If editing a legacy
   table is later required, an owner can be assigned manually.
3. Rollback: redeploy the previous image tags; the added tables and nullable column are
   inert for the old code.

## Open Questions

- Whether a future "my tables" dashboard for owners is wanted — not required by the current
  scope; ownership already gates judging and deletion.
