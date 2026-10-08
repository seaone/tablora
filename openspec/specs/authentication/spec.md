# authentication Specification

## Purpose
Lets organizers and judges sign in to Tablora with their Yandex ID account and keeps the signed-in identity available to the rest of the application, without a separate Tablora password.

## Requirements

### Requirement: Sign in with Yandex ID
The system SHALL allow a visitor to sign in through Yandex ID (OAuth 2.0 / OpenID Connect) without creating a Tablora password, obtaining the user's identity from Yandex.

#### Scenario: Successful sign-in
- **WHEN** a visitor starts sign-in and authorizes the application at Yandex
- **THEN** the system establishes an authenticated session and recognizes the visitor as that user

#### Scenario: User declines authorization
- **WHEN** the visitor does not authorize the application at Yandex
- **THEN** the system does not establish a session and the visitor remains signed out

#### Scenario: Provider error or invalid response
- **WHEN** Yandex returns an error, an invalid authorization code, or a response missing the user's identity
- **THEN** the system does not establish a session and informs the visitor that sign-in failed

### Requirement: Session persistence
The system SHALL keep a signed-in user authenticated across page reloads using a session that the system can revoke server-side.

#### Scenario: Session survives a reload
- **WHEN** a signed-in user reloads the page or reopens the application before the session ends
- **THEN** the system still recognizes the user as signed in

#### Scenario: Expired or revoked session
- **WHEN** a user's session has expired or been revoked
- **THEN** the system treats the user as signed out

### Requirement: Current user identity
The system SHALL expose whether the current visitor is signed in and, when signed in, the user's identity.

#### Scenario: Read the current user when signed in
- **WHEN** the current user's identity is requested for a signed-in visitor
- **THEN** the system returns the user's identifier, email, and display name

#### Scenario: Read the current user when signed out
- **WHEN** the current user's identity is requested for a visitor who is not signed in
- **THEN** the system reports that no user is signed in

### Requirement: Sign out
The system SHALL allow a signed-in user to sign out, ending their session.

#### Scenario: Sign out
- **WHEN** a signed-in user signs out
- **THEN** the session ends and subsequent requests from that visitor are treated as signed out

### Requirement: Stable user identity
The system SHALL identify a user by their Yandex ID account, so the same Yandex account always maps to the same Tablora user and never creates a duplicate.

#### Scenario: Returning user
- **WHEN** a user signs in again with a Yandex account that has signed in before
- **THEN** the system reuses the existing user rather than creating a duplicate

#### Scenario: First-time user
- **WHEN** a user signs in with a Yandex account that has not signed in before
- **THEN** the system creates a new user for that account
