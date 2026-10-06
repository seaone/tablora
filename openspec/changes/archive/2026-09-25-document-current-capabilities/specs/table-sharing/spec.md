# Spec Delta

## Purpose

Provides the two access links and QR codes an organizer shares after creating a table, one for judges to enter scores and one for spectators to view live results.

## ADDED Requirements

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

### Requirement: Open access without authentication
The system SHALL allow anyone with a link to access and edit the table, with no authentication required.

#### Scenario: Access without login
- **WHEN** a user opens the judge or spectator link for a table
- **THEN** the system grants access without requiring any login or credentials
