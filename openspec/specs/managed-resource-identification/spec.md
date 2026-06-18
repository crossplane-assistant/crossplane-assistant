# managed-resource-identification Specification

## Purpose
TBD - created by archiving change improve-managed-resource-identification. Update Purpose after archive.
## Requirements
### Requirement: Resource Kind Detail Visibility
The system SHALL surface the full API group and version information for resource kinds in the explorer sidebar to distinguish identical kinds from different providers.

#### Scenario: Viewing the sidebar
- **WHEN** the user views the Managed Resources explorer sidebar
- **THEN** each resource kind button MUST display the `Kind` on the first line
- **THEN** each resource kind button MUST display the `group/version` on the second line

### Requirement: Detail Drawer Context Enrichment
The system SHALL provide immediate visual context in the resource detail drawer by displaying the provider logo, kind, and API group/version alongside the resource name.

#### Scenario: Opening a resource detail
- **WHEN** the user selects a resource to view its details
- **THEN** the sliding drawer header MUST render the provider's logo using `ClaimNodeLogo`
- **THEN** the sliding drawer header MUST display a subtitle containing the `Kind (apiVersion)`

