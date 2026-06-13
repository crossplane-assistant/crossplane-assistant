## Why

Currently, the Composition view resides in a 650px side panel. As compositions grow in complexity (featuring pipeline steps, nested resources, and data flow patches), the side panel causes severe cognitive overload with deep vertical scrolling, cramped horizontal real-estate for YAML editors, and a loss of overall architectural context. Transitioning to a dedicated, full-page Composition Workspace provides an IDE-like environment.

## What Changes

- **Composition Workspace Route**: Introduce a new dedicated full-screen route (`/explore/compositions/:name`) for deep inspection of Compositions.
- **Tree-Based Navigation**: Create a left-hand navigation pane that maps the Composition's structure (Pipeline Steps -> Composed Resources) and lists its active Claims.
- **Dynamic Main Pane**: The main right-hand workspace adapts to the selected tree item, displaying either raw pipeline configurations, full-width resource data flows (patches), or active claim overviews.
- **Shareable State**: Use URL query parameters to track the selected node (step, resource, or claim) so the exact view can be bookmarked and shared.
- **Interactive Composition Graph**: Integrate an interactive, horizontal tree graph at the top of the workspace main pane. This graph parses the composition spec and displays steps and resources as nodes. Clicking on a node synchronizes the workspace navigation.
- **Quick Look Integration**: Retain the side panel in the list view for quick inspection, but add a prominent "Open Workspace" action to launch the full-page experience.

## Capabilities

### New Capabilities
- `composition-workspace`: An immersive, full-screen React layout component providing a tree-view navigation and dynamic inspection pane for Crossplane Compositions.
- `composition-graph-view`: A visual, interactive, and responsive tree graph component embedded in the workspace to map the blueprint workflow of pipeline steps and composed resources.

### Modified Capabilities
- `port-remaining-views`: Update the Composition List view and existing side panel logic to provide an entry point into the new dedicated Workspace.

## Impact

- **Frontend (React)**: 
  - Adds new routes in `App.tsx`.
  - Creates new components (e.g., `CompositionWorkspace.tsx`, `CompositionTreeNav.tsx`).
  - Refactors existing components (`CompositionViewer.tsx`, `ResourceDataFlowViewer.tsx`) to support fluid sizing in the main workspace pane.
- **UX**: Eliminates cramped horizontal scrolling and deep vertical nesting for complex Compositions.
