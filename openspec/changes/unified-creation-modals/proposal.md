## Why

Currently, the user interface lacks consistent page layout and behavior across different resource lists. While most pages leverage a centralized `ResourceListView` with standardized title, description, and search features, the Compositions page utilizes a custom-built page layout that misses a search bar and handles sliding drawer dismissal differently. 

Furthermore, only the Compositions page supports a creation button ("Create Composite") and modal, while other resource lists lack creation features entirely. To make the application feel cohesive and fully functional as an assistant, all resource explorer pages should share a uniform layout, search bar, and standardized YAML-based creation workflow.

## What Changes

- **Harmonize Compositions Layout**: Refactor `ListCompositions.tsx` to use the shared `ResourceListView` component, removing redundant custom drawer, backdrop, and keyboard handlers.
- **Add Search to Compositions**: Enable immediate, real-time client-side name/kind search on Compositions.
- **Generalized Creation Button and Modal**: Extend the shared `ResourceListView` component to support an optional creation action. When enabled, it displays a standard `+ Create <Resource>` button.
- **YAML Creation Modal with Monaco Editor**: Integrate a standardized creation modal within `ResourceListView` that opens an interactive Monaco YAML editor. It will display a valid, pre-configured default YAML template specific to that resource type (Claim, Composition, XRD, Provider, Function, or Managed Resource).
- **Uniform Mock Creation Behavior**: Wire the "Create" button of the modal on all pages to perform a successful mock API creation alert or temporary insertion.

## Capabilities

### New Capabilities
- `unified-resource-creation`: Standardizes resource creation flows across all 6 explorer pages (Claims, Compositions, XRDs, Providers, Functions, Managed Resources) using a central, reusable Monaco-based YAML modal component and action handler.

### Modified Capabilities
- `port-remaining-views`: Restructure the Compositions page (`ListCompositions.tsx`) to utilize the shared `ResourceListView` component, establishing full layout, search, and drawer UX parity.

## Impact

- **Frontend components**: `ui/src/components/ResourceListView.tsx`, `ui/src/components/ListCompositions.tsx`, `ui/src/components/ListClaims.tsx`, `ui/src/components/ListXrds.tsx`, `ui/src/components/ListProviders.tsx`, `ui/src/components/ListFunctions.tsx`, `ui/src/components/ListManagedResources.tsx`.
