## Why

The application currently has an unengaging, empty landing page on startup, which degrades the first-user experience. Furthermore, the sliding detail drawer lacks convenient dismissal mechanisms (backdrop overlay click and keyboard Escape key listeners). Lastly, when no Claims exist in the cluster, the Claims page crashes completely with a blank white screen due to unhandled `null` data.

## What Changes

- **Dashboard Landing Page**: Enrich the main landing page with dynamic stat cards, an interactive visual guide of Crossplane's abstractions, and polished, responsive layouts.
- **Sliding Drawer Dismissal**: Add a semi-transparent backdrop overlay and window-level Escape key event listeners to seamlessly dismiss the sliding detail drawer.
- **Null Safety & Stability**: Update the generic `ResourceListView` to handle `null` arrays gracefully, ensuring empty tables are rendered without crashing the React application.

## Capabilities

### New Capabilities
- `ux-dashboard-landing`: A dynamic dashboard landing page showcasing cluster stats, visual educational pipelines, and a polished visual layout.

### Modified Capabilities
- `claim-dependency-graph`: Enhance the sliding detail drawer in the Claim Details view to support backdrop overlay clicks and Escape key dismissal.
- `port-remaining-views`: Enhance the generic resource listing views and their drawer to support backdrop clicks/Escape key dismissal, and ensure `null` API responses are handled safely without crashing.

## Impact

- **UI Components**: `ui/src/App.tsx`, `ui/src/components/ClaimDetailsView.tsx`, `ui/src/components/ResourceListView.tsx`, and `ui/src/components/ListClaims.tsx`.
- **Dependencies**: React Query is leveraged to drive the dashboard statistics in real-time. No new npm dependencies or backend modifications are required.
