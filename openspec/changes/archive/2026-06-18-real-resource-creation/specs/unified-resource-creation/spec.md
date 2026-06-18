## MODIFIED Requirements

### Requirement: Unified Mock Resource Creation Alert
The system SHALL process the user's YAML input when the "Create" button is clicked inside the modal. Instead of a mocked alert, the system MUST invoke the corresponding backend POST API endpoint (with the raw YAML content as the request body) to create the resource in the cluster. It SHALL handle loading states, catch any API/validation errors to display them within the modal without closing it, and invalidate the respective React Query list on successful creation.

#### Scenario: Successful live resource creation
- **WHEN** the user clicks the "Create" button with valid YAML in the creation modal
- **THEN** the system SHALL disable the "Create" button, send a POST request with the raw YAML to the backend, display a success alert, close the modal, and refresh the active resource list.

#### Scenario: Failed live resource creation with error
- **WHEN** the user clicks the "Create" button with invalid YAML or if the backend returns an error
- **THEN** the system SHALL attempt the POST request, catch the backend error, display the error message in the modal, keep the modal open, and re-enable the "Create" button so the user can correct their input.
