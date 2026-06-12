## MODIFIED Requirements

### Requirement: Fetching and Rendering Claim Dependency Graph
The claim details view SHALL fetch the claim details and its tree representation, and recursively render them as either a horizontal interactive tree of resources (Graph tab) or an interactive, modern Gantt-style provisioning timeline (Timeline tab).

#### Scenario: Loading and rendering claim details page in Graph view
- **WHEN** the user visits `/explore/claims/:ref`
- **THEN** the system fetches claim details and the tree, defaulting to the "Graph" tab
- **THEN** the system recursively renders the tree using ClaimGraphNode components connected by visual lines

#### Scenario: Switching to the Timeline view
- **WHEN** the user clicks the "Timeline" tab switcher button
- **THEN** the view switches from the interactive tree to the modern, interactive Gantt-style timeline
- **THEN** the timeline displays resource provisioning states (Waiting vs. Active Provisioning) correctly mapped chronologically
