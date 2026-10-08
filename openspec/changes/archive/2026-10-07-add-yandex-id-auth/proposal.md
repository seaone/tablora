# Proposal

## Why

Tablora has no authentication: anyone with a link can edit a table, so an organizer
cannot tell who created a table or restrict editing to trusted judges. Organizers need
to own their tables and choose who may enter results, while spectators must keep viewing
anonymously through the QR link. This change introduces Yandex ID sign-in plus per-table
judge authorization as the first identity provider; VK ID and Google are planned to
follow, so the identity model is designed to accept more providers later.

## What Changes

- Add **Yandex ID** (OAuth 2.0 / OpenID Connect) sign-in with server-side sessions and a
  current-user endpoint, plus sign-out.
- Creating a table now requires an authenticated organizer; each table records its owner.
- Add a **per-table list of authorized judges** that the owner invites (by Yandex email),
  lists, and removes.
- **BREAKING**: the judge link (`/t/:id/edit`) no longer grants anonymous access. Editing
  requires signing in and being the owner or an invited judge; anyone else sees an
  "Access denied" warning.
- **BREAKING**: deleting a table is restricted to its owner.
- The spectator link (`/t/:id`) keeps working anonymously for viewing; only editing is
  restricted.
- Add sign-in/sign-out UI, authentication state, judge management in the share view, and
  an access-denied state to the frontend.
- Document the new configuration (`YANDEX_CLIENT_ID`, `YANDEX_CLIENT_SECRET`,
  `YANDEX_REDIRECT_URI`, `SESSION_SECRET`, frontend callback/origin URL) in `.env.example`;
  real values stay in gitignored env files.

## Capabilities

### New Capabilities

- `authentication`: Yandex ID sign-in, session lifecycle, current-user identity, and
  sign-out.
- `judge-authorization`: the owner-managed per-table list of authorized judges and the
  enforcement of who may modify a table.

### Modified Capabilities

- `table-creation`: creating a table now requires an authenticated organizer and records
  the table owner.
- `table-sharing`: anonymous editing via the judge link is removed in favor of
  owner-managed judge access; the spectator link stays anonymous.
- `score-editing`: modifying a table requires the owner or an authorized judge, and
  deleting the table is restricted to the owner.

## Impact

- **Backend**: new `users`, `identities`, `sessions`, and `table_judges` tables; a
  `tables.owner_id` column; Yandex sign-in through `@fastify/oauth2` with a `@fastify/jwt`
  session cookie (routes `/api/auth/yandex`, `/callback`, `/me`, `/logout`); request
  authentication; protection of all table-mutation routes; CORS must allow credentials and
  SSE clients must send the session cookie.
- **Shared**: new auth wire types (authenticated user, table access role) added to
  `@tablora/shared`; never redefined in backend/frontend.
- **Frontend**: a new `auth` (or `sign-in`) feature and a `user` entity, header sign-in
  state, an access-denied state on the judge route, and judge management in the share page.
- **Config/deploy**: `.env.example` and `deploy/.env.example` gain the Yandex OAuth and
  session variables. The OAuth client secret must never be committed.
- **Data**: pre-existing tables have no owner; they keep serving the anonymous spectator
  view but have no owner until claimed (documented decision).
- **Future**: users are keyed by `(provider, provider_user_id)` so VK ID and Google can be
  added later without reshaping the schema.
