# cross-resource-navigation Specification

## Purpose
TBD - created by syncing change ux-and-stability-improvements. Update Purpose after archive.

## Requirements

### Requirement: Inter-Resource Relationship Navigation
The details drawer of any resource SHALL extract and display links to its related resources.
- A Claim details drawer SHALL display a link to its Composite Resource (XR) using `spec.resourceRef`.
- A Composite Resource (XR) details drawer SHALL display a link to its Claim using `spec.claimRef` and a list of links to its Composed Managed Resources (MRs) using `spec.resourceRefs`.
- A Managed Resource (MR) details drawer SHALL display a link to its parent Composite Resource (XR) using `metadata.ownerReferences` and a link to its ProviderConfig using `spec.providerConfigRef`.
Clicking any relationship link SHALL trigger navigation to that resource and automatically open its sliding drawer detail view.

#### Scenario: Navigating from Managed Resource to parent Composite Resource
- **WHEN** the user is viewing a Managed Resource details drawer and clicks the link to its parent Composite Resource
- **THEN** the system navigates to the Claim Details Graph page or Composite resource details view of that specific resource and highlights it

#### Scenario: Navigating from Composite Resource to composed Managed Resources
- **WHEN** the user is viewing a Composite Resource and clicks a link in the "Composed Resources" list
- **THEN** the system navigates to the Managed Resources list view, filters by the clicked resource's Kind, and automatically opens its sliding details drawer
