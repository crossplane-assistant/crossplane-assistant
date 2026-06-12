## 1. Foundation & Utilities

- [ ] 1.1 Create static catalog data and types in `ui/src/utils/ecosystemCatalog.ts` covering popular curated providers and functions with default stable YAML templates.
- [ ] 1.2 Implement the merging and fallback utility function `mergeEcosystemData` to handle live GitHub API response enrichment and community-contributed auto-templates.
- [ ] 1.3 Create an automated unit test `ui/tests/ecosystem-catalog.test.ts` to verify the merge algorithm and offline fallback robustness.

## 2. Reusable UI Components

- [ ] 2.1 Create the reusable `ui/src/components/EcosystemCatalog.tsx` component to handle fetching of `crossplane-contrib` repositories via standard fetch/query.
- [ ] 2.2 Implement the catalog card component rendering package names, "Curated"/"Community" badges, dynamic star counts, doc links, and action buttons.
- [ ] 2.3 Ensure error states, network timeouts, and rate limits in GitHub API calls are caught silently, instantly shifting the component state to use local static presets only.

## 3. Page Integrations

- [ ] 3.1 Refactor `ui/src/components/ListProviders.tsx` to employ Radix Tabs, showing installed providers on the "Installed" tab and `EcosystemCatalog` (filtered to `provider` category) on the "Ecosystem Hub" tab.
- [ ] 3.2 Refactor `ui/src/components/ListFunctions.tsx` to employ Radix Tabs, showing installed functions on "Installed" and `EcosystemCatalog` (filtered to `function` category) on "Ecosystem Hub".

## 4. Modal wiring & Verification

- [ ] 4.1 Connect the "Install" action on the cards to trigger the Monaco YAML Creation Modal in the parent `ResourceListView` component, loaded with the specific item's template.
- [ ] 4.2 Verify frontend build consistency by running TypeScript compilation checks.
- [ ] 4.3 Perform a manual verify cycle to check that the catalog operates smoothly in mock-offline conditions, rendering offline presets flawlessly.
