# Tasks

## 1. Shared contract and configuration

- [x] 1.1 Add the auth wire types to `@tablora/shared` (authenticated user shape and table access role) in `packages/shared/src`, export them, and run `npm run build:shared`; verify the build succeeds and the new exports resolve from `dist/`.
- [x] 1.2 Add `YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`, `YANDEX_REDIRECT_URI`, `AUTH_JWT_SECRET`, and `FRONTEND_URL` as placeholders to `.env.example` and `deploy/.env.example`, and document them (purpose and environment-specific values) in `AGENTS.md`; verify `git grep` finds no real client id/secret committed.
- [x] 1.3 Set `YANDEX_REDIRECT_URI` per environment (local `http://localhost:4000/api/auth/yandex/callback`; the production value is kept out of the repo) and confirm each matches the Yandex app registration; verify the local value returns to the backend callback route.

## 2. Backend persistence

- [x] 2.1 Add `users`, `identities`, `sessions`, and `table_judges` tables, and a nullable `owner_id` on `tables`, to `backend/src/db/schema.ts`; verify `npm run build -w tablora-backend` type-checks.
- [x] 2.2 Create the new tables in `ensureTablesExist()` with each statement in its own `sql` call; verify by starting the backend against Postgres and querying `information_schema.tables`/`columns` to confirm they exist, and that `npm test -w tablora-backend` still passes.

## 3. Backend authentication

- [x] 3.1 Add and register `@fastify/oauth2` (Yandex provider: authorize/token endpoints, `login:email`/`login:info` scopes, `startRedirectPath`, `callbackUri` from `YANDEX_REDIRECT_URI`) and `@fastify/jwt` (session cookie signing, `AUTH_JWT_SECRET`); verify `npm install` succeeds and the app boots in tests.
- [x] 3.2 Implement the callback route at `/api/auth/yandex/callback` using `getAccessTokenFromAuthorizationCodeFlow` (fetch the profile, upsert the identity and user, sign a session JWT with a `jti`, insert the `sessions` row, set the httpOnly cookie, and redirect to `FRONTEND_URL`/`returnTo`); verify with integration tests against a stubbed token/profile endpoint covering success, user-denied, and provider-error cases.
- [x] 3.3 Implement `GET /api/auth/me` and `POST /api/auth/logout` (clear the cookie and delete the `sessions` row); verify tests showing `me` returns the user with a valid session and reports signed-out without one, and that a logged-out or revoked session reads as signed out.
- [x] 3.4 Cover identity stability and session lifetime with tests: a returning Yandex account reuses its user (no duplicate), a first-time account creates one, and an expired or revoked session reads as signed out.

## 4. Backend authorization

- [x] 4.1 Add a preHandler that verifies the session JWT and confirms its `jti` still has an active session, resolving the user onto the request, plus a helper that resolves a caller's role for a table (owner, judge, viewer, anonymous); verify with unit tests for token verification and role resolution.
- [x] 4.2 Require authentication on `POST /api/tables` and record the caller as `owner_id`; verify tests: signed-out → unauthorized and no table created, signed-in → owner recorded.
- [x] 4.3 Restrict participant, column, and score mutation routes to the owner or an authorized judge, while leaving `GET /api/tables/:id` and `GET /api/tables/:id/events` public; verify tests for owner-allowed, judge-allowed, signed-in-unauthorized → forbidden, and anonymous → unauthorized.
- [x] 4.4 Make `DELETE /api/tables/:id` owner-only; verify a test where a non-owner judge is denied and the table remains.
- [x] 4.5 Add owner-only judge management endpoints (list judges, add a judge by email, remove a judge); verify tests: owner can list/add/remove, invalid email rejected, duplicate invite is a no-op, and non-owner requests are denied.
- [x] 4.6 Configure `@fastify/cors` to allow credentials (reflecting the request origin so LAN/mobile judges keep working) and fix the SSE origin header; verify a test asserting the reflected origin and `Access-Control-Allow-Credentials`.

## 5. Frontend authentication

- [x] 5.1 Add a `user` entity (types plus a `me` query) and the auth calls in `shared/api`; verify `npm run build -w tablora-frontend` type-checks.
- [x] 5.2 Add an auth provider in `_app` and a sign-in/sign-out feature, and wire the header to show the account and sign-in action; verify in dev that sign-in navigates to the backend flow and `/api/auth/me` reflects the resulting state.
- [x] 5.3 Set `withCredentials: true` on the SSE client used by the live table; verify the spectator stream still connects in dev.

## 6. Frontend authorization UX

- [x] 6.1 Render an access-denied state on the judge page when the caller is signed in but not the owner or a judge, and direct anonymous visitors to sign in; verify against the backend's responses for each case.
- [x] 6.2 Add judge management (list, add by email, remove) to the share page for the owner; verify add/remove update the displayed list and are reflected by the backend.

## 7. Integration verification

- [x] 7.1 Run `npm test -w tablora-backend` and confirm the full backend suite passes.
- [x] 7.2 Run `npm run build` and confirm all workspaces build.
- [x] 7.3 End-to-end check with the running stack: an organizer signs in, creates a table, invites a judge; the judge signs in and edits; a different signed-in user and an anonymous visitor both see the access-denied warning on the judge link; and the spectator link still updates live without signing in.
