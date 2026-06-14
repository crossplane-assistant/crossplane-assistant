## 1. Backend: Dummy Claim Generation

- [x] 1.1 Implement recursive OpenAPI schema parser in `schema/service.go` (or a new utility).
- [x] 1.2 Expose the Dummy Claim generation via a new or modified Go endpoint.
- [x] 1.3 Add unit tests to ensure `required` and `optional` fields are generated properly.
- [x] 1.4 Explicitly populate apiVersion and kind fields in GET and LIST Compositions services to prevent client-go GVK erasure.

## 2. Backend: Sandbox Rendering Endpoint

- [x] 2.1 Implement `POST /crossplane/sandbox/render` handler in `internal/server/server.go` or a new sandbox package.
- [x] 2.2 Add local CLI existence check (`exec.LookPath("crossplane")`).
- [x] 2.3 Implement the hybrid execution logic (write tmp files, run `crossplane beta render`, parse stdout/stderr).
- [x] 2.4 Return the payload or the `cli_available: false` error gracefully.
- [x] 2.5 Implement auto-fallback from 'composition render' to 'beta render' if the CLI command fails with unrecognized errors.
- [x] 2.6 Auto-detect Composition pipeline functions in the backend and write a temporary functions.yaml file to pass to the render command.

## 3. Frontend: Composition Workspace Routing

- [x] 3.1 Update `CompositionTreeNav.tsx` to add the "Sandbox Playpen" node that sets `?selected=sandbox`.
- [x] 3.2 Update `CompositionWorkspace.tsx` header to add the 🧪 Sandbox toggle button.
- [x] 3.3 Update `CompositionWorkspace.tsx` empty state to add the Sandbox Quick Start shortcut card.

## 4. Frontend: Sandbox Split-Screen UI

- [x] 4.1 Create the `SandboxView` split-screen component (or inline in `CompositionWorkspace.tsx` `renderMainPane`).
- [x] 4.2 Fetch the OpenAPI schema for the composition's XRD and generate the Dummy Claim string.
- [x] 4.3 Render two Monaco Editors for Input (Claim & Composition).
- [x] 4.4 Render the "Render / Simulate" action button.
- [x] 4.5 Connect the Render button to the backend `POST /crossplane/sandbox/render` endpoint.
- [x] 4.6 Display the API response in an Output Monaco Editor or show the Diagnostics/Errors panel.
