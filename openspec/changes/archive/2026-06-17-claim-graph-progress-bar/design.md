## Context

When users provision infrastructure claims via Crossplane, a tree of resources (Composites and Managed Resources) is created. Understanding how far along the provisioning process is can be difficult when looking at a large graph of nodes. A progress bar summarizing the readiness of the entire tree provides instant feedback.

## Goals / Non-Goals

**Goals:**
- Implement a recursive calculation of overall provisioning progress on the frontend based on the `ClaimTreeNode` tree.
- Display a modern Tailwind CSS progress bar with clear badges/labels in `ClaimGraph.tsx`.
- Support responsive and visually pleasing states for both active provisioning (blue gradient) and complete provisioning (emerald gradient).

**Non-Goals:**
- Adding a new backend endpoint to calculate progress (doing it purely in the frontend is extremely efficient since the tree structure is already fully loaded).
- Changing the Timeline view layout or the Diagnostic Hub view (this progress panel is specifically targeted for the dependency graph visualization).

## Decisions

### 1. Client-side Recursive Tree Traversal
- **Option A**: Implement progress calculation on the Go API server.
- **Option B**: Implement progress calculation in React by recursively traversing the resolved `ClaimTreeNode` tree (Chosen).
- **Rationale**: The Go API server already returns the complete `ClaimTree` hierarchy including status conditions for every node. Doing the traversal in React is extremely efficient, requires zero backend API changes, ensures live updates during auto-refreshes (every 15 seconds), and is trivial to write and maintain in TypeScript.

### 2. Readiness Criteria
- **Decision**: A resource is considered ready if its status conditions include a condition of `type: 'Ready'` and `status: 'True'`.
- **Rationale**: This is the standard indicator of terminal provisioning success in Crossplane and Kubernetes. It aligns perfectly with the `Activity` heart color (green) displayed on the node cards, preventing discrepancy between the progress bar and individual node visual states.

## Risks / Trade-offs

- **[Risk]** Nodes with no conditions or non-standard conditions might skew calculations.
  - **Mitigation**: Standard Crossplane Claims, XRs, and MRs always implement the `Ready` condition. For standard K8s or custom resources that may lack it, we treat them as not ready if they have conditions but none is `Ready: True`, which is standard.
- **[Risk]** An empty tree or root-only tree could result in divide-by-zero errors or incorrect percentages.
  - **Mitigation**: The stats function handles `total === 0` by returning a completion percentage of `0`.
