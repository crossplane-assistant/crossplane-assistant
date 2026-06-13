## 1. Routing & Shell Components

- [x] 1.1 Add the new `/explore/compositions/:name` route to `ui/src/App.tsx`.
- [x] 1.2 Create `ui/src/components/CompositionWorkspace.tsx` as the main container handling URL parsing (`useParams` and `useSearchParams`) and split-pane layout rendering.
- [x] 1.3 Update `ListCompositions.tsx` to include an "Open Workspace" Link/Button.

## 2. Tree Navigation Component

- [x] 2.1 Create `ui/src/components/CompositionTreeNav.tsx`.
- [x] 2.2 Implement logic in `CompositionTreeNav` to fetch `useClaims()`, map them to the Composition's GVK, and render them as selectable tree nodes.
- [x] 2.3 Implement logic in `CompositionTreeNav` to parse `spec.pipeline` and `spec.resources` and render step/resource nodes.
- [x] 2.4 Make tree nodes update the URL query parameters on click (e.g. `?selected=resource:RDSInstance`).

## 3. Workspace Main Pane Adapters

- [x] 3.1 Refactor/adapt `DynamicResourceViewer` and `CompositionViewer` (if needed) to render correctly and expand fully within the right-hand main pane of the workspace.
- [x] 3.2 Ensure the selected state from the URL drives the active content shown in the right pane (displaying Monaco editor for step configs, Resource tabs for resources, or Claim summaries for active claims).

## 4. Verification

- [x] 4.1 Run frontend linting and compilation to ensure zero errors.
- [x] 4.2 Test the navigation flow from the list to the workspace, ensuring the URL state matches the active tree node and main pane view.

## 5. Composition Graph View

- [x] 5.1 Create a virtual tree parser helper that converts a Composition manifest into a standard `ClaimTreeNode` tree layout.
- [x] 5.2 Create/adapt the graph rendering components to draw the virtual node tree at the top of the main pane, using the custom CSS tree connectors.
- [x] 5.3 Implement the collapsible header container around the graph, making it react to active workspace selection states.
- [x] 5.4 Ensure node clicks on the graph update query parameters to synchronize selection across the workspace.

