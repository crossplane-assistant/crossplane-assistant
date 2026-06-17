## 1. Core State and Dynamic Calculations in CompositionCanvas

- [x] 1.1 Add the `ActiveAttribute` interface and initialize the `activeAttribute` state at the top level of `CompositionCanvas` in `CompositionCanvas.tsx`.
- [x] 1.2 Implement the `useMemo` block in `CompositionCanvas` to compute the set of `highlightedEdges` and the `highlightedFieldsMap` (mapping each nodeId to its set of active/highlighted fields) whenever `activeAttribute` or `edges` changes.

## 2. React Flow Prop Injection and Global Handlers

- [x] 2.1 In the `useEffect` that maps IR to React Flow Nodes, inject `activeAttribute`, the node-specific `highlightedFields` set, and handlers (`onAttributeHoverEnter`, `onAttributeHoverLeave`, `onAttributeClick`) into the `data` prop of each custom node.
- [x] 2.2 Bind the `onPaneClick` event in the `<ReactFlow>` component to call `setActiveAttribute(null)` so clicking on the empty canvas area releases any frozen highlights.

## 3. Custom Node Enhancements & Style States

- [x] 3.1 Refactor the `CompositeInputNode` custom node component to support mouse enter/leave and click events on field containers, applying high-contrast Tailwind classes for active, linked, dimmed, and default states.
- [x] 3.2 Refactor the `ManagedResourceNode` custom node component to bind events and apply custom styles for inputs and outputs independently, respecting active, linked, dimmed, and default states.
- [x] 3.3 Refactor the `CompositeOutputNode` custom node component to bind events and apply active, linked, dimmed, and default style states.

## 4. Edge Dynamic Styling

- [x] 4.1 Refactor the edge creation code in the main mapping `useEffect` to style edges dynamically: active edges get a thicker stroke (width: 4) and are animated, while inactive edges are dimmed when another connection is being traced.

## 5. Verification and Automated Testing

- [x] 5.1 Create or update unit tests to verify the state transitions (hover, leave, click/lock, unlock) and visual canvas highlighting state calculations.
- [x] 5.2 Execute TypeScript build verification and lint checks on the frontend to ensure all changes are compliant and error-free.
