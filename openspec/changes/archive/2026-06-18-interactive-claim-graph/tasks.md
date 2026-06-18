## 1. Custom React Flow Node

- [x] 1.1 Extract `ClaimGraphNode` UI elements and metadata rendering logic into a new React Flow custom node component (e.g., `DependencyNode.tsx`).
- [x] 1.2 Ensure the custom node handles the `Ready` and `Synced` status conditions, displaying the correct icons and colors.
- [x] 1.3 Ensure the custom node correctly calculates and formats the `age` timestamp.
- [x] 1.4 Register the new `dependencyNode` in the `nodeTypes` mapping.

## 2. Layout Algorithm

- [x] 2.1 Implement the recursive DFS tree layout algorithm in a utility file (or directly in `ClaimGraph.tsx`) to traverse the `ClaimTreeNode` structure.
- [x] 2.2 The algorithm should generate absolute `{x, y}` coordinates for every node, centering parent nodes vertically with respect to their children.

## 3. Data Transformation

- [x] 3.1 Write a transformation function to convert the nested `ClaimTreeNode` tree into a flat array of React Flow `Node` objects, assigning the calculated `{x,y}` coordinates.
- [x] 3.2 Write a transformation function to generate the React Flow `Edge` objects connecting parent nodes to child nodes.
- [x] 3.3 Apply dynamic styles to the generated `Edge` objects: solid green (`#10b981`) if the target node is `Ready`, and animated blue (`#3b82f6`) if it is not ready.

## 4. Canvas Integration & Interactivity

- [x] 4.1 Update `ClaimGraph.tsx` to render `<ReactFlow>` using the generated nodes, edges, and custom `nodeTypes`.
- [x] 4.2 Include standard React Flow controls (`<Background>`, `<Controls>`, `<MiniMap>`).
- [x] 4.3 Implement `onNodeClick` handler in the React Flow canvas to trigger the existing `onSelectNode` callback, preserving the side details drawer functionality.
- [x] 4.4 Remove obsolete CSS rules (`.graph-wrapper`, `.connector`) from `index.css` related to the old static Flexbox implementation.