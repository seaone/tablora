# table-sharing Specification

## Purpose
Provides the two access links and QR codes an organizer shares after creating a table, one for judges to enter scores and one for spectators to view live results.

## Requirements

### Requirement: Judge and spectator access links
The system SHALL provide two distinct access links for a table: a judge link for entering and updating scores, and a spectator link for viewing results.

#### Scenario: Access links are generated
- **WHEN** an organizer opens the share view for a table
- **THEN** the system presents a judge link and a spectator link, each distinct and specific to the table

### Requirement: QR codes for access links
The system SHALL render a scannable QR code for each access link so that judges and spectators can open the link from their phones.

#### Scenario: QR codes are shown
- **WHEN** an organizer opens the share view for a table
- **THEN** a QR code is displayed for the judge link and a QR code for the spectator link

### Requirement: Copy access link
The system SHALL allow the organizer to copy each access link to the clipboard.

#### Scenario: Copy a link
- **WHEN** the organizer activates the copy action on a link
- **THEN** the link is copied to the clipboard and the interface indicates the copy succeeded

### Requirement: Anonymous spectator viewing
The system SHALL allow anyone with the spectator link to view a table and receive its live updates without signing in.

#### Scenario: View without signing in
- **WHEN** a visitor opens the spectator link without signing in
- **THEN** the system shows the table and keeps it updated live

### Requirement: Authenticated judge access
The system SHALL require a visitor to sign in and to be the table's owner or an authorized judge before the judge link grants editing access.

#### Scenario: Authorized user opens the judge link
- **WHEN** a signed-in owner or authorized judge opens the judge link
- **THEN** the system shows the editing interface for the table

#### Scenario: Unauthorized visitor opens the judge link
- **WHEN** a visitor who is not signed in, or is signed in but is neither the owner nor an authorized judge, opens the judge link
- **THEN** the system denies editing access and shows an access-denied warning
