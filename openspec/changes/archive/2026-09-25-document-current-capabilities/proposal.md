# Proposal

## Why

Tablora already implements a complete real-time competition results workflow — create a table, share QR access to judges and spectators, edit scores from a phone, and stream live updates to a screen — but none of this behavior is captured in the OpenSpec capability inventory (`openspec/specs/` is empty). This change records the existing behavior as durable specs so the project has an accurate, normative description of what it does today.

## What Changes

Introduces four new capability specs that document behavior as-implemented. No code changes.

- `table-creation`: creating a results table with a title, optional description, columns, and participants, including the default columns seeded when none are provided.
- `table-sharing`: the two access links/QR codes generated after creation (judge and spectator) and the open, no-authentication access model.
- `score-editing`: the judge workflow — adding participants and columns, entering and updating scores, and deleting participants, columns, and the table itself.
- `live-updates`: the server-sent events stream that keeps the spectator view in sync in real time, including reconnection behavior.

## Capabilities

### New Capabilities

- `table-creation`: Creating a results table and its initial columns and participants.
- `table-sharing`: Judge and spectator access links/QR codes with open (no-auth) access.
- `score-editing`: Entering and updating scores, and managing participants, columns, and the table.
- `live-updates`: Real-time spectator updates via server-sent events with reconnection.

### Modified Capabilities

<!-- None — this is the initial capability inventory. -->

## Impact

- Adds four spec files under `openspec/specs/` (via archive). No code, API, or dependency changes.
- Documents a known constraint: there is currently no authentication; anyone with a link can edit or delete. Authentication is a future addition, not part of this change.
