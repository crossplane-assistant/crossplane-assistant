## MODIFIED Requirements

### Requirement: Dropdown Option labels showing Active Counts
The Managed Resources list view shall replace the category selection dropdown with a Split-Pane Kinds Explorer sidebar. The sidebar SHALL display the total active instances and readiness counts inline next to each kind name in the list.

#### Scenario: Viewing the Kinds Explorer sidebar list
- **WHEN** the user browses the Kinds Explorer sidebar
- **THEN** kinds with active instances show labels/badges like `Topic (3 active, 2/3 ready)` or `Object (1 active, 1/1 ready)`, while empty kinds show `Bucket (0 active)`
