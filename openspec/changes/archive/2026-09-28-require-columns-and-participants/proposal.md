# Proposal

## Why

The `POST /api/tables` endpoint previously accepted `columns` and `participants` as optional, seeding default columns («Баллы», «Время») when none were provided. That contract has been changed in the backend: `columns` and `participants` are now required, and the request is rejected with a `400` when either is missing. The `table-creation` spec still documents the old behavior and must be updated to match.

## What Changes

Updates the `table-creation` capability spec:

- **Create a results table**: `columns` and `participants` become required fields rather than optional; missing fields now reject the request.
- **Default columns**: removed — the endpoint no longer seeds default columns.
- **Initial participants**: participants are now required, though individual entries with an empty name are still skipped.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `table-creation`: `columns` and `participants` are now required; default-column seeding is removed.

## Impact

- No code changes — the backend behavior change is already implemented in `tablora-backend/src/routes/tables.ts`.
- The frontend wizard already enforces ≥1 column and ≥1 participant, so no frontend impact.
- **BREAKING** for any external client that relied on default columns or omitted `columns`/`participants`: such requests now receive a `400`.
