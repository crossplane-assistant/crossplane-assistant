## Context

Currently, the `ResourceListView` component handles resource creation by opening a modal containing a Monaco Editor and allowing the user to click a "Create" button. However, because no parent list page passes the `onCreateSuccess` prop, `ResourceListView` falls back to a mocked alert dialog:
```tsx
if (onCreateSuccess) {
  onCreateSuccess(createYamlValue);
} else {
  alert(`Created ${title.replace(/s$/, '')} successfully (Mocked)!`);
}
setShowCreateModal(false);
```
The Go API backend already has fully functional, ready-to-use HTTP `POST` endpoints under `/crossplane/*` (e.g., `/crossplane/providers`, `/crossplane/functions`, etc.) that read the raw request body and unmarshal it as YAML into Kubernetes/Crossplane resource structs. 

We need to close the loop by introducing query mutations on the frontend for each resource type, wiring them into the respective explorer list views, and upgrading `ResourceListView`'s modal to handle real network operations, loading indicators, and error diagnostics.

## Goals / Non-Goals

**Goals:**
- Implement real React Query `useCreate*` mutations for Providers, Functions, Claims, XRDs, and Managed Resources.
- Update `ResourceListView` to support asynchronous `onCreateSuccess` actions.
- Add an interactive loading state (spinner and disabled button) while creation is in progress.
- Prevent the creation modal from closing on error, and render the backend's validation error message inside the modal so the user can debug and correct their YAML manifest.
- Trigger automatic cache invalidation in React Query upon successful creation to instantly refresh the corresponding resource list.

**Non-Goals:**
- Modify or create new backend API handlers (the Go backend already handles YAML unmarshaling perfectly).
- Implement client-side YAML linting (the backend's kubernetes API dry-run/unmarshal validation errors are sufficient and accurate).
- Support multi-document YAML creation in a single request.

## Decisions

### 1. Raw Text/YAML request bodies for POST APIs
To stay consistent with the Go backend, which performs `io.ReadAll(c.Request.Body)` and `yaml.Unmarshal(...)`, the frontend React Query mutations will send raw YAML strings directly as the payload of the `POST` request.
- **Header**: `Content-Type: application/yaml` or `text/plain`
- **Body**: The raw string output of the Monaco editor.
- *Why this choice?* While `JSON.stringify` works for JSON-subset YAML, passing the raw string from Monaco editor directly is simpler, robust, and aligns perfectly with how the backend is written to read bytes.

### 2. Async `onCreateSuccess` with Error Propagation in `ResourceListView`
We will rewrite the submit button handler in the `ResourceListView` modal to be `async`. It will track an internal `isSubmitting` and `error` state.
- **Workflow**:
  1. Clear any previous error.
  2. Set `isSubmitting` to `true`.
  3. Await `onCreateSuccess(createYamlValue)`.
  4. On success: Display a success alert (or toast if available, but alert is consistent with standard list delete alerts), close the modal, and reset states.
  5. On error: Catch the error, set it in the `error` state (which renders a warning banner inside the modal), and set `isSubmitting` to `false`.
- *Why this choice?* Keeping the modal open on error is a vital UX pattern for YAML editing, avoiding the frustration of losing written configurations because of a typo or minor schema violation.

### 3. Cache Invalidation via React Query `onSuccess`
Each mutation will invalidate its respective list query key (e.g., `['providers']`, `['functions']`, etc.) so that the new resource shows up instantly in the table.
- *Why this choice?* Since we are operating in a single-page app, using React Query's `invalidateQueries` is the standard and most reliable way to refresh cluster states.

## Risks / Trade-offs

- **[Risk]**: The user might try to create a resource with incorrect YAML, leading to a raw unmarshal error from the backend.
  - **Mitigation**: We will parse the backend error response body (usually `err.Error()` or JSON error) and display it clearly in a warning banner in the creation modal.
- **[Risk]**: Potential race conditions if the user double-clicks the "Create" button.
  - **Mitigation**: The "Create" button will be disabled and show a "Creating..." text when `isSubmitting` is true.
