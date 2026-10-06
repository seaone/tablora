# Spec Delta

## Purpose

Lets an organizer create a competition results table with a title, columns, and participants, seeded with sensible defaults so the table is usable immediately.

## ADDED Requirements

### Requirement: Create a results table
The system SHALL allow an organizer to create a results table by providing a title, an optional description, an optional list of columns, and an optional list of participants.

#### Scenario: Create a table with a title
- **WHEN** the organizer submits a table with a non-empty title
- **THEN** the system creates the table and returns it with its id, title, description, columns, participants, and scores

#### Scenario: Create a table without a title
- **WHEN** the organizer submits a table with a missing or empty title
- **THEN** the system rejects the request and does not create a table

### Requirement: Default columns
The system SHALL seed a newly created table with two default columns when no columns are provided: a numeric column named «Баллы» and a time column named «Время».

#### Scenario: No columns provided
- **WHEN** the organizer creates a table without specifying columns
- **THEN** the table is created with the two default columns «Баллы» (number) and «Время» (time), in that order

#### Scenario: Columns provided
- **WHEN** the organizer creates a table with an explicit list of columns
- **THEN** the table is created with exactly those columns, in the order provided, and no default columns are added

### Requirement: Column types
The system SHALL support columns of type number, text, and time, and SHALL assign each column a display order.

#### Scenario: Create columns of each supported type
- **WHEN** the organizer creates a table with columns of type number, text, and time
- **THEN** each column is created with the requested type and a sort order matching its position

### Requirement: Initial participants
The system SHALL add any participants provided at creation time, preserving their order and skipping entries with an empty name.

#### Scenario: Participants provided
- **WHEN** the organizer creates a table with a list of participants that have names
- **THEN** the table is created with those participants, in the order provided, each with an optional description

#### Scenario: Participant without a name
- **WHEN** a participant entry has an empty or missing name
- **THEN** the system skips that entry and does not create a participant for it
