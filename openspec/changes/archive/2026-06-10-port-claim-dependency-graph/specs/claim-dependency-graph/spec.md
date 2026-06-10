## ADDED Requirements

### Requirement: Navigating to Claim Graph
The claim list view SHALL include a "Graph" column containing an interactive link to navigate to the specific Claim's graph details screen.

#### Scenario: Navigating from List to Graph
- **WHEN** the user is on the claims list page and clicks the "Graph" icon for a claim
- **THEN** the user is redirected to the claim details page at `/explore/claims/:ref` where `:ref` is the encoded resource reference

### Requirement: Fetching and Rendering Claim Dependency Graph
The claim details view SHALL fetch the claim details and its tree representation, and recursively render them as a horizontal interactive tree of resources.

#### Scenario: Loading and rendering claim details page
- **WHEN** the user visits `/explore/claims/:ref`
- **THEN** the system fetches claim details from `/crossplane/claims/:ref` and the tree from `/crossplane/claims/:ref/tree`
- **THEN** the system recursively renders the tree using ClaimGraphNode components connected by visual lines

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
Clicking a node in the graph SHALL open a sliding drawer showing details of the selected resource divided into three tabs: Manifest, Template, and Events.

#### Scenario: Clicking a node in the graph
- **WHEN** the user clicks on a node in the dependency graph
- **THEN** a sliding drawer opens showing the selected resource's name and type
- **THEN** the Manifest tab displays the resource's manifest in a Monaco YAML editor with the metadata's managedFields removed
- **THEN** the Template tab displays the composition revision resource template in Monaco if available
- **THEN** the Event tab displays the live events retrieved from Kubernetes
