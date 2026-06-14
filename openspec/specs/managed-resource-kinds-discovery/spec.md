# managed-resource-kinds-discovery Specification

## Purpose
TBD - created by archiving change fix-managed-resources-kinds-listing. Update Purpose after archive.
## Requirements
### Requirement: Support CustomResourceDefinition and ManagedResourceDefinition in Kind Discovery
The backend system SHALL retrieve Managed Resource Kinds from active ProviderRevisions by recognizing and parsing object references with `Kind` set to either `CustomResourceDefinition` or `ManagedResourceDefinition`.

#### Scenario: Discovering kinds from modern Upbound providers using ManagedResourceDefinition
- **WHEN** a provider revision (such as GCP PubSub) defines active object references of kind `ManagedResourceDefinition`
- **THEN** the backend discovers those object references, retrieves their corresponding CustomResourceDefinition specs from the CRD registry, and lists them as Managed Resource Kinds

#### Scenario: Discovering kinds from standard providers using CustomResourceDefinition
- **WHEN** a provider revision defines active object references of kind `CustomResourceDefinition`
- **THEN** the backend discovers those object references, retrieves their corresponding CustomResourceDefinition specs from the CRD registry, and lists them as Managed Resource Kinds

### Requirement: Exclude ClusterProviderConfig and other Configuration Kinds
The backend system SHALL filter out infrastructure-only configuration kinds (specifically `ClusterProviderConfig`, `ProviderConfig`, `ProviderRevision`, `ProviderConfigUsage`, and `ProviderConfigRevision`) from the discovered Managed Resource Kinds list.

#### Scenario: Listing available Managed Resource Kinds
- **WHEN** the backend compiles the list of discovered kinds from active provider revisions
- **THEN** it excludes `ClusterProviderConfig`, `ProviderConfig`, `ProviderRevision`, `ProviderConfigUsage`, and `ProviderConfigRevision` kinds, leaving only actual managed resources

### Requirement: Robust CRD Retrieval with Nil-Pointer Safeguard
The backend system MUST perform a nil-check on the retrieved CustomResourceDefinition object from the CRD registry before accessing its fields, ensuring that missing or unindexed CRDs do not cause backend panic or server errors.

#### Scenario: Provider revision references an unindexed or missing CRD
- **WHEN** a provider revision references an object name that cannot be found in the local CRD registry
- **THEN** the backend gracefully skips the missing definition and continues processing the remaining objects without raising an error or panicking

