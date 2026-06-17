## Context

The Crossplane Assistant UI displays counts of various managed resource kinds in its navigation sidebar to provide users with a quick overview of system state. Currently, the Go backend (`Service.ListKind`) satisfies this request by querying the Kubernetes API server for the instances of every known CRD associated with an active provider. This is a highly unoptimized, synchronous blocking operation that causes the frontend API call to stall for several seconds. Furthermore, the frontend polls this endpoint every 5 seconds, resulting in a continuous, heavy barrage of requests against the Kubernetes API, degrading performance for both the application and the cluster.

## Goals / Non-Goals

**Goals:**
- Eliminate the frontend loading bottleneck by guaranteeing that requests to `/crossplane/managedresources/kinds` resolve in < 5ms.
- Drastically reduce the number of redundant `List` calls to the Kubernetes API server by debouncing requests through a TTL cache.
- Implement an automated, background mechanism to warm and refresh the cache without impacting foreground API handlers.

**Non-Goals:**
- Refactoring the entire `ListKind` logic, beyond the introduction of the cache wrapper.
- Changing the frontend React Query polling interval (the cache will absorb the load).
- Adding complex event-driven informers for every dynamic CRD (which would cause massive API server connection overhead).

## Decisions

- **In-Memory Cache over Distributed Cache**: We use a simple Go `sync.RWMutex` protected struct directly within the `Service` definition. A distributed cache like Redis is unnecessary overhead for an application meant to run as an embedded local cluster assistant.
- **Background Goroutine Polling over Synchronous Fetching**: To ensure rapid response times, the HTTP handler will only ever read from the cache. If the cache is stale (e.g., last update > 30s ago), a background goroutine is triggered. This avoids penalizing the specific user request that happens to encounter an expired cache.
- **Test Synchronicity**: We must ensure that the unit tests are not rendered flaky by asynchronous behavior. We will add a synchronized `refreshCacheSync(ctx)` method or similar mechanism specifically invoked by `TestListKind` to ensure test assertions evaluate deterministically.

## Risks / Trade-offs

- **Risk: Stale Data Display** → **Mitigation**: Users may see counts that are up to 30 seconds out of date. This is an acceptable trade-off for a dashboard overview badge. Actual resource interactions (List/Get/Update/Delete) remain strongly consistent as they do not use this cache.
- **Risk: Goroutine Leaks** → **Mitigation**: We will use a mutex to ensure only one background update goroutine is running at any given time for the managed resource cache.
