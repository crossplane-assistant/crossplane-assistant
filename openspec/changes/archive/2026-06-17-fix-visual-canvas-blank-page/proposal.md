## Why

Following the implementation of attribute highlighting, the Interactive Canvas (Visual Canvas) page crashes with a blank screen. This is caused by an infinite React render loop inside `CompositionCanvas.tsx`: the main mapping `useEffect` updates the stateful `nodes` and `edges` arrays when highlights change, but the highlight calculation relies on these arrays, creating a cyclic reference dependency.

## What Changes

- Redesign `CompositionCanvas.tsx` to use pure functional React projection for highlighting.
- Restrict the `useEffect` hook to ONLY run when the underlying IR (YAML) changes, setting stable, static nodes and edges in state.
- Define selection callbacks (`onAttributeHoverEnter`, `onAttributeHoverLeave`, `onAttributeClick`) using stable `useCallback` references.
- Dynamically project interactive callbacks and highlighting styles (active/linked/dimmed) onto nodes and edges using `processedNodes` and `processedEdges` memoized blocks, ensuring rendering passes never update local states.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `visual-composition-builder`: Refine the interaction specs to guarantee loop-free, high-performance rendering of highlighted attributes.

## Impact

- **UI Components**:
  - `ui/src/components/CompositionCanvas.tsx`: Restructure state hooks, useCallbacks, useMemos, and useEffect dependencies.
- **Verification**:
  - Execute automated tests and build check to verify 100% loop-free rendering.
