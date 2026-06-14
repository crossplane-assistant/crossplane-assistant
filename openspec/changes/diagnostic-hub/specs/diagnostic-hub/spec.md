## ADDED Requirements

### Requirement: Unified Diagnostics API Endpoint
The system SHALL expose an HTTP API endpoint `GET /crossplane/claims/:ref/diagnostics` that aggregates diagnostic data (resource tree, events, and provider logs) for a given Claim reference in a single payload.

#### Scenario: Successful retrieval of diagnostics
- **WHEN** client sends a GET request to `/crossplane/claims/:ref/diagnostics` with a valid, serialized Claim reference
- **THEN** system returns HTTP 200 with a JSON payload containing the resolved resource tree, chronologically sorted events, and correlated provider log streams

### Requirement: Unified Events Timeline
The system SHALL aggregate Kubernetes events for all resources resolved within the Claim's dependency tree and sort them chronologically (newest first).

#### Scenario: Events from multiple resources aggregated
- **WHEN** system fetches diagnostics for a Claim that has associated XR and MR resources, and each has events in the cluster
- **THEN** system returns a flat, chronologically sorted array of all events, identifying the originating resource for each event

### Requirement: Real-Time Provider Log Correlation and Streaming
The system SHALL dynamically discover the active ProviderRevision and controller Pod for each Managed Resource in the tree, stream the latest container logs, and filter them to return only lines containing the MR's name or UID.

#### Scenario: Live provider logs filtered for Managed Resource
- **WHEN** system processes diagnostics for a Managed Resource managed by an active ProviderRevision
- **THEN** system locates the running provider pod, requests the last 500 lines of logs from the primary container, filters the lines to keep only those matching the MR's name or UID, and returns them in the diagnostic payload
