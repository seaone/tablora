# my-tables Specification

## Purpose
Lets a signed-in user find and return to the tables they own and the tables they are
authorized to judge, without keeping every QR link.

## Requirements

### Requirement: Tables directory
The system SHALL let a signed-in user retrieve, in a single result, the tables they own
and the tables they are authorized to judge, labeling each entry with the caller's role
for that table.

#### Scenario: Owned tables are listed
- **WHEN** a signed-in user requests their tables
- **THEN** every table they own is included, labeled as owner

#### Scenario: Judged tables are listed
- **WHEN** a signed-in user whose email is on a table's authorized judges requests their tables
- **THEN** that table is included, labeled as judge

#### Scenario: Owned and judged tables share one result
- **WHEN** a signed-in user owns some tables and judges others
- **THEN** both sets appear in the same result, each with its role

#### Scenario: Unrelated tables are excluded
- **WHEN** a signed-in user requests their tables
- **THEN** tables they neither own nor judge are not included

### Requirement: Authentication required for the directory
The system SHALL require a signed-in user to retrieve the directory and SHALL reject
anonymous requests.

#### Scenario: Anonymous request rejected
- **WHEN** a visitor who is not signed in requests the directory
- **THEN** the system rejects the request with an unauthorized response

#### Scenario: Signed-out visitor opens the page
- **WHEN** a visitor who is not signed in opens the my-tables page
- **THEN** the interface prompts them to sign in instead of showing a table list

### Requirement: Role filter
The interface SHALL let the user filter the directory by role — all, owner, or judge —
showing only the entries that match the selected role.

#### Scenario: Filter by owner
- **WHEN** the user selects the owner filter
- **THEN** only the tables they own are shown

#### Scenario: Filter by judge
- **WHEN** the user selects the judge filter
- **THEN** only the tables they judge are shown

#### Scenario: Show all roles
- **WHEN** the user selects the all filter
- **THEN** both the owned and the judged tables are shown

### Requirement: Directory entry details and navigation
The system SHALL show, for each listed table, its title, description, created date, and
role badge, and SHALL provide on each entry an edit control that opens that table's judge
page.

#### Scenario: Entry shows its details
- **WHEN** the directory lists a table
- **THEN** the entry shows its title, description, created date, and role badge

#### Scenario: Entry edit control opens the judge page
- **WHEN** the user activates a table entry's edit control
- **THEN** the interface opens that table's judge page (`/t/:id/edit`)

#### Scenario: Empty directory
- **WHEN** a signed-in user with no owned or judged tables opens the page
- **THEN** the interface shows an empty state inviting them to create a table

### Requirement: Account menu entry point
The system SHALL present a signed-in user's account as a menu whose trigger is an icon
button (labeled with the user's name for assistive technology), containing the user's
name and email, "Мои таблицы", and "Выйти", where the former opens the tables directory
and the latter signs the user out.

#### Scenario: Open the directory from the account menu
- **WHEN** a signed-in user chooses "Мои таблицы" in the account menu
- **THEN** the interface opens the my-tables page

#### Scenario: Sign out from the account menu
- **WHEN** a signed-in user chooses "Выйти" in the account menu
- **THEN** the session ends and the user is signed out

#### Scenario: Icon-only account trigger
- **WHEN** a signed-in user views the account menu trigger
- **THEN** it is an icon button labeled with the user's name, rather than the name shown as text in the header

#### Scenario: Signed-out visitor
- **WHEN** the visitor is not signed in
- **THEN** the header shows a sign-in action instead of the account menu
