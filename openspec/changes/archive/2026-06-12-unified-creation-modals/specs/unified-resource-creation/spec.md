## ADDED Requirements

### Requirement: Unified Create Action Button
The system SHALL provide a unified "+" (Create) action button on all resource list pages in the explorer (Claims, Compositions, XRDs, Providers, Functions, Managed Resources). This button SHALL be styled consistently, aligned in the top right corner of the page header, and launch the unified creation modal.

#### Scenario: Displaying create button
- **WHEN** the user navigates to any list explorer page (e.g. Claims or Compositions)
- **THEN** a standard blue "+ Create <Resource>" button is visible in the top-right corner of the page header.

### Requirement: Unified Monaco YAML Creation Modal
The system SHALL display a unified modal dialog when the user clicks the creation button. The modal MUST contain an interactive Monaco Editor displaying a valid default YAML template corresponding to the current resource type, and allow manual editing of the manifest.

#### Scenario: Launching creation modal with template
- **WHEN** the user clicks the "+ Create Claim" button on the Claims page
- **THEN** a modal overlay opens displaying a Monaco YAML editor pre-filled with a sample composite database instance template.

#### Scenario: Closing creation modal via Close or Cancel
- **WHEN** the user clicks the Close icon (X) or the Cancel button in the creation modal
- **THEN** the modal is dismissed and any uncommitted edits are discarded.

### Requirement: Unified Mock Resource Creation Alert
The system SHALL process the user's YAML input when the "Create" button is clicked inside the modal. For this explorer layout prototype, the system SHALL display a success notification/alert confirming that the resource has been successfully created (mocked), and automatically close the modal.

#### Scenario: Clicking Create in modal
- **WHEN** the user clicks the "Create" button in the YAML creation modal
- **THEN** the system displays a success notification alert and closes the modal.
