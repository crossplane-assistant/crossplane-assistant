## 1. Core Utilities & Verification Tests

- [ ] 1.1 Implement the reusable health helper `isResourceHealthy` evaluating Kubernetes `.status.conditions`
- [ ] 1.2 Add unit tests for the resource health helper function to verify correct health evaluation across multiple mock resources

## 2. Sidebar Layout Integration (ExplorerLayout)

- [ ] 2.1 Import and call React Query hooks (`useClaims`, `useXrds`, `useProviders`, etc.) inside `ExplorerLayout` in `ui/src/App.tsx`
- [ ] 2.2 Calculate item counts, ready counts, and health status indicators for each resource category
- [ ] 2.3 Implement discrete skeleton loading blocks (`animate-pulse`) for badges when queries are in `isLoading` state
- [ ] 2.4 Implement and style cyberpunk-themed live status badges with high-contrast semi-transparent colors (e.g. green, orange, red)
- [ ] 2.5 Add click handler to status badges to route to `/explore/<category>?status=unready` while regular clicks proceed to the unfiltered list

## 3. Table Filtering & Active Filter Banner (ResourceListView)

- [ ] 3.1 Read the `status` search parameter inside the generic `ResourceListView` using `useSearchParams`
- [ ] 3.2 Inject the health filter logic into the data-filtering pipeline of `ResourceListView` when the `status` query parameter equals `unready`
- [ ] 3.3 Implement a high-contrast cyberpunk active filter banner in the table header, featuring a clear filter button to wipe the query parameter
- [ ] 3.4 Build, lint, and run the test suite to ensure the system is completely stable and compile-safe
