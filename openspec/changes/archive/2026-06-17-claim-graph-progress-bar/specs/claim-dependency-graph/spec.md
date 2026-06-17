## ADDED Requirements

### Requirement: Provisioning Progress Bar
The claim details view SHALL calculate the overall provisioning completion progress by traversing the claim dependency tree (calculating the ratio of nodes with a `Ready` condition status of `True` to the total number of nodes in the tree), and render a highly visible progress bar above the claim graph.

#### Scenario: Visualizing claim graph progress
- **WHEN** the claim dependency tree is resolved and rendered
- **THEN** the progress bar calculates the percentage of resources in the tree that have `Ready` condition status of `True`
- **THEN** it renders the completion rate (e.g. "3 / 5 Resources Ready") and percentage (e.g. "60%") in a dedicated visual panel
- **THEN** it fills the progress track with an emerald gradient if 100% completed, or a blue/indigo gradient if provisioning is still in progress
