## 1. Backend Service Preparation

- [x] 1.1 Add `MRCount` struct, cache map, mutex, and TTL tracking fields to `Service` struct in `internal/crossplane/innervision/managedresource/managedresource.go`.
- [x] 1.2 Initialize the cache fields inside the `NewService` function.

## 2. Background Refresh Logic

- [x] 2.1 Extract the core logic of `ListKind` (iterating providers, finding CRDs, executing concurrent list queries) into a private unexported method (e.g., `refreshCache(ctx)`).
- [x] 2.2 Implement caching synchronization: update the cache map and update timestamp under a write lock at the end of `refreshCache`.
- [x] 2.3 Add a background warmup trigger inside `NewService` that launches `refreshCache` in a goroutine upon instantiation.

## 3. Frontend API Delivery

- [x] 3.1 Refactor the public `ListKind` method to acquire a read lock, format the cached `MRCount` data into the `[]MRKind` slice, and return it immediately.
- [x] 3.2 Add stale cache detection in `ListKind`: if the cache is older than 30 seconds and an update is not already in progress, launch `refreshCache` asynchronously in a background goroutine.

## 4. Testing & Determinism

- [x] 4.1 Update `TestListKind` in `managedresource_test.go` to explicitly call the synchronous `refreshCache` equivalent before making assertions to avoid test flakiness.
- [x] 4.2 Verify existing tests pass and handle empty caches gracefully.

## 5. Startup Warmup & Auto-Heal

- [x] 5.1 Add a 2-second sleep delay to the background warmup loop in `NewService` to allow registries to synchronize.
- [x] 5.2 Update `refreshCache` to only update `lastUpdated = time.Now()` if the length of listed kinds is greater than zero, preventing empty cache lockout.
