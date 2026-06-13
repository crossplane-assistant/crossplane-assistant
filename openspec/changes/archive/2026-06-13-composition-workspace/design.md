## Context

With recent enhancements, the Composition side panel (which typically spans ~650px) now crams raw pipeline YAML code, nested composed resources, dependency graphs, and data-flow mappings into a very dense space. The resulting horizontal scrolling and deep vertical nesting degrades the user experience and obscures the architectural blueprint. Moving to a dedicated full-page Composition Workspace solves these ergonomic bottlenecks and paves the way for future visual editing features.

## Goals / Non-Goals

**Goals:**
- Implement a dedicated React route (`/explore/compositions/:name`) using a split-pane layout (Navigation Tree on the left, Workspace on the right).
- Develop a `CompositionTreeNav` component that recursively maps the pipeline steps, extracted static resources, and matching active Claims into a hierarchical tree.
- Maintain a shareable state in the URL using query parameters (e.g., `?selected=step:step-name`).
- Retrofit existing components (`CompositionViewer`, `ResourceDataFlowViewer`, `DynamicResourceViewer`) to expand seamlessly within the new full-width main pane.
- Update the Composition list view and existing drawer to include an "Open Workspace" action button.

**Non-Goals:**
- Building a drag-and-drop visual Composition editor (we are focusing on read-only deep inspection for now).
- Altering the backend API structure (we will reuse the existing endpoints for fetching compositions, graphs, and claims).

## Decisions

### 1. Split-Pane Workspace Layout
We will use a classic IDE layout: a left sidebar for structural navigation (the `CompositionTreeNav`) taking up ~25% of the width, and a main right pane taking up ~75% to render the selected content.
- *Rationale*: This is a well-understood paradigm for exploring hierarchical data. It separates the "map" from the "details", preventing the deep nesting issues present in the side panel.

### 2. URL-Driven State Management
The selected node in the workspace will be stored in the URL query parameters (e.g., `?selected=resource:RDSInstance`). 
- *Rationale*: Enables deep-linking and bookmarking. A team member can share a direct link to the data flow of a specific composed resource within a complex composition.

### 3. Tree Navigation Parsing
The `CompositionTreeNav` component will be responsible for parsing the `v1.Composition` object (handling both legacy `spec.resources` and modern `spec.pipeline` -> `function-patch-and-transform` extraction) and correlating it with the active claims fetched via `useClaims()`.
- *Rationale*: Centralizing this parsing in the navigation component keeps the main display components clean and focused purely on rendering the selected item.

### 4. Reusing Display Components
The main pane will reuse existing components:
- `MonacoEditor` for raw step inputs.
- `DynamicResourceViewer` for composed resources (which internally renders the YAML, Dependencies, and Data Flow tabs).
- `ClaimDetailsView` (or a summary version of it) for inspecting Active Claims.
- *Rationale*: Maximizes code reuse and ensures visual consistency across the app. We just need to ensure these components are responsive and utilize the full width of their container.

### 5. Reusable Graph Node Renderer & Virtual Tree
We will implement a React helper function to parse the Composition (whether pipeline or legacy) into a standard `ClaimTreeNode` structure.
- *Rationale*: By converting the static Composition GVK and resource templates into a virtual node tree, we can directly instantiate `<ClaimGraph>` and `<ClaimGraphNode>` components! This reuses 100% of our custom horizontal CSS connectors (`.graph-wrapper`, `.connector`, etc.) and delivers an exceptionally cohesive design.

### 6. Collapsible Workspace Header
The Composition Graph will be embedded inside a collapsible wrapper at the top of the main workspace pane. When no tree item is selected, the graph acts as a wide, informative welcome board. On selection, the graph container will collapse (retaining collapsible toggle controls) to occupy a minimal, slim height (e.g. max-h-[160px]), leaving maximum space for Monaco Editors and patch layouts.

## Risks / Trade-offs

- **[Risk]**: Handling legacy vs. modern compositions in the tree parser could become complex.
- **[Mitigation]**: Encapsulate the extraction logic in a shared utility function used by both the workspace nav and the legacy side panel.
- **[Risk]**: Reusing `<ClaimGraphNode>` directly might throw errors if the virtual node does not have real status conditions or deletion timestamps.
- **[Mitigation]**: Ensure our virtual tree builder populates mock/safe status conditions (e.g., status is ready/synced templates) or customize the node component to safely handle virtual mock nodes without throwing exceptions.
- **[Risk]**: The full-page view breaks the "in-context" flow of sliding drawers.
- **[Mitigation]**: We keep the sliding drawer for quick checks from the list view, providing an explicit opt-in button ("Open Workspace") for deep dives.
