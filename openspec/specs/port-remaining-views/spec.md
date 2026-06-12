## Purpose

This capability defines the standardized explorer list component, dynamic managed resource exploration, and resource deletion actions for porting the remaining views from Angular to React in the Crossplane Assistant user interface.
## Requirements
### Requirement: Standardized Explorer List Component
All explorer lists, including Compositions, SHALL utilize the shared `<ResourceListView>` component to render search filters, page headers, a details drawer, and interactive status markers. The sliding details drawer SHALL support dismissal via close buttons, clicking on a semi-transparent backdrop overlay, or pressing the keyboard Escape key. The component SHALL safely handle null or undefined data arrays, displaying an empty table row without crashing the React application.

#### Scenario: Launching detail drawer
- **WHEN** the user clicks on any row in the explorer list
- **THEN** a sliding panel displays with a backdrop overlay, showing the View, Manifest, and Event tabs.

#### Scenario: Closing list drawer via backdrop click
- **WHEN** the user clicks on the backdrop overlay surrounding the list drawer
- **THEN** the sliding details panel closes and state is reset to null

#### Scenario: Closing list drawer via Escape key
- **WHEN** the user presses the Escape key on the keyboard
- **THEN** the sliding details panel closes and state is reset to null

#### Scenario: Gracefully handling null data array
- **WHEN** the resource list component receives a null or undefined data array from the API
- **THEN** the system renders a clean table row showing "No <resource> found" and does not throw React rendering exceptions

### Requirement: Dynamic Managed Resource Exploration
The system SHALL dynamically fetch available Managed Resource kinds and filter the active resource list on selection change.

#### Scenario: Selecting a Managed Resource Kind
- **WHEN** the user selects "AWS Bucket" from the managed resource drop-down list
- **THEN** the system fetches and lists all active AWS Bucket resources in the cluster.

### Requirement: Resource Deletion Action
The system SHALL support deleting any explored resource from the cluster directly via the sliding details drawer.

#### Scenario: Deleting a Provider
- **WHEN** the user clicks "Delete" on an active provider sliding drawer
- **THEN** a confirmation prompt triggers and the system executes a DELETE api call.

