# claim-dependency-graph Specification

## Purpose
TBD - created by archiving change port-claim-dependency-graph. Update Purpose after archive.
## Requirements
### Requirement: Navigating to Claim Graph
The claim list view SHALL include a "Graph" column containing an interactive link to navigate to the specific Claim's graph details screen.

#### Scenario: Navigating from List to Graph
- **WHEN** the user is on the claims list page and clicks the "Graph" icon for a claim
- **THEN** the user is redirected to the claim details page at `/explore/claims/:ref` where `:ref` is the encoded resource reference

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

### Requirement: Node Visual Treatment and Fallback
Each node in the dependency graph SHALL render its icon or initials dynamically with a background color deterministic to its Kubernetes Kind.

#### Scenario: Unknown resource kind logo fallback
- **WHEN** a graph node has a resource kind not matching any known provider logo (e.g. `CompositeMySQLInstance`)
- **THEN** it renders a circular badge containing its uppercase initials with a deterministic background and text color based on a hash of its kind

### Requirement: Auto-Reloading Graph State
The claim details view SHALL automatically refetch and reload the graph data every 15 seconds to display the latest live status of resources.

#### Scenario: Auto reload timer triggers refetch
- **WHEN** the user is viewing the claim dependency graph
- **THEN** the system refetches the tree data every 15 seconds and updates the last refresh timestamp on screen

### Requirement: Inspecting Node Details via Drawer
Clicking a node in the graph SHALL open a sliding drawer showing details of the selected resource divided into three tabs: Manifest, Template, and Events. The drawer SHALL support dismissal via close buttons, clicking on a semi-transparent backdrop overlay, or pressing the keyboard Escape key.

#### Scenario: Clicking a node in the graph
- **WHEN** the user clicks on a node in the dependency graph
- **THEN** a sliding drawer opens showing the selected resource's name and type with a backdrop overlay of `z-40` and drawer of `z-50`
- **THEN** the Manifest tab displays the resource's manifest in a Monaco YAML editor with the metadata's managedFields removed
- **THEN** the Template tab displays the composition revision resource template in Monaco if available
- **THEN** the Event tab displays the live events retrieved from Kubernetes

#### Scenario: Closing drawer via backdrop click
- **WHEN** the user clicks on the backdrop overlay surrounding the sliding drawer
- **THEN** the sliding detail drawer closes and state is reset to null

#### Scenario: Closing drawer via Escape key
- **WHEN** the user presses the Escape key on the keyboard
- **THEN** the sliding detail drawer closes and state is reset to null

### Requirement: Provisioning Progress Bar
The claim details view SHALL calculate the overall provisioning completion progress by traversing the claim dependency tree (calculating the ratio of nodes with a `Ready` condition status of `True` to the total number of nodes in the tree), and render a highly visible progress bar above the claim graph.

#### Scenario: Visualizing claim graph progress
- **WHEN** the claim dependency tree is resolved and rendered
- **THEN** the progress bar calculates the percentage of resources in the tree that have `Ready` condition status of `True`
- **THEN** it renders the completion rate (e.g. "3 / 5 Resources Ready") and percentage (e.g. "60%") in a dedicated visual panel
- **THEN** it fills the progress track with an emerald gradient if 100% completed, or a blue/indigo gradient if provisioning is still in progress

