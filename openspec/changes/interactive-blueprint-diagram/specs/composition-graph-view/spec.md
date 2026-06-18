## MODIFIED Requirements

### Requirement: Interactive Composition Graph
The workspace main pane SHALL render an interactive canvas utilizing React Flow (the "Composition Graph") at the top. The graph SHALL represent the Composition's structure visually by connecting GVK, step, and resource nodes with animated execution flow edges. The graph SHALL support panning, zooming, and a minimap for navigation. Each node in the graph SHALL be interactive, and clicking a node SHALL update the active workspace selection and query parameters (e.g. `?selected=resource:RDSInstance`).

#### Scenario: Interacting with the Composition Graph Nodes
- **WHEN** the user is in the Composition Workspace and clicks on a Composed Resource node in the graph
- **THEN** the application updates the URL query parameter `?selected=resource:<name>`
- **THEN** the selection in the left-hand tree nav and the details pane below synchronize instantly to focus on that resource

#### Scenario: Zooming and Panning the Composition Graph
- **WHEN** the user is in the Composition Workspace and interacts with the graph canvas
- **THEN** they can zoom using the mouse wheel / controls and pan by dragging the background grid
- **THEN** the canvas displays a dot-grid background and a mini-navigation map at the bottom corner for rapid navigation.