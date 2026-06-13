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
The right-hand main viewing pane SHALL react to the selected node in the navigation tree. It SHALL render full-width Monaco editors for raw YAML inputs, full-width Data Flow and Dependency tabs for composed resources, and action summaries for selected Claims.

#### Scenario: Inspecting a Pipeline Step Configuration
- **WHEN** the user selects a "Config" node under a Pipeline Step
- **THEN** the main pane displays the raw YAML input configuration in a full-height, full-width Monaco editor

#### Scenario: Inspecting a Composed Resource
- **WHEN** the user selects a Composed Resource node
- **THEN** the main pane displays the resource details, spreading the "Data Flow" and "Dependencies" tabs across the full available width for optimal readability

#### Scenario: Inspecting an Active Claim
- **WHEN** the user selects an Active Claim node
- **THEN** the main pane displays a summary of the Claim's health status and provides prominent action buttons to open its interactive dependency graph or Gantt timeline

