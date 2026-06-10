## Why

Following the initial migration of the Crossplane Assistant frontend to React 19, several explore views (Claims, XRDs, Managed Resources, Providers, Functions) still display placeholder pages ("Under React 19 Refactor"). Fully porting these remaining views is necessary to restore complete functional parity and deliver a polished, modern, and cohesive exploration interface.

## What Changes

- Create native React 19 implementations for the remaining explorer views: Claims, XRDs, Managed Resources, Providers, and Functions.
- Introduce a highly reusable and customizable `<ResourceListView>` component to standardize the layout, pagination/filtering, sliding detail drawer, Monaco Editor manifest view, and Events logging across all list pages.
- Add TanStack Query fetchers and mutations in `ui/src/queries/` for Claims, XRDs, Managed Resources, Providers, and Functions.
- Refactor `ui/src/App.tsx` routes to connect these newly implemented explorer views to the main sidebar shell, replacing the refactor placeholders.

## Capabilities

### New Capabilities
- `port-remaining-views`: Reconstructs the complete explore-mode panel suite in React 19 + Radix UI + Tailwind CSS.

### Modified Capabilities
<!-- None. Behavior and endpoints remain aligned with existing specifications, only the frontend rendering pipeline changes. -->

## Impact

- `ui/src/App.tsx`: Path routes updated to import and mount real components instead of stubs.
- `ui/src/queries/`: Add `useClaimQueries.ts`, `useXrdQueries.ts`, `useManagedResourceQueries.ts`, `useProviderQueries.ts`, and `useFunctionQueries.ts`.
- `ui/src/components/`: New reusable `<ResourceListView>` component and the five specialized view pages.
