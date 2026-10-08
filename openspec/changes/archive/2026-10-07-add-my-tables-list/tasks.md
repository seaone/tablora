# Tasks

## 1. Backend: my-tables endpoint

- [x] 1.1 Add a helper that returns a user's directory — tables where `owner_id = user.id` plus tables joined through `table_judges` where `email = user.email.toLowerCase()`, merged by table id with **owner** taking precedence — in `backend/src/routes/tables.ts` (reusing the email-match rule from `backend/src/auth/authorization.ts`); verify `npm run build -w tablora-backend` type-checks.
- [x] 1.2 Add `GET /api/tables` guarded by `requireUser`, returning each table as `{ id, title, description, createdAt, updatedAt, role }` ordered by `updatedAt` descending; verify the route does not shadow `GET /api/tables/:id`.
- [x] 1.3 Add backend tests for the endpoint (alongside `backend/src/routes/tables-authz.test.ts`): owner sees owned tables, a user whose email is on `table_judges` sees that table labeled `judge`, a table the caller neither owns nor judges is absent, a table owned *and* judged appears once as `owner`, and an anonymous request is rejected with 401; verify `npm test -w tablora-backend` passes.

## 2. Frontend: data access

- [x] 2.1 Add a `MyTableSummary` type (`id, title, description, createdAt, updatedAt, role`) and a role-filter union (`all | owner | judge`) to `frontend/src/shared/api/table.ts`, reusing `TableAccessRole` from `@tablora/shared` for `role`; verify `npm run build -w tablora-frontend` type-checks.
- [x] 2.2 Add `fetchMyTables()` to `frontend/src/shared/api/client.ts` calling `GET /api/tables` with `credentials: "include"`; verify it returns the typed list and throws on a non-OK response.

## 3. Frontend: dropdown-menu primitive and account control

- [x] 3.1 Add `frontend/src/shared/ui/dropdown-menu.tsx` as a Base UI (`@base-ui/react/menu`) primitive following the existing shadcn `base-vega` conventions (`data-slot`, `cn`, `render={<.../>}`) and export it from `frontend/src/shared/ui/index.ts`; verify it renders a trigger and items in the running frontend.
- [x] 3.2 Rework `frontend/src/features/account/ui/account-control.tsx` so a signed-in user's name is the menu trigger with items "Мои таблицы" (a `Link` to `/my`) and "Выйти" (calls `signOut`), keeping the signed-out sign-in button unchanged; verify in dev that the menu opens, "Выйти" signs out, and the signed-out state is unchanged.

## 4. Frontend: my-tables page and route

- [x] 4.1 Create `frontend/src/_pages/my-tables` (ui + model hook + `index.ts`) that guards on `useAuth()` (loading → placeholder, signed out → sign-in prompt, signed in → fetch) and add the thin route `frontend/app/my/page.tsx`; verify `/my` renders each state correctly.
- [x] 4.2 Render the directory as a single list with a role `Select` (all / owner / judge) filtering client-side, each entry showing a role `Badge`, title, description, and created date, linked to `/t/:id/edit`, plus an empty state linking to `/new`; verify the filter switches the visible entries and an entry navigates to the judge page.

## 5. Integration verification

- [x] 5.1 Run `npm test -w tablora-backend` and confirm the full backend suite passes.
- [x] 5.2 Run `npm run build` and confirm all workspaces build.
- [x] 5.3 End-to-end check with the running stack: a signed-in organizer creates a table and sees it as owner in "Мои таблицы"; an invited judge signs in and sees the same table as judge; the role filter narrows the list; an unrelated signed-in user sees an empty directory; and a visitor who is not signed in is prompted to sign in from `/my`.
