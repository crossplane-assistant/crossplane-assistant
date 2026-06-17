## Why

Application startup and page refreshes are extremely slow due to synchronous Kubernetes API calls made by the Go backend (`Service.ListKind`). It loops over hundreds of resource types sequentially, waiting for responses to calculate resource counts. This blocks the frontend, freezes the application, and overwhelms the Kubernetes API server, especially since the UI polls this endpoint every 5 seconds.

## What Changes

- Introduce a thread-safe, in-memory asynchronous cache in the Go backend (`internal/crossplane/innervision/managedresource/managedresource.go`) for storing managed resource counts.
- Trigger cache warmup in a background goroutine immediately when the service is instantiated.
- When `Service.ListKind` is called, return the currently cached data immediately (response time < 5ms).
- If the cache is stale (e.g., older than 30 seconds), trigger a non-blocking background refresh so the next call receives updated data, without making the current user wait.
- Update `managedresource_test.go` to explicitly synchronize cache refresh logic during tests to maintain determinism.

## Capabilities

### New Capabilities
- `async-managed-resource-cache`: Implement background caching and non-blocking delivery of managed resource kind counts.

### Modified Capabilities

## Impact

- **Backend**: Modifications to `Service.ListKind` and `NewService` in `internal/crossplane/innervision/managedresource/managedresource.go`.
- **Performance**: The `/crossplane/managedresources/kinds` endpoint will return results instantaneously, removing the UI bottleneck and ensuring a responsive startup.
- **Infrastructure**: Dramatically reduces load on the Kubernetes API server by debouncing requests through a TTL cache, replacing constant polling with controlled background fetches.
