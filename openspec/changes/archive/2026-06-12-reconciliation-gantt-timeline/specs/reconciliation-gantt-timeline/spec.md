## ADDED Requirements

### Requirement: Stateless Telemetry Average Endpoint
The backend API SHALL expose a GET `/api/v1/telemetry/average` endpoint that parses `apiVersion` and `kind` parameters, lists all matching cluster-wide resources dynamically, and calculates the average time-to-ready duration.

#### Scenario: Successfully calculating average duration
- **WHEN** a GET request is made with valid `apiVersion` and `kind` parameters
- **THEN** the backend lists all instances of that resource, extracts their `Ready=True` transition times and `creationTimestamp`s, calculates the arithmetic average, and returns a JSON payload containing the average in seconds and the sample size.

### Requirement: Provisioning Gantt Chart Component
The frontend SHALL render a modern, responsive Gantt-style timeline displaying the sequential creation and provisioning of all resources within the Claim tree.

#### Scenario: Rendering timeline for a Claim tree
- **WHEN** the user selects the "Timeline" tab
- **THEN** the system renders a vertical list of all resources in the tree ordered by their `metadata.creationTimestamp`
- **THEN** the chart uses a common timeline scale starting at the Claim's creation time and ending at either the latest ready time or current time.

### Requirement: Separation of Dependency Waiting and Active Provisioning
Each resource bar in the Gantt chart SHALL visually distinguish the time spent waiting for upstream dependencies from the time spent actively provisioning in the cloud.

#### Scenario: Separating phases on resource timeline bar
- **WHEN** a resource bar is rendered
- **THEN** the wait phase (from Claim creation to resource creation) is rendered with a smooth sliding diagonal hachure background
- **THEN** the active provisioning phase (from resource creation to Ready transition) is rendered with a solid gradient (emerald for Ready, pulsating amber for provisioning in-progress)

### Requirement: Cluster-Wide Average Comparison
The Gantt chart SHALL query the backend telemetry endpoint for each unique resource kind in the tree, cache the averages, and display a visual benchmark comparison on the timeline.

#### Scenario: Rendering benchmark comparison markers
- **WHEN** a resource timeline bar is rendered and the cluster average is loaded
- **THEN** a vertical indigo marker is overlayed on the bar representing the cluster-wide average provisioning time
- **THEN** hovering over the row displays a glassmorphism tooltip showing the precise active provisioning duration, the cluster-wide average, and the performance delta (e.g., `-15s` or `+1m`)
