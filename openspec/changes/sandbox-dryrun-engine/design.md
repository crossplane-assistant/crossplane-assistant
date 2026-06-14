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
  - **Option A (CLI available)**: It writes the incoming Claim and Composition YAMLs to temporary files.
    - It first attempts to execute the modern GA command: `crossplane composition render claim.yaml composition.yaml`.
    - If that execution returns an error and stderr contains signs of an unrecognized command (such as `unexpected argument beta` or `unknown command` / `unexpected argument`), or if it returns exit code 80/unrecognized, it falls back to the legacy command: `crossplane beta render claim.yaml composition.yaml`.
    - It captures stdout (the rendered JSON/YAML stream) and stderr (errors/diagnostics) from the succeeding command and returns them.
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

### Decision 4: REST API Composition GVK Restoration
- **Decision**: When client-go gets a typed object like `v1.Composition` from the API, it automatically strips `apiVersion` and `kind` fields (setting them to `""`) since the type is already known. This causes `stringify(composition)` in the frontend to produce YAML missing these fields, which subsequently fails in the CLI dry-run. 
  - We will explicitly populate `composition.APIVersion = "apiextensions.crossplane.io/v1"` and `composition.Kind = "Composition"` in the `Get` and `List` methods inside `internal/crossplane/innervision/composition/composition.go`. This preserves standard Kubernetes structure inside the returned JSON.

### Decision 5: Auto-Detection and Generation of functions.yaml
- **Decision**: Compositions using `spec.mode: Pipeline` require at least one function definition (usually passed as `functions.yaml`) when rendered outside a directory containing `crossplane-project.yaml`. 
  - We will implement an automatic parsing step in `internal/crossplane/innervision/sandbox/service.go`.
  - It will unmarshal the incoming Composition YAML into a lightweight structure to check if `spec.mode` is `Pipeline` and read the unique names of the functions in `spec.pipeline[*].functionRef.name`.
  - For each detected function name, it will generate a temporary multi-document `functions.yaml` file on disk using a built-in lookup catalog mapping names (e.g. `function-patch-and-transform` -> `xpkg.upbound.io/crossplane-contrib/function-patch-and-transform:v0.3.0`).
  - This temporary `functions.yaml` will be supplied as the third positional argument to the `crossplane composition render` command. This hides all complexity from the frontend and provides an out-of-the-box dry-run.

## Risks / Trade-offs

- **[Risk] Crossplane CLI dependency** → *Mitigation*: Graceful degradation in the UI. If the backend reports `cli_available: false`, show a beautiful Empty State with instructions on how to install the CLI or mount it in the Docker container.
- **[Risk] Complex function runtimes** → *Mitigation*: `crossplane beta render` handles Docker-based function runners automatically, but this assumes the environment running the Assistant API has access to a Docker daemon. We will document this requirement.
