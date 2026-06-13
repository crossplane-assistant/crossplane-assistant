# composition-graph-view Specification

## Purpose
TBD - created by archiving change composition-workspace. Update Purpose after archive.
## Requirements
### Requirement: Virtual Tree Parsing
The system SHALL parse any `Composition` manifest (supporting both legacy `spec.resources` and modern `spec.pipeline` -> `function-patch-and-transform` step inputs) into a virtual hierarchical JSON tree representing the architectural blueprint of the Composition. Each node in the virtual tree SHALL match the layout of the existing cluster-scoped `ClaimTreeNode` structure, but represent forecasted/template definitions rather than live resources.

#### Scenario: Parsing a Modern Pipeline Composition into a Virtual Tree
- **WHEN** the system parses a Composition manifest that utilizes modern pipeline functions
- **THEN** it generates a root GVK interface node
- **THEN** for each step in `spec.pipeline`, it generates a Step node, and if the step references `function-patch-and-transform`, it generates child nodes for each resource listed in `step.input.resources`

### Requirement: Interactive Composition Graph
The workspace main pane SHALL render a horizontal tree graph (the "Composition Graph") at the top. The graph SHALL represent the Composition's structure visually by connecting GVK, step, and resource nodes with horizontal line connectors. Each node in the graph SHALL be interactive, and clicking a node SHALL update the active workspace selection and query parameters (e.g. `?selected=resource:RDSInstance`).

#### Scenario: Interacting with the Composition Graph Nodes
- **WHEN** the user is in the Composition Workspace and clicks on a Composed Resource node in the graph
- **THEN** the application updates the URL query parameter `?selected=resource:<name>`
- **THEN** the selection in the left-hand tree nav and the details pane below synchronize instantly to focus on that resource

### Requirement: Responsive Collapsible Graph Header
To optimize vertical screen real-estate, the Composition Graph SHALL support collapsible states. When no item is selected, the graph SHALL display in full-height as a welcoming dashboard. When an item is selected, the graph SHALL support collapsing into a compact header row (or collapsible accordion container) to maximize space for code editing and patch details in the panels below.

#### Scenario: Collapsing the Graph on Node Selection
- **WHEN** the user selects a node (step, resource, or claim)
- **THEN** the Composition Graph collapses into a slim, compact height container at the top of the main pane
- **WHEN** the user collapses or expands the graph header manually or clears the selection
- **THEN** the graph resizes accordingly

