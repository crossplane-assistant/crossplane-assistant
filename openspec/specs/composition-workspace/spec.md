# composition-workspace Specification

## Purpose
TBD - created by archiving change composition-workspace. Update Purpose after archive.
## Requirements
### Requirement: Full-Screen Composition Workspace
The system SHALL provide a dedicated, full-screen route at `/explore/compositions/:name` acting as a "Composition Workspace". This workspace SHALL be divided into a left-hand navigation tree and a right-hand main viewing pane to provide an immersive IDE-like inspection environment for complex Compositions.

#### Scenario: Navigating to the Composition Workspace
- **WHEN** the user clicks "Open Workspace" on a Composition from the list or side panel
- **THEN** the system navigates to `/explore/compositions/:name`
- **THEN** the workspace loads full-screen without side panels

### Requirement: Tree-Based Composition Navigation
The left-hand navigation tree SHALL parse and display the hierarchical structure of the Composition. It SHALL display pipeline steps, their raw input configurations, the composed resources extracted from those steps, and the active Claims utilizing this Composition.

#### Scenario: Viewing the Navigation Tree
- **WHEN** the user is in the Composition Workspace
- **THEN** the left panel displays a hierarchical tree of Pipeline Steps, Resources, and Active Claims
- **THEN** clicking on a tree node updates the URL query parameters (e.g., `?selected=resource:RDSInstance`)

### Requirement: Dynamic Main Workspace Pane
The Composition Workspace SHALL provide a navigation sidebar to inspect pipelines, composed resources, active claims, and a new option to enter Sandbox mode.

#### Scenario: Navigating to the Sandbox mode
- **WHEN** the user selects the "Sandbox Playpen" node in the tree navigation or clicks the header action
- **THEN** the URL is updated to `?selected=sandbox`
- **THEN** the main view pane splits into an Input section (with Dummy Claim and Composition editors) and an Output section (Rendered Resources and Diagnostics)

#### Scenario: Initializing the Sandbox View
- **WHEN** the Sandbox mode is rendered for the first time
- **THEN** the Dummy Claim editor is pre-populated automatically via the Dummy Claim YAML Generation algorithm
- **THEN** the Composition editor is pre-populated with the actual live YAML of the current Composition
- **THEN** a "Render / Simulate" action button is available to submit the payload to the backend

