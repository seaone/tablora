# Spec Delta

## Purpose

Keeps the spectator view of a table in sync in real time as judges enter and update results, without requiring a page reload.

## ADDED Requirements

### Requirement: Live update stream
The system SHALL expose a server-sent events stream for a table that delivers the full table state to connected clients whenever the table changes.

#### Scenario: Initial snapshot
- **WHEN** a client connects to the event stream for a table
- **THEN** the system sends the current full table state to that client

#### Scenario: Update broadcast
- **WHEN** a table changes (e.g. a score, participant, or column is added, updated, or deleted)
- **THEN** the system broadcasts the updated full table state to all clients subscribed to that table

#### Scenario: Stream for a nonexistent table
- **WHEN** a client connects to the event stream for a table id that does not exist
- **THEN** the system rejects the connection with a not-found response

### Requirement: Connection state awareness
The system SHALL expose to the spectator view whether the live connection is active, connecting, or reconnecting.

#### Scenario: Show connection state
- **WHEN** the live connection is established or interrupted
- **THEN** the spectator view reflects the current connection state

### Requirement: Automatic reconnection
The system SHALL reconnect the spectator view to the live stream automatically after the connection is interrupted.

#### Scenario: Reconnect after interruption
- **WHEN** the live connection is lost
- **THEN** the spectator view retries the connection after a short delay and resumes receiving updates without a manual reload
