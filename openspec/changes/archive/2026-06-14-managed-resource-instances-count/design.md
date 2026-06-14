## Context

To address the issue where the sidebar badge displays the number of Kinds rather than actual Resource Instances, we need to efficiently retrieve and count the instances of each Managed Resource Kind.
While the frontend could theoretically make separate queries, doing so over dozens of Kinds is highly inefficient. Interrogating the APIServer from the Go backend concurrently is much faster and completely eliminates network roundtrip overhead for the frontend.

## Goals / Non-Goals

**Goals:**
- Extend the `/crossplane/managedresources/kinds` endpoint response with `totalItems` and `readyItems` counts.
- Fetch counts in parallel on the backend using goroutines and wait groups, bounded by a semaphore channel of size 10.
- Aggregate counts in the React frontend (`App.tsx`) for the sidebar badge and implement unready/healthy warning states.
- Surface item counts inline inside the categories select dropdown in `ListManagedResources.tsx`.

**Non-Goals:**
- Implementing server-sent events (SSE) or websockets for live count streaming.
- Modifying individual resource fetch operations.

## Decisions

### Decision 1: Parallel Backend Counting with Semaphore
- **Rationale**: To count instances of all Kinds, the backend must list resources of each Kind from the APIServer. If done sequentially, 50+ list calls would take several seconds. Using goroutines with `sync.WaitGroup` allows them to run concurrently. Bounding the concurrency to a maximum of 10 concurrent requests using a buffered channel semaphore prevents APIServer throttling.

### Decision 2: Backend Unstructured Readiness Evaluation
- **Rationale**: A managed resource is considered "Ready" if its status has a condition with `type: "Ready"` and `status: "True"`. We will implement a helper function `isResourceReady(*unstructured.Unstructured)` in Go to extract the conditions list using `unstructured.NestedSlice` and inspect the status.

### Decision 3: Frontend Sidebar and Dropdown Updates
- **Rationale**:
  - In `App.tsx`, `total` will sum `totalItems` and `ready` will sum `readyItems` across all kinds.
  - In `ListManagedResources.tsx`, the `<option>` labels will be formatted as: `{k.kind} ({k.totalItems} active, {k.readyItems}/{k.totalItems} ready)` if `k.totalItems > 0`, otherwise `{k.kind} (0 active)`.

## Risks / Trade-offs

- **[Risk]**: Querying 50+ resource types concurrently on every kinds request could put a temporary peak load on the APIServer.
  - **Mitigation**: The semaphore limits concurrency to 10. Also, Kubernetes APIServer caches resource lists for standard GETs if backed by informers, keeping latency minimal.
