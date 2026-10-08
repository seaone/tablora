# Spec Delta

## MODIFIED Requirements

### Requirement: Create a results table
The system SHALL allow an authenticated organizer to create a results table by providing a
title, an optional description, a required list of columns, and a required list of
participants, and SHALL record that organizer as the table's owner.

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
