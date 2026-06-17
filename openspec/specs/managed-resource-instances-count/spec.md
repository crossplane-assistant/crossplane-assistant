# managed-resource-instances-count Specification

## Purpose
TBD - created by archiving change managed-resource-instances-count. Update Purpose after archive.
## Requirements
### Requirement: Concurrent Backend Instance Counting with Semaphore Limit
The backend system SHALL concurrently fetch the list of instances for each active Managed Resource Kind and count both the total instances and the ready instances. The backend MUST limit concurrent requests to a maximum of 10 concurrent queries to prevent API server overload.

#### Scenario: Listing kinds with active instances
- **WHEN** the backend processes active kinds (e.g. GCP Topic and GCP Subscription)
- **THEN** it executes concurrent dynamic listing calls bounded by a semaphore, and returns their `TotalItems` and `ReadyItems` counts in the API response

### Requirement: Aggregated Active Instances Sidebar Badge
The frontend sidebar explorer navigation badge for Managed Resources SHALL show the aggregated sum of all active resource instances across all kinds, and display warning/unready status badges if any instances are unhealthy.

#### Scenario: Displaying sidebar badge for multiple active resources
- **WHEN** there are 3 active GCP Topic instances (2 ready) and 1 active Kubernetes Object instance (1 ready)
- **THEN** the sidebar displays a badge with total count `4` and a warning status showing `3/4` ready instances

### Requirement: Dropdown Option labels showing Active Counts
The Managed Resources list view shall replace the category selection dropdown with a Split-Pane Kinds Explorer sidebar. The sidebar SHALL display the total active instances and readiness counts inline next to each kind name in the list.

#### Scenario: Viewing the Kinds Explorer sidebar list
- **WHEN** the user browses the Kinds Explorer sidebar
- **THEN** kinds with active instances show labels/badges like `Topic (3 active, 2/3 ready)` or `Object (1 active, 1/1 ready)`, while empty kinds show `Bucket (0 active)`

