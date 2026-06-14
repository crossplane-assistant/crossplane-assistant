## 1. Backend Implementation

- [x] 1.1 Add `TotalItems` and `ReadyItems` fields to `MRKind` struct in `internal/crossplane/innervision/managedresource/managedresource.go`.
- [x] 1.2 Implement `isResourceReady(*unstructured.Unstructured) bool` helper function to determine if a managed resource is ready from its unstructured status conditions.
- [x] 1.3 Refactor `Service.ListKind` to fetch instance lists concurrently for each kind using goroutines, sync.WaitGroup, and a buffered semaphore channel of size 10 to populate `TotalItems` and `ReadyItems`.

## 2. Frontend Implementation

- [x] 2.1 Update `ManagedResourceKind` type in `ui/src/types.ts` to include `totalItems?: number` and `readyItems?: number` optional fields.
- [x] 2.2 Update `/explore/managed-resources` sidebar badge logic in `ui/src/App.tsx` to sum `totalItems` and `readyItems` across all kinds, and enable health warning badge state.
- [x] 2.3 Update select dropdown options in `ui/src/components/ListManagedResources.tsx` to format option labels with active and ready item counts (e.g. `Topic (3 active, 2/3 ready)` or `Bucket (0 active)`).

## 3. Verification and Testing

- [x] 3.1 Update Go unit tests in `internal/crossplane/innervision/managedresource/managedresource_test.go` to mock instance listing or assert parallel count fields.
- [x] 3.2 Verify that all Go backend tests compile and pass cleanly.
- [x] 3.3 Start the application in development mode (`make dev`), query `/crossplane/managedresources/kinds`, and verify the JSON response contains correct counts.
- [x] 3.4 Open the browser interface and verify the sidebar badge and selection dropdown display real-time counts and health accurately.
