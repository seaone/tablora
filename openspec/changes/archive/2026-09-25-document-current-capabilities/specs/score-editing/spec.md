# Spec Delta

## Purpose

Lets judges manage a table's participants and columns and enter or update each participant's scores.

## ADDED Requirements

### Requirement: Add a participant
The system SHALL allow a judge to add a participant to a table by providing a name and an optional description.

#### Scenario: Add a participant
- **WHEN** a judge submits a new participant with a non-empty name
- **THEN** the participant is added to the table at the end of the list

#### Scenario: Add a participant without a name
- **WHEN** a judge submits a new participant with an empty or missing name
- **THEN** the system rejects the request and does not add a participant

### Requirement: Add a column
The system SHALL allow a judge to add a column to a table by providing a name and a type (number, text, or time).

#### Scenario: Add a column
- **WHEN** a judge submits a new column with a non-empty name and a supported type
- **THEN** the column is added to the table at the end of the list

#### Scenario: Add a column without a name
- **WHEN** a judge submits a new column with an empty or missing name
- **THEN** the system rejects the request and does not add a column

### Requirement: Submit scores for a participant
The system SHALL allow a judge to submit or update the score values for a participant across the table's columns.

#### Scenario: Submit scores
- **WHEN** a judge submits score values for one or more columns of a participant
- **THEN** the system stores or updates each value for that participant and column

#### Scenario: Clear a score with an empty value
- **WHEN** a judge submits an empty value for a column
- **THEN** the system stores an empty value for that participant and column

#### Scenario: Submit scores for a nonexistent participant
- **WHEN** a judge submits scores for a participant id that does not belong to the table
- **THEN** the system rejects the request with a not-found response

### Requirement: Delete a participant
The system SHALL allow a judge to delete a participant from a table, removing the participant and its scores.

#### Scenario: Delete a participant
- **WHEN** a judge confirms deletion of a participant
- **THEN** the participant and all of its scores are removed from the table

### Requirement: Delete a column
The system SHALL allow a judge to delete a column from a table, removing the column and the scores associated with it.

#### Scenario: Delete a column
- **WHEN** a judge confirms deletion of a column
- **THEN** the column and all scores associated with it are removed from the table

### Requirement: Delete a table
The system SHALL allow a judge to delete the entire table and all of its data.

#### Scenario: Delete a table
- **WHEN** a judge confirms deletion of the table
- **THEN** the table, its columns, its participants, and its scores are all removed
