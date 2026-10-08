# Design

## Context

See `proposal.md` — Why. Relevant current state:

- Tables carry `owner_id` and a `table_judges(table_id, email)` list (see
  `backend/src/db/schema.ts`). `getTableAccess` in `backend/src/auth/authorization.ts`
  already resolves a caller's role for one table by comparing `owner_id` to the session
  user's id and the (lower-cased) email against `table_judges`.
- `backend/src/routes/tables.ts` exposes `POST /api/tables`, `GET /api/tables/:id`, and
  `GET /api/tables/:id/access`; there is no collection `GET /api/tables`.
- The frontend is Next.js App Router; `app/` delegates to `src/_pages`. The account
  control at `frontend/src/features/account/ui/account-control.tsx` currently renders a
  plain sign-out button for a signed-in user, and the header sign-in action otherwise.
- `shared/ui` has no menu primitive. shadcn is configured with the Base UI flavor
  (`components.json` style `base-vega`, `@base-ui/react` in `package.json`), so a new
  primitive must follow that pattern (`render={<.../>}`, `data-slot` attributes, `cn`).
- Server-restricted routes use the existing `requireUser` preHandler; the frontend already
  has `useAuth()` (`entities/user`) and `AppConfig.apiUrl`-based API calls in `shared/api`.

## Goals / Non-Goals

**Goals:**

- One authenticated endpoint returning owned + judged tables with the caller's role.
- A directory page that filters by role and links each entry to its judge page.
- An account menu that becomes the entry point to the directory while preserving sign-out.

**Non-Goals:**

- Pagination, search, sorting controls, or bulk actions in the list.
- Changing ownership, judging, or sign-in/sign-out semantics (covered by existing specs).
- New database columns or migrations.
- Moving existing table wire types into `@tablora/shared` (out of scope; `FullTableData`
  and friends stay in `frontend/src/shared/api/table.ts`).

## Decisions

### 1. New authenticated collection endpoint `GET /api/tables`

Add `GET /api/tables` guarded by the existing `requireUser` preHandler. It returns the
caller's owned tables and the tables whose `table_judges` row matches the caller's email,
each as a summary `{ id, title, description, createdAt, updatedAt, role }`, ordered by
`updatedAt` descending. A dedicated `/api/tables` collection route does not collide with
the existing `/api/tables/:id` route.

- Alternative: a query parameter on an existing route or a `/api/tables/mine` path.
  Rejected — a collection GET is the natural REST shape for "the tables I can see", and
  `mine` adds a segment without adding meaning.
- Alternative: allow unauthenticated listing filtered by an email query param. Rejected —
  it would leak other users' tables and contradicts the authentication requirement.

### 2. Query strategy: two reads merged in memory, owner precedence

Resolve the result from two reads — tables where `owner_id = user.id`, and tables joined
through `table_judges` where `email = user.email.toLowerCase()` — then merge in JS keyed by
table id. When a table matches both (owner is also on its judge list), the **owner** role
wins, so a table never appears twice.

- Alternative: a single SQL `UNION`/`OR` with a `CASE` for role. Faster on large data, but
  the two simple Drizzle reads compose with the existing access helper and keep the role
  rule in one readable place. Table counts per user are small; revisit only if that changes.
- The email-match rule (lower-cased comparison against `table_judges.email`) is the same
  rule `getTableAccess` already uses, so the list and the per-table access check agree.

### 3. Wire type lives with the other table types in `shared/api`

Define `MyTableSummary` (and a small `MyTablesRoleFilter` union for the UI) in
`frontend/src/shared/api/table.ts`, alongside `FullTableData`, and add `fetchMyTables()` to
`shared/api/client.ts`. `role` reuses `TableAccessRole` from `@tablora/shared` rather than
redefining the literal. The backend returns the same shape.

- Alternative: add the summary type to `@tablora/shared`. Rejected for this change — the
  existing table wire types (`FullTableData`, `TableJudge`, …) are frontend-local, so the
  summary follows that precedent. `TableAccessRole`, the only shared literal involved, is
  still imported from `@tablora/shared`.

### 4. New `my-tables` page under `_pages`, with a client-side filter

Add `_pages/my-tables` (`ui/my-tables-page.tsx`, `ui/my-tables-list.tsx`, model hook for
fetching, `index.ts`) and a thin route at `app/my/page.tsx`. The page:

- guards on `useAuth()`: loading → skeleton, signed out → sign-in prompt, signed in →
  fetch and render;
- renders a `Select` (all / owner / judge) that filters the already-fetched list client-side;
- renders each entry with a role `Badge`, title, description, created date, linked to
  `/t/:id/edit`; and shows an empty state with a link to `/new` when the list is empty.

Client-side filtering is intentional: the whole directory is already in memory and per-user
table counts are small, so a server round-trip per filter change buys nothing.

- Alternative: server-side `?role=` filtering. Rejected as needless complexity now; the
  endpoint could gain it later without a spec change.

### 5. Add a Base UI `dropdown-menu` primitive and rework the account control

Add `shared/ui/dropdown-menu.tsx` following the existing shadcn Base UI pattern
(`@base-ui/react/menu`, `data-slot` attributes, `cn`, `render={<.../>}`), export it from
`shared/ui/index.ts`, and rework `account-control.tsx` so a signed-in user's name is the
menu trigger with items "Мои таблицы" (a `Link` to `/my`) and "Выйти" (calls `signOut`).
Signed-out visitors keep the current sign-in button. This matches the user's provided
`DropdownMenu` usage example and the project's `components.json` (Base UI) setup.

- Alternative: hand-roll a popover or reuse the `Dialog`. Rejected — a menu is the right
  primitive, and the project already treats shadcn/Base UI components as `shared/ui`.
- No new npm dependency: `@base-ui/react` is already installed and exposes the menu module.

### 6. Navigation and empty/anonymous states

The page lives at `/my`. The account menu is the primary entry point; the home header
already renders `AccountControl`, so no new nav chrome is needed. Anonymous visitors to
`/my` see a prompt to sign in (reusing the existing sign-in feature), and a signed-in user
with no tables sees an empty state linking to `/new`.

## Risks / Trade-offs

- [A user with a very large number of tables gets an unbounded response] → acceptable for
  the small per-user volumes here; pagination is a later, additive change (see Open Questions).
- [Email-based judging means a table disappears from the list if the judge's Yandex email
  changes] → inherited limitation of `table_judges`, already documented in the auth change;
  the owner can re-invite.
- [Legacy unowned tables (`owner_id` NULL) never appear in anyone's list] → consistent with
  the auth change's decision; they remain viewable by link.
- [The new menu changes existing header markup] → keep the signed-out branch unchanged and
  cover the menu items with the page's integration checks.

## Migration Plan

1. Ship the backend endpoint first (additive, reads existing rows); no schema change, so
   `ensureTablesExist()` is untouched.
2. Ship the frontend page, route, and account menu.
3. Rollback: redeploy the previous image tags; the new endpoint and page are additive and
   the old account control is inert without them.

## Open Questions

- Whether the directory should paginate or support search once a user has many tables —
  deferrable; the endpoint can gain a `limit`/`offset` or `role` parameter later without
  changing the specs.
