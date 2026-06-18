## MODIFIED Requirements

### Requirement: Fetching and Rendering Claim Dependency Graph
The claim details view SHALL fetch the claim details and its tree representation, and recursively render them as either an interactive canvas of resources (Graph tab) utilizing React Flow or an interactive, modern Gantt-style provisioning timeline (Timeline tab). The Graph tab SHALL provide panning, zooming, and a minimap for navigation. The nodes within the canvas SHALL retain all visual metadata (logos, version, age, management policies, status icons) while being positioned via a deterministic horizontal layout algorithm. Edges connecting nodes SHALL animate to represent active provisioning states and display as solid lines for ready states.

#### Scenario: Loading and rendering claim details page
- **WHEN** the user visits `/explore/claims/:ref`
- **THEN** the system fetches claim details from `/crossplane/claims/:ref` and the tree from `/crossplane/claims/:ref/tree`
- **THEN** the system renders an interactive React Flow canvas within the "Graph" tab, transforming the hierarchical tree data into React Flow nodes and edges.
- **THEN** nodes are positioned absolutely using a horizontal layout algorithm ensuring no overlaps.
- **THEN** edges connecting a parent to a child animate dynamically (e.g., flowing blue) if the child resource's `Ready` condition is not `True`, and render as solid lines (e.g., green) when the child is ready.
- **THEN** the user can pan, zoom, and utilize the interactive canvas controls.

#### Scenario: Switching to the Timeline view
- **WHEN** the user clicks the "Timeline" tab switcher button
- **THEN** the view switches from the interactive canvas to the modern, interactive Gantt-style timeline
- **THEN** the timeline displays resource provisioning states (Waiting vs. Active Provisioning) correctly mapped chronologically