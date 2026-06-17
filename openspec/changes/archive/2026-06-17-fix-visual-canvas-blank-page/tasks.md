## 1. Stable Callback Definitions

- [x] 1.1 Import `useCallback` from 'react' if not already present.
- [x] 1.2 Refactor selection callbacks (`onAttributeHoverEnter`, `onAttributeHoverLeave`, `onAttributeClick`) as top-level `useCallback` hooks inside `CompositionCanvas`.

## 2. Isolate useEffect Hook

- [x] 2.1 Refactor the mapping `useEffect` to contain only the static structural creation of nodes and edges.
- [x] 2.2 Revert the `useEffect` dependencies list to `[ir, setNodes, setEdges]`. Remove all reference to `activeAttribute`, `highlightedEdges`, and `highlightedFieldsMap` from the `useEffect`.

## 3. Implement Dynamic Projection Memos

- [x] 3.1 Implement `processedNodes` using `useMemo` to project `activeAttribute`, `highlightedFields` and event callbacks onto `nodes`.
- [x] 3.2 Implement `processedEdges` using `useMemo` to project active and inactive style properties onto `edges`.

## 4. Update React Flow Component

- [x] 4.1 Update the `<ReactFlow>` rendering section in `CompositionCanvas` to use `processedNodes` as the `nodes` prop and `processedEdges` as the `edges` prop instead of the base state arrays.

## 5. Verification and Validation

- [x] 5.1 Execute vitest tests to confirm that all tests pass.
- [x] 5.2 Build the UI using `npx tsc --noEmit` to verify type completeness and verify there are no compilation errors.
