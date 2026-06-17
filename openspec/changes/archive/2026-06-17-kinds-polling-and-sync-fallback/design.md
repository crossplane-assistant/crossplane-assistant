## Context

The backend uses a background cache to deliver managed resource kind listings instantly. However, if the cache is empty during the very first user query, it returns zero counts. Because React Query has no polling interval set for the `mr-kinds` query key, the browser is permanently locked into a zero-count display. We will implement synchronous blocking for the first cache refresh if the cache is empty, and configure React Query to poll the endpoint every 10 seconds.

## Goals / Non-Goals

**Goals:**
- Eliminate the zero-count lockout on first page load.
- Ensure the frontend automatically recovers if it encounters a transient empty result.
- Keep background caches fast and light.

**Non-Goals:**
- Changing other polling intervals.

## Decisions

- **Sync on Zero, Async on Warm**: If `s.lastUpdated.IsZero()` is true, block and run `refreshCache(ctx)` synchronously inside the request thread. Otherwise, run it asynchronously.
- **Lightweight Polling**: Set `refetchInterval: 10000` in the frontend for `mr-kinds`. Since the cache returns in <2ms, this polling interval has negligible CPU/network impact on both backend and K8s APIServer.

## Risks / Trade-offs

- **Risk: First-load blocking** → **Mitigation**: The first load will take a few seconds to list everything from K8s if registries are slow, but this only happens once at startup. All subsequent loads are served from cache instantly.
