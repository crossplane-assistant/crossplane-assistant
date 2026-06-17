## 1. Backend Sync Fallback

- [x] 1.1 Update `Service.ListKind` in `internal/crossplane/innervision/managedresource/managedresource.go` to block and call `s.refreshCache(ctx)` synchronously if `s.lastUpdated.IsZero()` is true.
- [x] 1.2 Verify that Go unit tests pass and handle the synchronous blocking fallback gracefully.

## 2. Frontend Active Polling

- [x] 2.1 Update `useManagedResourceKinds` in `ui/src/queries/useManagedResourceQueries.ts` to add `refetchInterval: 10000` (10 seconds).
- [x] 2.2 Verify the frontend compiles and matches styles.
