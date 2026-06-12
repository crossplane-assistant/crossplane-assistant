## 1. Foundation & Utilities

- [x] 1.1 Create static catalog data and types in `ui/src/utils/ecosystemCatalog.ts` covering popular curated providers and functions with default stable YAML templates.
- [x] 1.2 Implement the merging and fallback utility function `mergeEcosystemData` to handle live GitHub API response enrichment and community-contributed auto-templates.
- [x] 1.3 Create an automated unit test `ui/tests/ecosystem-catalog.test.ts` to verify the merge algorithm and offline fallback robustness.

## 2. Reusable UI Components

- [x] 2.1 Create the reusable `ui/src/components/EcosystemCatalog.tsx` component to handle fetching of `crossplane-contrib` repositories via standard fetch/query.
- [x] 2.2 Implement the catalog card component rendering package names, "Curated"/"Community" badges, dynamic star counts, doc links, and action buttons.
- [x] 2.3 Ensure error states, network timeouts, and rate limits in GitHub API calls are caught silently, instantly shifting the component state to use local static presets only.

## 3. Page Integrations

- [x] 3.1 Refactor `ui/src/components/ListProviders.tsx` to employ Radix Tabs, showing installed providers on the "Installed" tab and `EcosystemCatalog` (filtered to `provider` category) on the "Ecosystem Hub" tab.
- [x] 3.2 Refactor `ui/src/components/ListFunctions.tsx` to employ Radix Tabs, showing installed functions on "Installed" and `EcosystemCatalog` (filtered to `function` category) on "Ecosystem Hub".

## 4. Modal wiring & Verification

- [x] 4.1 Connect the "Install" action on the cards to trigger the Monaco YAML Creation Modal in the parent `ResourceListView` component, loaded with the specific item's template.
- [x] 4.2 Verify frontend build consistency by running TypeScript compilation checks.
- [x] 4.3 Perform a manual verify cycle to check that the catalog operates smoothly in mock-offline conditions, rendering offline presets flawlessly.

## 5. Deprecation & Archival Filtering

- [x] 5.1 Implement `isDeprecatedOrArchived` utility logic and apply it to filter out community items from the raw GitHub API response.
- [x] 5.2 Add `isArchived` support to local presets and display a prominent warning badge (`⚠️ Archived`) on the UI card when detected.
- [x] 5.3 Write/update unit tests in `ui/tests/ecosystem-catalog.test.ts` to assert that archived community items are filtered out, and archived curated items are badged.
- [x] 5.4 Run compile checks and manually verify that a community item like `function-cue-archived` is hidden successfully.

## 6. Fix Preset Overwrite Bug

- [x] 6.1 Fix state race condition in `ResourceListView.tsx` by removing the `useEffect` trigger and initializing YAML template state directly on user click actions (+ Create and Use Preset).
- [x] 6.2 Verify build compilation and check that the Monaco Editor displays the precise template of the clicked card.

## 7. Dynamic Version Discovery

- [x] 7.1 Implement `injectVersionIntoYaml` utility helper inside `ui/src/utils/ecosystemCatalog.ts` using regular expressions to insert fetched release tags into YAML manifests.
- [x] 7.2 Implement lazy-loading version retrieval on card clicked in `EcosystemCatalog.tsx`, using background API calls to `/releases/latest` with proper loading feedback.
- [x] 7.3 Update unit tests in `ui/tests/ecosystem-catalog.test.ts` to assert that version injection correctly replaces default stable versions with new dynamic versions.
- [x] 7.4 Verify production build and compilation type safety checks.

## 8. Live Curated Version Badging

- [x] 8.1 Export a global in-memory version cache object `CURATED_VERSION_CACHE` inside `ui/src/utils/ecosystemCatalog.ts`.
- [x] 8.2 Implement background fetching on-mount inside `EcosystemCatalog.tsx` to retrieve and store latest release versions of displayed curated items in `CURATED_VERSION_CACHE` if connected.
- [x] 8.3 Dynamically render the live-cached version or fallback default version on the curated card badges with a soft fade-in transition.
- [x] 8.4 Verify build typecheck compilation and run tests to ensure caching and rendering operate cleanly.
