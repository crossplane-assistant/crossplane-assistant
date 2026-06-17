## Why

The async cache introduced for managed resource kinds resolves performance lag, but creates a "zero-count lockout" at first app startup. When the cache is empty on the very first request, the backend returns zero counts. Because the frontend query has no polling interval configured, it never refetches, leaving the user with static "0" counts on their screen until a manual browser refresh (F5).

## What Changes

- **Backend Sync Fallback**: If the cache is completely empty at startup, block and refresh it synchronously on the very first query. Subsequent calls use the instant cache.
- **Frontend Active Polling**: Add a 10-second polling interval (`refetchInterval: 10000`) to the `useManagedResourceKinds()` React Query hook to dynamically refresh counts as resource counts change.

## Capabilities

### New Capabilities
- `kinds-sync-fallback-and-polling`: Backend synchronous warmup fallback combined with lightweight frontend active polling.

### Modified Capabilities

## Impact

- **Backend**: `internal/crossplane/innervision/managedresource/managedresource.go`
- **Frontend**: `ui/src/queries/useManagedResourceQueries.ts`
