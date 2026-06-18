## 1. Custom React Flow Node

- [x] 1.1 Create a custom React Flow node component `BlueprintNode` (e.g., `BlueprintNode.tsx`) containing the details card rendering, handles (Left for inputs, Right for outputs), and logo layout.
- [x] 1.2 Support dynamic icon representation: blue `Layers` for the XRD root, animated `Cpu` for pipeline steps, and indigo `Layers` for composed resources.
- [x] 1.3 Register the `blueprintNode` in the `nodeTypes` mapping.

## 2. Layout & Transformation

- [x] 2.1 Implement the horizontal DFS layout algorithm to position GVK interfaces, pipeline steps, and resources on the X and Y axes.
- [x] 2.2 Center parent nodes (XRD, Step nodes) vertically relative to their children's mean Y.
- [x] 2.3 Write mapping functions to convert the virtual tree into React Flow nodes and edges, using animated blue (`#3b82f6`) edges to represent pipeline data flow.

## 3. Canvas Integration

- [x] 3.1 Update `CompositionGraph.tsx` to render `<ReactFlow>` using the mapped nodes, edges, and `nodeTypes`.
- [x] 3.2 Add the standard `<Background>`, `<Controls>`, and `<MiniMap>` components.
- [x] 3.3 Wire `onNodeClick` in React Flow to trigger the `onSelectNode` workspace callback.

## 4. Workspace Cleanup & Refactoring

- [x] 4.1 Update `CompositionWorkspace.tsx` to remove redundant HTML-based zoom buttons and zoom states.
- [x] 4.2 Ensure the production build is fully green with no errors.