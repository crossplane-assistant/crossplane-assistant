## MODIFIED Requirements

### Requirement: Dynamic Main Workspace Pane
The Composition Workspace SHALL provide a navigation sidebar to inspect pipelines, composed resources, active claims, and a new option to enter Sandbox mode or Visual Canvas mode. The main view pane SHALL share a unified state manager so that transitions between textual editing (Monaco), visual editing (Canvas), and Sandbox simulation happen seamlessly without data loss.

#### Scenario: Navigating to the Sandbox mode
- **WHEN** the user selects the "Sandbox Playpen" node in the tree navigation or clicks the header action
- **THEN** the URL is updated to `?selected=sandbox`
- **THEN** the main view pane splits into an Input section (with Dummy Claim and Composition editors) and an Output section (Rendered Resources and Diagnostics)

#### Scenario: Initializing the Sandbox View
- **WHEN** the Sandbox mode is rendered for the first time
- **THEN** the Dummy Claim editor is pre-populated automatically via the Dummy Claim YAML Generation algorithm
- **THEN** the Composition editor is pre-populated with the actual live YAML of the current Composition
- **THEN** a "Render / Simulate" action button is available to submit the payload to the backend

#### Scenario: Navigating to the Canvas mode
- **WHEN** the user selects the "Visual Canvas" toggle in the header action
- **THEN** the URL is updated to `?view=canvas`
- **THEN** the textual Monaco editor is replaced (or split) with the React Flow Canvas representation of the current Composition YAML state
