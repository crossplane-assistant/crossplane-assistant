## Why

Currently, the navigation sidebar (`ExplorerLayout`) is entirely static and provides no visibility into the state or size of the Kubernetes/Crossplane control plane unless the user manually navigates to each individual view. By introducing dynamic health/status badges and live item counts directly within the sidebar, operators can immediately assess the health of their Crossplane resources (Claims, XRDs, Providers, etc.) at a glance from any page, and quickly jump to troubleshoot failing resources.

## What Changes

- **Live Status & Count Badges**: Integrate React Query hooks directly into the sidebar to fetch resource state in real time and display item counts and health states.
- **Cyberpunk / Kube Aesthetics**: Style badges next to menu items using high-contrast, semi-transparent pastel colors on dark backgrounds (e.g. green for healthy, pulsing red/orange for errors).
- **Subtle Loading Indicators**: Display a discrete loading pulse skeleton if counts are fetching initially, avoiding jarring layout shifts.
- **Interactive Click-to-Filter**: Clicking on an alert or error badge (e.g. `2/3 ⚠️` or `🔴`) will redirect the user to that resource's list view, automatically filtering the table to show only the non-ready or unhealthy resources.
- **URL-based Table Filtering**: Enhance `ResourceListView` to parse a URL query parameter (like `?status=unready`) and filter rows automatically using a generic `.status.conditions` check.

## Capabilities

### New Capabilities
- `sidebar-live-status-badges`: Provides live count indicators, health status evaluation (parsing standard Kubernetes `.status.conditions` or specific conditions like `Ready`/`Healthy`/`Established`), subtle cyberpunk animations, and interactive click-to-filter mechanics driven by URL query parameters.

### Modified Capabilities
*No existing capabilities are being modified at the requirements level.*

## Impact

- **UI Code**: `ui/src/App.tsx` (the `ExplorerLayout` component) and `ui/src/components/ResourceListView.tsx`.
- **UX & Navigation**: Inter-component navigation driven by URL search parameters.
- **Query / Network load**: Low impact due to React Query caching and polling de-duplication, but will establish background polling (5s intervals) for sidebar views.
