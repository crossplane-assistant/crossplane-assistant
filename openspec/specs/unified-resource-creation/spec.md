# unified-resource-creation Specification

## Purpose
TBD - created by archiving change unified-creation-modals. Update Purpose after archive.
## Requirements
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
The system SHALL process the user's YAML input when the "Create" button is clicked inside the modal. Instead of a mocked alert, the system MUST invoke the corresponding backend POST API endpoint (with the raw YAML content as the request body) to create the resource in the cluster. It SHALL handle loading states, catch any API/validation errors to display them within the modal without closing it, and invalidate the respective React Query list on successful creation.

#### Scenario: Successful live resource creation
- **WHEN** the user clicks the "Create" button with valid YAML in the creation modal
- **THEN** the system SHALL disable the "Create" button, send a POST request with the raw YAML to the backend, display a success alert, close the modal, and refresh the active resource list.

#### Scenario: Failed live resource creation with error
- **WHEN** the user clicks the "Create" button with invalid YAML or if the backend returns an error
- **THEN** the system SHALL attempt the POST request, catch the backend error, display the error message in the modal, keep the modal open, and re-enable the "Create" button so the user can correct their input.

