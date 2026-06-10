## Purpose

This capability defines the standardized explorer list component, dynamic managed resource exploration, and resource deletion actions for porting the remaining views from Angular to React in the Crossplane Assistant user interface.

## Requirements

### Requirement: Standardized Explorer List Component
The system SHALL provide a reusable `<ResourceListView>` component that renders search filters, a details slider, and interactive status markers.

#### Scenario: Launching Detail Drawer
- **WHEN** the user clicks on any row in the explorer list
- **THEN** a sliding panel displays with the View, Manifest, and Event tabs.

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
