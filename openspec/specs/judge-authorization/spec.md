# judge-authorization Specification

## Purpose
Lets a table's owner authorize individual judges to edit that table, and enforces which visitors are allowed to view, edit, or manage a table.

## Requirements

### Requirement: Authorized judges list
The system SHALL maintain, per table, a list of authorized judges that the table's owner can view.

#### Scenario: Owner views the judges
- **WHEN** the owner opens the table's judge management
- **THEN** the system shows the judges currently authorized to edit the table

#### Scenario: Non-owner views the judges
- **WHEN** a user who is not the owner requests a table's authorized judge list
- **THEN** the system denies the request

### Requirement: Invite a judge
The system SHALL allow the table's owner to authorize a judge by providing that judge's Yandex email address.

#### Scenario: Invite a judge by email
- **WHEN** the owner adds a valid email address as a judge
- **THEN** the system adds that email to the table's authorized judges

#### Scenario: Invite with an invalid email
- **WHEN** the owner submits an empty or malformed email address
- **THEN** the system rejects the request and does not add a judge

#### Scenario: Invite an already-authorized judge
- **WHEN** the owner adds an email address already present in the table's judge list
- **THEN** the system does not create a duplicate entry

#### Scenario: Only the owner can invite
- **WHEN** a user who is not the owner tries to add a judge
- **THEN** the system denies the request

### Requirement: Remove an authorized judge
The system SHALL allow the table's owner to remove a judge from the table's authorized judges.

#### Scenario: Remove a judge
- **WHEN** the owner removes an email address from the judge list
- **THEN** that judge is no longer authorized to edit the table

#### Scenario: Only the owner can remove
- **WHEN** a user who is not the owner tries to remove a judge
- **THEN** the system denies the request

### Requirement: Judge access is decided by signed-in identity
The system SHALL grant editing access to the owner and to signed-in users whose Yandex email is on the table's authorized judges, and SHALL deny editing access to everyone else.

#### Scenario: Authorized judge signs in
- **WHEN** a signed-in user whose Yandex email is on the table's judge list opens the judge link
- **THEN** the system grants editing access

#### Scenario: Signed-in user who is not authorized
- **WHEN** a signed-in user whose email is neither the owner's nor on the judge list opens the judge link
- **THEN** the system denies editing access and the interface shows an access-denied warning

#### Scenario: Signed-out visitor opens the judge link
- **WHEN** a visitor who is not signed in opens the judge link
- **THEN** the system does not grant editing access and directs the visitor to sign in

### Requirement: Restrict table modification
The system SHALL allow only the table's owner and its authorized judges to modify a table (its columns, participants, and scores); every other visitor MAY only view it.

#### Scenario: Owner modifies the table
- **WHEN** the owner submits a change to the table
- **THEN** the system applies the change

#### Scenario: Authorized judge modifies the table
- **WHEN** an authorized judge submits a change to the table
- **THEN** the system applies the change

#### Scenario: Signed-in unauthorized user modifies the table
- **WHEN** a signed-in user who is neither the owner nor an authorized judge submits a change
- **THEN** the system rejects the request with a forbidden response and applies no change

#### Scenario: Anonymous visitor modifies the table
- **WHEN** a visitor who is not signed in submits a change
- **THEN** the system rejects the request with an unauthorized response and applies no change
