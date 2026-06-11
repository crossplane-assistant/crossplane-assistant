## MODIFIED Requirements

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
