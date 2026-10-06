# Spec Delta

## MODIFIED Requirements

### Requirement: Create a results table
The system SHALL allow an organizer to create a results table by providing a title, an optional description, a required list of columns, and a required list of participants.

#### Scenario: Create a table with a title
- **WHEN** the organizer submits a table with a non-empty title, a list of columns, and a list of participants
- **THEN** the system creates the table and returns it with its id, title, description, columns, participants, and scores

#### Scenario: Create a table without a title
- **WHEN** the organizer submits a table with a missing or empty title
- **THEN** the system rejects the request and does not create a table

#### Scenario: Create a table without columns
- **WHEN** the organizer submits a table with a title but without a `columns` field
- **THEN** the system rejects the request with a 400 error and does not create a table

#### Scenario: Create a table without participants
- **WHEN** the organizer submits a table with a title but without a `participants` field
- **THEN** the system rejects the request with a 400 error and does not create a table

### Requirement: Initial participants
The system SHALL require a list of participants at creation time, adding each participant in the order provided and skipping entries with an empty name.

#### Scenario: Participants provided
- **WHEN** the organizer creates a table with a list of participants that have names
- **THEN** the table is created with those participants, in the order provided, each with an optional description

#### Scenario: Participant without a name
- **WHEN** a participant entry has an empty or missing name
- **THEN** the system skips that entry and does not create a participant for it

## REMOVED Requirements

### Requirement: Default columns
**Reason**: The `POST /api/tables` endpoint no longer seeds default columns; `columns` is now a required field.
**Migration**: Clients must provide an explicit `columns` array when creating a table.
