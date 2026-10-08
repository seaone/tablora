# Spec Delta

## REMOVED Requirements

### Requirement: Open access without authentication
**Reason**: The judge link no longer grants editing access to anyone who has it. Editing is now restricted to the table's owner and authorized judges, so the blanket guarantee that anyone with a link can edit a table no longer holds. Anonymous access is retained for viewing only.

**Migration**: Spectator viewing stays anonymous (see the added "Anonymous spectator viewing" requirement). Owners and judges must sign in with Yandex ID and be authorized (see the added "Authenticated judge access" requirement and the `judge-authorization` capability).

## ADDED Requirements

### Requirement: Anonymous spectator viewing
The system SHALL allow anyone with the spectator link to view a table and receive its live
updates without signing in.

#### Scenario: View without signing in
- **WHEN** a visitor opens the spectator link without signing in
- **THEN** the system shows the table and keeps it updated live

### Requirement: Authenticated judge access
The system SHALL require a visitor to sign in and to be the table's owner or an authorized
judge before the judge link grants editing access.

#### Scenario: Authorized user opens the judge link
- **WHEN** a signed-in owner or authorized judge opens the judge link
- **THEN** the system shows the editing interface for the table

#### Scenario: Unauthorized visitor opens the judge link
- **WHEN** a visitor who is not signed in, or is signed in but is neither the owner nor an authorized judge, opens the judge link
- **THEN** the system denies editing access and shows an access-denied warning
