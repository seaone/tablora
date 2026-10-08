# table-creation Specification

## Purpose
Lets an organizer create a competition results table with a title, columns, and participants, ready for judging and viewing immediately.

## Requirements

### Requirement: Create a results table
The system SHALL allow an authenticated organizer to create a results table by providing a title, an optional description, a required list of columns, and a required list of participants, and SHALL record that organizer as the table's owner.

#### Scenario: Create a table with a title
- **WHEN** the organizer submits a table with a non-empty title, a list of columns, and a list of participants
- **THEN** the system creates the table and returns it with its id, title, description, columns, participants, and scores

#### Scenario: Create a table while signed out
- **WHEN** a visitor who is not signed in submits a table
- **THEN** the system rejects the request with an unauthorized response and does not create a table

#### Scenario: Owner is recorded
- **WHEN** an authenticated organizer creates a table
- **THEN** the system records that organizer as the owner of the table

#### Scenario: Create a table without a title
- **WHEN** the organizer submits a table with a missing or empty title
- **THEN** the system rejects the request and does not create a table

#### Scenario: Create a table without columns
- **WHEN** the organizer submits a table with a title but without a `columns` field
- **THEN** the system rejects the request with a 400 error and does not create a table

#### Scenario: Create a table without participants
- **WHEN** the organizer submits a table with a title but without a `participants` field
- **THEN** the system rejects the request with a 400 error and does not create a table

### Requirement: Column types
The system SHALL support columns of type number, text, and time, and SHALL assign each column a display order.

#### Scenario: Create columns of each supported type
- **WHEN** the organizer creates a table with columns of type number, text, and time
- **THEN** each column is created with the requested type and a sort order matching its position

### Requirement: Initial participants
The system SHALL require a list of participants at creation time, adding each participant in the order provided and skipping entries with an empty name.

#### Scenario: Participants provided
- **WHEN** the organizer creates a table with a list of participants that have names
- **THEN** the table is created with those participants, in the order provided, each with an optional description

#### Scenario: Participant without a name
- **WHEN** a participant entry has an empty or missing name
- **THEN** the system skips that entry and does not create a participant for it
