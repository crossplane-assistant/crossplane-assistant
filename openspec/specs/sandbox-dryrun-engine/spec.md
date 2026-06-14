# sandbox-dryrun-engine Specification

## Purpose
TBD - created by archiving change sandbox-dryrun-engine. Update Purpose after archive.
## Requirements
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

#### Scenario: Modern rendering via CLI
- **WHEN** the backend receives a render request and the modern `crossplane composition render` command is supported by the installed CLI
- **THEN** the backend executes `crossplane composition render` with the provided files
- **THEN** it returns the standard output stream (rendered resources) and the error stream (diagnostics) to the frontend

#### Scenario: Legacy rendering fallback via CLI
- **WHEN** the backend receives a render request and the modern `crossplane composition render` command is NOT supported (but legacy `crossplane beta render` is)
- **THEN** the backend falls back and executes `crossplane beta render` with the provided files
- **THEN** it returns the standard output stream (rendered resources) and the error stream (diagnostics) to the frontend

#### Scenario: Graceful fallback when CLI missing
- **WHEN** the backend receives a render request and the `crossplane` CLI is NOT available at all
- **THEN** the backend SHALL return a structured response indicating `cli_available: false` and a helpful message

### Requirement: Composition GET/LIST GVK Fields Restoration
The backend GET and LIST endpoints for Compositions SHALL explicitly restore the `apiVersion` and `kind` fields in the returned JSON, preventing client-go GVK erasure from affecting frontend consumers.

#### Scenario: Fetch single Composition with GVK
- **WHEN** the frontend requests a single Composition via `GET /crossplane/compositions/:name`
- **THEN** the returned JSON MUST contain `apiVersion: "apiextensions.crossplane.io/v1"` and `kind: "Composition"` at the root level, regardless of client-go erasure behavior

### Requirement: Automatic Pipeline Functions Detection and Generation
When rendering a Composition with `spec.mode: Pipeline`, the backend SHALL parse the unique function names, generate a temporary `functions.yaml` containing the function pkg definitions, and supply it to the render command.

#### Scenario: Render pipeline Composition
- **WHEN** the backend receives a render request for a Composition utilizing the `Pipeline` mode
- **THEN** the backend parses the pipeline functions, generates a valid `functions.yaml` file, and executes the CLI render command with the claim, composition, and functions files as arguments

