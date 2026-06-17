## Context

The No-Code Builder (Interactive Canvas) is implemented inside `CompositionCanvas.tsx` using `@xyflow/react` (React Flow). It parses Crossplane compositions and displays:
- **Composite Input (XRD)** as a custom node (`compositeInput`)
- **Managed Resources (MRs)** as custom nodes (`managedResource`)
- **Composite Output** as a custom node (`compositeOutput`)
- **Patches** as directed edges (`Edge`) linking fields/handles between these nodes.

Currently, hovering over or clicking a field does not offer any visual highlighting, making it difficult for developers to trace data flow through complex compositions.

## Goals / Non-Goals

**Goals:**
- Provide clear, high-signal visual tracing on hover and click for individual attributes (fields) inside all custom nodes.
- Highlight active edges (with thicker, animated, or brightly-colored strokes) and related attributes on target/source nodes.
- Dim non-connected elements (reducing opacity to 25%) to eliminate background noise.
- Freeze highlights on-click to allow detailed examination of connections.
- Ensure 60fps responsiveness during hover and transitions.

**Non-Goals:**
- Interactive patch value editing or drag-and-drop transformation mapping inside the Canvas (only existing links/patches are traced).
- Modification of the underlying YAML parser or AST-based path updates.

## Decisions

### 1. Unified React State for Active Selection
We will introduce a single active state at the top level of `CompositionCanvas.tsx`:
```typescript
interface ActiveAttribute {
  nodeId: string;
  field: string;
  isLocked: boolean;
}

const [activeAttribute, setActiveAttribute] = useState<ActiveAttribute | null>(null);
```
- This simple data structure covers both hover states (`isLocked: false`) and clicked states (`isLocked: true`).
- A single state minimizes synchronization bugs and guarantees a single source of truth.

### 2. High-Performance Memoized Tracing Calculation
To prevent recalculating connection paths during mouse moves, we will compute the highlighted edges and fields inside a `useMemo` block that runs whenever `activeAttribute` or the `edges` array changes:
```typescript
const { highlightedEdges, highlightedFieldsMap } = useMemo(() => {
  const highlightedEdges = new Set<string>();
  const highlightedFieldsMap: Record<string, Set<string>> = {};

  if (!activeAttribute) return { highlightedEdges, highlightedFieldsMap };

  edges.forEach((edge) => {
    const isSourceMatch = edge.source === activeAttribute.nodeId && edge.sourceHandle === activeAttribute.field;
    const isTargetMatch = edge.target === activeAttribute.nodeId && edge.targetHandle === activeAttribute.field;

    if (isSourceMatch || isTargetMatch) {
      highlightedEdges.add(edge.id);

      if (edge.source && edge.sourceHandle) {
        if (!highlightedFieldsMap[edge.source]) highlightedFieldsMap[edge.source] = new Set();
        highlightedFieldsMap[edge.source].add(edge.sourceHandle);
      }
      if (edge.target && edge.targetHandle) {
        if (!highlightedFieldsMap[edge.target]) highlightedFieldsMap[edge.target] = new Set();
        highlightedFieldsMap[edge.target].add(edge.targetHandle);
      }
    }
  });

  return { highlightedEdges, highlightedFieldsMap };
}, [activeAttribute, edges]);
```

### 3. Dynamic Node 'data' Prop and Callback Injection
We will inject interactive event handlers and the pre-computed active states directly into the custom nodes' `data` prop inside the `useEffect` that maps IR to React Flow Nodes:
- `activeAttribute`: Pass down to help nodes identify if their fields are active.
- `highlightedFields`: Pass down the specific `Set` of highlighted fields for that node.
- `onAttributeHoverEnter(field)`: Set active attribute with `isLocked: false`.
- `onAttributeHoverLeave()`: Clear active attribute if not locked.
- `onAttributeClick(field)`: Set active attribute with `isLocked: true`.

### 4. High-Contrast Tailwind Styles
- **Active Attribute (Primary)**:
  - Dark nodes (`CompositeInput`, `CompositeOutput`): Indigo-500/20 background, Indigo border/ring, glowing shadow.
  - Light nodes (`ManagedResource`): Indigo-50 background, Indigo border/ring.
- **Linked Attribute (Secondary)**:
  - Dark nodes: Emerald-500/20 background, Emerald border.
  - Light nodes: Emerald-50 background, Emerald border.
- **Dimmed Elements**:
  - Non-connected attributes and handles: `opacity-25` to provide a strong focal point on the active path.
- **Dynamic Edges**:
  - Inactive: `stroke: '#cbd5e1'`, `strokeWidth: 1.5`, `opacity: 0.3`, `animated: false`.
  - Active input: `stroke: '#818cf8'`, `strokeWidth: 4`, `animated: true`.
  - Active output: `stroke: '#10b981'`, `strokeWidth: 4`, `strokeDasharray: '5,5'`, `animated: true`.

## Risks / Trade-offs

- **[Risk] Hover Lag** → On-hover updates trigger quick parent re-renders.
  - *Mitigation*: Our graph is small/medium-sized. By memoizing the active-path calculation and using standard React functional updates, re-renders are extremely fast (<2ms), well below the frame budget.
- **[Risk] Event Bubbling on Field Click** → Clicking a field could select or drag the parent node.
  - *Mitigation*: Add `event.stopPropagation()` to the `onClick` handler of the field list item, and ensure the fields have the `nodrag` class.
- **[Risk] Clicking Empty Canvas Pane** → Needs to clear selection lock.
  - *Mitigation*: Tap into React Flow's native `onPaneClick` handler to trigger `setActiveAttribute(null)`.
