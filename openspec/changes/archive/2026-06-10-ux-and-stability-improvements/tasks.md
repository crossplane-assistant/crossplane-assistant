## 1. Null-Safety & Stability

- [x] 1.1 Guard data arrays against null or undefined values in `ResourceListView.tsx` using a `safeData = data || []` fallback
- [x] 1.2 Verify that the Claims explorer (and all other views) renders an empty state instead of crashing when data is null

## 2. Sliding Drawer Dismissal

- [x] 2.1 Add a cliquable backdrop overlay underneath the sliding drawer in `ClaimDetailsView.tsx` with a proper `z-index` layer and transition
- [x] 2.2 Add a window-level keyboard event listener for the `Escape` key inside `ClaimDetailsView.tsx` with automated `useEffect` cleanup
- [x] 2.3 Add a cliquable backdrop overlay underneath the sliding drawer in `ResourceListView.tsx` with a proper `z-index` layer and transition
- [x] 2.4 Add a window-level keyboard event listener for the `Escape` key inside `ResourceListView.tsx` with automated `useEffect` cleanup

## 3. Dynamic Dashboard Landing Page

- [x] 3.1 Replace the root `/` route placeholder link in `App.tsx` with a new `DashboardLanding` component
- [x] 3.2 Invoke parallel React Query hooks (`useClaims`, `useCompositions`, `useXrds`, `useProviders`, `useFunctions`) in `DashboardLanding`
- [x] 3.3 Create a highly polished, responsive `StatCard` sub-component displaying total counts, ready ratios, and animated CSS health progress bars
- [x] 3.4 Build an interactive conceptual pipeline diagram (Claims -> XRDs -> Compositions -> Managed Resources) using Lucide icons and Tailwind flex layout
- [x] 3.5 Refine aesthetics on the dashboard using rich background gradients, responsive grid layouts, and smooth hover elevation transitions

## 4. Verification & Testing

- [x] 4.1 Run project build or linter commands to verify that no TypeScript or CSS compiler errors exist
