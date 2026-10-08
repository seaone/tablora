# Spec Delta

## MODIFIED Requirements

### Requirement: Delete a table
The system SHALL allow only the table's owner to delete the entire table and all of its
data.

#### Scenario: Delete a table
- **WHEN** the owner confirms deletion of the table
- **THEN** the table, its columns, its participants, and its scores are all removed

#### Scenario: Non-owner attempts to delete the table
- **WHEN** a user who is not the owner attempts to delete the table
- **THEN** the system denies the request and the table remains
