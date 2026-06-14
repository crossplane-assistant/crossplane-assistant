## Context

Currently, the `CompositionWorkspace.tsx` allows users to explore the static definition of a Composition and its Pipeline steps, but they cannot test it. To test, they must create a real Claim in a Kubernetes cluster, wait for Crossplane to render it, and debug via kubectl if something goes wrong. We want to implement a Dry-Run Sandbox mode that performs this rendering step locally or via a mock API.

## Goals / Non-Goals

**Goals:**
- Provide a split-screen "Sandbox" mode in the UI (`CompositionWorkspace.tsx`) accessible via URL query params (`?selected=sandbox`).
- Generate a Dummy Claim YAML using the OpenAPI schema (`GetSchema` in `schema/service.go`) for the associated composite type (XRD).
- Expose a `POST /crossplane/sandbox/render` endpoint that accepts a dummy claim YAML and composition YAML, and returns the rendered Managed Resources.
- Display rendering errors and linter outputs back in the UI.

**Non-Goals:**
- Completely rewriting the `crossplane` rendering engine in Go. We will favor a Hybrid execution model leveraging the `crossplane` CLI binary if available.

## Decisions

### Decision 1: Hybrid Backend Rendering Engine
- **Decision**: The Go backend will expose `POST /crossplane/sandbox/render`. It will first check if the `crossplane` CLI binary is available on the system `PATH`.
  - **Option A (CLI available)**: It writes the incoming Claim and Composition YAMLs to temporary files and executes `crossplane beta render claim.yaml composition.yaml`. It captures stdout (the rendered JSON/YAML stream) and stderr (errors/diagnostics) and returns them.
  - **Option B (CLI not available)**: It returns an explicit error explaining that local rendering requires the Crossplane CLI to be installed, providing a link to installation docs. *Rationale*: Re-implementing `beta render` with full function runner support (Docker/gRPC) in pure Go is too complex and brittle compared to wrapping the official tool.

### Decision 2: OpenAPI Dummy Claim Generation Algorithm
- **Decision**: We will extend `internal/crossplane/innervision/schema/service.go` (or add a new utility) to recursively parse a `v1.JSONSchemaProps` object.
  - It will generate the `apiVersion` and `kind` based on the XRD.
  - It will traverse `spec.properties` (or the root properties).
  - For `required` fields, it will generate a stub key-value pair with a placeholder or default value.
  - For optional fields, it will generate commented-out YAML lines `# fieldName: value` with their description as a preceding comment.

### Decision 3: Sandbox Split-Screen Layout
- **Decision**: The UI will reuse `CompositionWorkspace.tsx`. When `selected=sandbox`, the main pane is split into two halves:
  - **Left (Input)**: Two tabs or a stacked view of Monaco editors containing the Dummy Claim and the Composition.
  - **Right (Output)**: A "Render" button that calls the backend, followed by a read-only Monaco editor displaying the raw rendered resources and a Diagnostics panel for errors.

## Risks / Trade-offs

- **[Risk] Crossplane CLI dependency** → *Mitigation*: Graceful degradation in the UI. If the backend reports `cli_available: false`, show a beautiful Empty State with instructions on how to install the CLI or mount it in the Docker container.
- **[Risk] Complex function runtimes** → *Mitigation*: `crossplane beta render` handles Docker-based function runners automatically, but this assumes the environment running the Assistant API has access to a Docker daemon. We will document this requirement.
