## 1. Generic Layout & Query Hooks

- [x] 1.1 Create the highly reusable `<ResourceListView>` component under `ui/src/components/ResourceListView.tsx` handling column layouts, slide-out drawer, Monaco Editor manifest tab, and custom actions.
- [x] 1.2 Implement core query files in `ui/src/queries/` for Claims, XRDs, Providers, Functions, and Managed Resources.

## 2. Implement Ported Explorer Views

- [x] 2.1 Implement `ListClaims` explorer view under `ui/src/components/ListClaims.tsx` with Synced and Ready status checks.
- [x] 2.2 Implement `ListXrds` explorer view under `ui/src/components/ListXrds.tsx` with Established and Offered status checks.
- [x] 2.3 Implement `ListProviders` explorer view under `ui/src/components/ListProviders.tsx` with Healthy and Installed status checks.
- [x] 2.4 Implement `ListFunctions` explorer view under `ui/src/components/ListFunctions.tsx` with custom Function metrics/status.
- [x] 2.5 Implement `ListManagedResources` explorer view under `ui/src/components/ListManagedResources.tsx` featuring the dynamic `kinds` selection dropdown.

## 3. Wiring & Validation

- [x] 3.1 Update `ui/src/App.tsx` to mount and import these new active views under the explorer shell routes.
- [x] 3.2 Execute compilation test via `npm run build` to verify types safety, build output folder correctness, and bundler completion.
