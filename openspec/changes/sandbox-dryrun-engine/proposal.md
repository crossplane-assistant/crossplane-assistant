## Why

Crossplane Composition developers face a slow feedback loop ("inner loop"), often having to apply YAMLs to a live cluster and wait for reconciliation to verify syntax or patch correctness. This change introduces a local Dry-Run Sandbox feature into the Composition Workspace, allowing users to simulate the generation of managed resources instantly without risking live cluster state, accelerating development by an order of magnitude.

## What Changes

- Implement a "Sandbox (Dry-Run)" mode in the `CompositionWorkspace` split-screen UI.
- Introduce a new Go backend endpoint (`POST /crossplane/sandbox/render`) to execute the rendering logic.
- The backend will use a Hybrid approach: preferring a local `crossplane beta render` CLI execution if available, falling back to an informative error or basic evaluation otherwise.
- The system will automatically generate a boilerplate "Dummy Claim" YAML based on the OpenAPI schema of the associated Composite Resource Definition (XRD) to help users start testing immediately.
- Integrate real-time diagnostics and linter errors back into the Monaco editor from the rendering output.

## Capabilities

### New Capabilities
- `sandbox-dryrun-engine`: The split-screen interactive sandbox, dummy claim generation algorithm, and hybrid backend rendering controller.

### Modified Capabilities
- `composition-workspace`: Added a new mode (Sandbox) alongside the existing steps and resource viewers.

## Impact

- **Frontend**: Adds significant logic to `ui/src/components/CompositionWorkspace.tsx` and `CompositionTreeNav.tsx` to handle the new split-screen layout and Monaco editor states.
- **Backend**: Adds a new controller/handler for rendering, which may require invoking external binaries or embedded Go crossplane libraries. Extends the existing OpenAPI schema processing in `internal/crossplane/innervision/schema/service.go` to support automatic YAML generation.
