## Context

The stateful updates inside the `useEffect` of `CompositionCanvas.tsx` trigger state synchronizations of `nodes` and `edges` whenever `activeAttribute`, `highlightedEdges`, or `highlightedFieldsMap` change. This causes a cyclic dependency because `highlightedEdges`/`highlightedFieldsMap` are derived from the `edges` state. When the edge style updates, it triggers another state update, causing an infinite rendering loop and a blank screen.

## Goals / Non-Goals

**Goals:**
- Decouple the React Flow rendering structure from the interactive highlighting states.
- Eliminate the infinite rendering loop by using functional, render-time projection (`useMemo`).
- Keep the `useEffect` dependent ONLY on the parsed `ir` and standard state setters (`setNodes`/`setEdges`).

**Non-Goals:**
- Change node layout algorithms or position coordinates.

## Decisions

### 1. Stable Callback References
Use `useCallback` to define `onAttributeHoverEnter`, `onAttributeHoverLeave`, and `onAttributeClick` with empty dependency arrays (or only `[setActiveAttribute]`). This guarantees their identities remain unchanged between render passes.

### 2. Isolate structural node/edge generation from visual highlighting
Refactor the main `useEffect` to map only the base structure, types, IDs, fields, positions, and static layouts, and run **only** when `ir` changes:
```typescript
useEffect(() => {
  if (!ir) return;
  // create nodes and edges structure
  setNodes(newNodes);
  setEdges(newEdges);
}, [ir, setNodes, setEdges]);
```

### 3. Pure Dynamic Highlight Projection
Derive `processedNodes` and `processedEdges` at render-time using `useMemo` hooks. These blocks will merge base states with active hover/click highlights, passing the final styled objects directly to `<ReactFlow>`:
```typescript
const processedNodes = useMemo(() => {
  return nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      activeAttribute,
      highlightedFields: highlightedFieldsMap[node.id],
      onAttributeHoverEnter: (field: string) => onAttributeHoverEnter(node.id, field),
      onAttributeHoverLeave,
      onAttributeClick: (field: string) => onAttributeClick(node.id, field),
    },
  }));
}, [nodes, activeAttribute, highlightedFieldsMap, onAttributeHoverEnter, onAttributeHoverLeave, onAttributeClick]);
```

## Risks / Trade-offs

- **[Risk] Complex Component States** → None. This refactor actually simplifies state management by eliminating asynchronous state synchronization.
