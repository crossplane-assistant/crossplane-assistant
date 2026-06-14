## ADDED Requirements

### Requirement: Dummy Claim YAML Generation
The system SHALL recursively parse the OpenAPI schema of a Composite Resource Definition (XRD) and return a boilerplate YAML claim.

#### Scenario: Generate dummy claim
- **WHEN** the user opens the Sandbox for a Composition
- **THEN** the system fetches the OpenAPI schema for the corresponding `compositeTypeRef`
- **THEN** it generates a valid dummy YAML including `apiVersion`, `kind`, and `metadata.name`
- **THEN** it fills required `spec.properties` with placeholder values
- **THEN** it adds optional `spec.properties` as commented-out YAML lines

### Requirement: Local Rendering API Endpoint
The Go backend SHALL expose a new endpoint `POST /crossplane/sandbox/render` that accepts a Claim YAML and a Composition YAML and attempts to render the Managed Resources locally.

#### Scenario: Hybrid rendering via CLI
- **WHEN** the backend receives a render request and the `crossplane` CLI is available
- **THEN** the backend executes `crossplane beta render` with the provided files
- **THEN** it returns the standard output stream (rendered resources) and the error stream (diagnostics) to the frontend

#### Scenario: Graceful fallback when CLI missing
- **WHEN** the backend receives a render request and the `crossplane` CLI is NOT available
- **THEN** the backend SHALL return a structured response indicating `cli_available: false` and a helpful message
