## ADDED Requirements

### Requirement: Interactive Kinds Search and Text Filtering
The Kinds Explorer sidebar MUST include a search input that dynamically filters the listed resource Kinds.

#### Scenario: Search matching Kind name
- **WHEN** the user types "bucket" in the search input
- **THEN** the Kinds Explorer lists only kinds containing "bucket" (case-insensitive) in their kind name or API group

### Requirement: Quick Health and Activity Filters
The Kinds Explorer sidebar MUST support three filter tabs: "All", "Active", and "Unhealthy" (or "Anomalies") to filter kinds instantly based on their instance count and health status.

#### Scenario: Filtering for active kinds
- **WHEN** the user selects the "Active" filter tab
- **THEN** the explorer lists only Kinds that have `totalItems > 0`

#### Scenario: Filtering for unhealthy kinds
- **WHEN** the user selects the "Unhealthy" filter tab
- **THEN** the explorer lists only Kinds where `readyItems < totalItems` and `totalItems > 0`

### Requirement: Collapsible Provider Grouping
The Kinds Explorer sidebar MUST group resource Kinds visually by their Provider (e.g. AWS, GCP, Azure, Kubernetes, Helm), with each provider group being a collapsible accordion.

#### Scenario: Collapsing provider group
- **WHEN** the user clicks the "AWS Provider" accordion header
- **THEN** the AWS Kinds are collapsed and hidden from view, leaving only GCP and other providers visible

### Requirement: Initial Selection of Active or Unhealthy Kind
Upon landing on the Managed Resources view without explicit kind parameters in the URL, the system SHALL automatically select the first Kind that has active resources (specifically an unhealthy kind if any exist, otherwise any active kind) to ensure the table does not load empty.

#### Scenario: Automatic selection on load
- **WHEN** the user lands on the Managed Resources screen and active resources exist in the cluster
- **THEN** the system automatically selects the first active/unready kind and populates the details table, updating the URL to match
