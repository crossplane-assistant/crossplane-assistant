## Why

The current Composition Graph ("Blueprint Workflow Diagram") in `CompositionGraph.tsx` relies on a static HTML/CSS tree layout with simple line connectors. This design is rigid, lacks pan/zoom capabilities for complex pipelines with many steps and resources, and does not align with the modern interactive canvas aesthetics found elsewhere in the application. Migrating this diagram to a `React Flow` canvas provides an interactive, zoomable, and pannable visualization with animated execution flow edges, resulting in a cohesive workspace experience.

## What Changes

- Refactor `CompositionGraph.tsx` to utilize `@xyflow/react` for rendering the Blueprint Workflow Diagram.
- Implement an auto-centering horizontal recursive DFS layout algorithm to position GVK interface (root), pipeline steps, and composed resource nodes absolutely.
- Port the current card presentation details (icons, animated Cpu symbol for steps, metadata) into a custom React Flow node type `BlueprintNode`.
- Design animated execution flow edges connecting nodes (GVK interface -> Step -> Resource) to represent the flow of pipeline evaluation visually.
- Integrate interactive canvas controls (Zoom, Pan, Controls, Background dot grid, and MiniMap).
- Connect the React Flow `onNodeClick` handler to trigger the existing node selection callback.

## Capabilities

### New Capabilities

### Modified Capabilities
- `composition-graph-view`: The "Composition Graph" will transition from a static flexbox horizontal tree layout to an interactive React Flow canvas with automatic centering, zoom/pan navigation, and animated edges.

## Impact

- **UI Components:** Modifies `ui/src/components/CompositionGraph.tsx` and adds a custom node type.
- **Parent Components:** Simplifies workspace toolbar integration in `CompositionWorkspace.tsx` by letting React Flow handle zoom controls natively.
- **Styling:** Cleans up unused CSS classes and leverages the established `@xyflow/react` styles.