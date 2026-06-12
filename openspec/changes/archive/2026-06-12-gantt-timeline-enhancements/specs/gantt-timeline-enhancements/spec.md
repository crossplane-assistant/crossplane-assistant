## ADDED Requirements

### Requirement: Synced vs Ready Phase Separation
The Gantt chart SHALL segment the active provisioning bar of each resource into a `Synced` segment (representing Crossplane synchronization) and a `Ready` segment (representing physical infrastructure creation).

#### Scenario: Rendering Synced and Ready segments
- **WHEN** the active provisioning segment is rendered for a node
- **THEN** the system reads `.status.conditions[Synced].lastTransitionTime` to mark the boundary of the Synced block
- **THEN** the system reads `.status.conditions[Ready].lastTransitionTime` to mark the boundary of the Ready block

### Requirement: Interactive Kubernetes Event Pins
The Gantt chart SHALL overlay live Kubernetes events as small circular pins directly on each resource's bar, with Warnings clearly highlighted.

#### Scenario: Rendering Warning event pins on row
- **WHEN** a resource has active Warning events in its Kubernetes history
- **THEN** the system overlays a red pulsating dot on the timeline bar corresponding to the event's relative timestamp
- **THEN** hovering over the dot displays a glassmorphism card detailing the Warning reason and message

### Requirement: Dependency Highlighting on Hover
Hovering over any row in the Gantt chart SHALL automatically highlight its upstream parent and downstream child connections in the list.

#### Scenario: Hovering over a row to highlight dependencies
- **WHEN** the user hovers over a resource row
- **THEN** the parent resource and children resources in the list are highlighted with subtle background borders to show dependency paths

### Requirement: Friction Protection Guardians
The Gantt timeline SHALL implement robust defensive math and caching logic to protect against clocks skew, missing conditions, or high event volumes.

#### Scenario: Guarding against negative timing values due to clock skew
- **WHEN** a relative timeline offset calculation returns a negative value due to client/cluster clock differences
- **THEN** the system clamps the value to 0 to prevent CSS width rendering failures
