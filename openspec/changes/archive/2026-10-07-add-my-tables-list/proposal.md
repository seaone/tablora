# Proposal

## Why

Now that tables have an owner and per-table judges, a signed-in user has no way to
find the tables they made or were invited to judge: they would have to keep every
QR link. Organizers and judges need a simple "my tables" view so they can return to
a table they own or judge without hunting for a saved link.

## What Changes

- Add an authenticated backend endpoint that returns the tables the caller **owns**
  and the tables the caller is authorized to **judge**, each tagged with the caller's
  role for that table.
- Add a dedicated **Мои таблицы** page (`/my`) that lists those tables in one list,
  each row showing the **owner/judge badge**, the title, the description, the
  **created date**, and a link to the table's judge page (`/t/:id/edit`).
- Add a **role filter** (Select: all / owner / judge) on the page.
- Replace the header's sign-out button with an **account menu** (dropdown on the user's
  name) offering **Мои таблицы** and **Выйти**; signed-out visitors keep the sign-in
  button.
- Signed-out visitors who reach the page are prompted to sign in instead of seeing an
  empty list; a signed-in user with no tables sees an empty state that invites them to
  create one.

## Capabilities

### New Capabilities

- `my-tables`: a signed-in user's directory of the tables they own or judge — the
  authenticated list endpoint, its role labeling, the list page with a role filter and
  per-entry details, and the account-menu entry point that opens it.

### Modified Capabilities

<!-- No existing capability requirements change: ownership, judging, and sign-out
     behavior stay as specified. This change adds a new surface over them. -->

## Impact

- **Backend**: a new authenticated `GET /api/tables` route in
  `backend/src/routes/tables.ts` returning owned + judged tables with their role,
  reusing the email-match logic already used by `getTableAccess`
  (`backend/src/auth/authorization.ts`); no schema change.
- **Frontend**: a new `my-tables` page under `src/_pages`, a new route at
  `app/my/page.tsx`, a `fetchMyTables` call in `shared/api`, a new
  `shared/ui/dropdown-menu.tsx` primitive (Base UI flavor, matching the existing
  shadcn setup), and an updated `features/account/ui/account-control.tsx` that turns
  the account control into a dropdown menu.
- **No data migration**: the endpoint reads existing `tables` and `table_judges` rows.
