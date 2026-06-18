## Context

Currently, the Dependency Graph view in the Crossplane Assistant (`ClaimGraph.tsx`) relies on a static HTML/CSS Flexbox tree layout. As Claim trees grow complex (deep composition trees, many resources), the static view scales poorly. Node cards overlap when horizontal width limits are exceeded, and users cannot pan, zoom, or focus on specific areas.

Concurrently, the application already uses `@xyflow/react` (React Flow) for its Interactive Canvas (No-Code Builder). Utilizing React Flow for the Dependency Graph provides a unified experience across the application, solves the scaling and interaction issues, and allows for visually conveying the provisioning state through animated edges.

## Goals / Non-Goals

**Goals:**
- Replace the static Flexbox graph in `ClaimGraph.tsx` with a React Flow interactive canvas.
- Maintain 100% of the metadata and visual cues currently present on the node cards (managed policies, readiness status, sync status, age, namespace, version).
- Automatically layout the graph horizontally using a deterministic recursive DFS algorithm.
- Implement edge styles that reflect provisioning states (animated blue for provisioning, solid green for ready).
- Maintain interaction hooks, specifically the detail drawer upon node click.

**Non-Goals:**
- Allowing users to drag, drop, or manually connect edges (this is a read-only dependency graph).
- Changing the underlying Claim dependency tree fetching logic or data structures.
- Altering the Gantt Timeline or Diagnostic Hub views.

## Decisions

**1. Layout Algorithm**
- **Decision:** We will implement a custom recursive Depth-First Search (DFS) algorithm to calculate absolute `{x, y}` coordinates for nodes.
- **Rationale:** React Flow requires absolute positioning. Given the hierarchical nature of our dependency tree, an auto-centering layout where parents are vertically aligned with their children provides the best visual hierarchy.
- **Alternatives:** Using a layout library like `dagre`. Given the strict horizontal tree shape we want, a custom 20-line recursive function is more lightweight and precise than pulling in `dagre` just for this.

**2. Custom Node Component**
- **Decision:** Create a new React Flow custom node type (e.g., `dependencyNode`) that essentially wraps the existing `ClaimGraphNode` UI.
- **Rationale:** React Flow allows custom HTML nodes. By wrapping the existing UI logic, we ensure zero loss of information and maintain visual consistency with the previous iteration.

**3. Edge Styling for Status**
- **Decision:** The edges connecting a parent to a child will determine their style based on the **child's** status.
- **Rationale:** If a child is not ready, the "flow" of provisioning is still actively targeting it, represented by an animated edge. Once the child is ready, the flow becomes a solid, stable line.

## Risks / Trade-offs

- [Risk] Performance with very large dependency trees. → **Mitigation:** React Flow handles virtualization automatically via `fitView` and only renders visible nodes, which should improve performance over the static DOM approach for massive trees.
- [Risk] Visual disjoint between the custom node sizing and the computed layout. → **Mitigation:** We will use fixed or predictable widths and vertical gaps in the layout algorithm to ensure cards do not overlap.