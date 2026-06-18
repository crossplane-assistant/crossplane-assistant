## Why

The current Claim dependency graph view uses a static HTML/CSS Flexbox tree implementation that limits user interaction and can suffer from visual overlap or truncation when displaying rich metadata. By migrating to a `React Flow` interactive canvas (similar to the one used in the Composition Builder), we will provide users with a unified, dynamic, and navigable experience (zoom, pan, minimap). Furthermore, this transition will allow us to represent the provisioning status of resources vividly via animated edges (e.g., flowing data/energy for provisioning, solid for ready states).

## What Changes

- Refactor `ClaimGraph.tsx` to utilize `@xyflow/react` for rendering the dependency tree.
- Implement a recursive, auto-centering DFS layout algorithm to position nodes horizontally.
- Migrate existing static node rendering (`ClaimGraphNode.tsx`) into a custom React Flow node type to retain 100% of current metadata (logos, version, age, management policies, status icons).
- Implement dynamic edge styling and animation based on the provisioning status of target resources (animated blue for provisioning, solid green for ready, pulsing red/orange for errors or deletion).
- Add interactive canvas controls (Controls, Background dot grid, MiniMap).
- Maintain existing graph interaction features like clicking a node to open the side details drawer.

## Capabilities

### New Capabilities

### Modified Capabilities
- `claim-dependency-graph`: The view will transition from a static flexbox layout to an interactive canvas layout, introducing panning, zooming, and dynamic edge animations while retaining all current node information and interaction patterns.

## Impact

- **UI Components:** Modifies `ui/src/components/ClaimGraph.tsx` and requires creating a new custom node component for React Flow based on `ClaimGraphNode.tsx`.
- **Styling:** CSS related to `.graph-wrapper` and `.connector` in `ui/src/index.css` may become obsolete or require cleanup.
- **Dependencies:** Leverages the already installed `@xyflow/react` dependency.