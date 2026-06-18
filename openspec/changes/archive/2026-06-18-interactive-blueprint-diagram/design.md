## Context

The current Composition Graph ("Blueprint Workflow Diagram") in `CompositionGraph.tsx` relies on a static horizontal tree layout rendered using simple HTML/CSS. This static layout becomes difficult to navigate when dealing with complex multi-step pipelines. 

To provide a consistent, modern, and high-quality canvas experience across all views, we will refactor the Blueprint Workflow Diagram to use `@xyflow/react` (React Flow). This will bring zoom/pan navigation, visual nodes with custom status animations, and animated execution lines to the composition sandbox.

## Goals / Non-Goals

**Goals:**
- Replace the static tree structure in `CompositionGraph.tsx` with a React Flow interactive canvas.
- Preserve 100% of the nodes' metadata (name, kind, apiVersion, custom step indicators).
- Use an elegant horizontal centering DFS algorithm to position nodes dynamically.
- Implement animated execution flow edges connecting XRD -> Steps -> Resources to visually trace the pipeline flow.
- Seamlessly transition manual zoom buttons in `CompositionWorkspace.tsx` to utilize React Flow's native canvas capabilities or gracefully deprecate them.

**Non-Goals:**
- Allowing resource composition edits on this specific diagram (this is a view-only architectural blueprint; edits happen in the separate canvas if applicable).
- Changing the underlying virtual tree construction helper (`buildVirtualTree`).

## Decisions

**1. Sizing and Horizontal DFS Layout**
- **Decision:** Position the root GVK interface node at `x = 50`. Each subsequent level (Step nodes, Resource nodes) increments X by `400px`. Leaves are stacked vertically with a step of `110px`, while parents are centered vertically on their children's mean Y.
- **Rationale:** Keeps the horizontal pipeline structure easily readable and prevents overlaps.

**2. Custom Node Component**
- **Decision:** Create a custom React Flow node component `BlueprintNode` (registered under type `blueprintNode`) that renders the existing logo/details layout.
- **Rationale:** Ensures zero loss of visual indicators and keeps consistent formatting (monospaced fonts, colored badges, spinning CPU icons for Steps).

**3. Animated Flow Edges**
- **Decision:** Use animated dashed edges connecting XRD to Steps, and Steps to Resources, showing active data processing flow.
- **Rationale:** Visually reinforces the "pipeline execution" metaphor of Crossplane compositions.

## Risks / Trade-offs

- [Risk] Redundant zoom controls in `CompositionWorkspace.tsx` toolbar conflicting with React Flow's mouse zoom. → **Mitigation:** We can refactor `CompositionWorkspace.tsx` to remove the redundant HTML-based zoom controls, letting the user utilize native React Flow controls (or we can bind the toolbar buttons to the React Flow instance via `useReactFlow` if we want to preserve them). Let's prefer removing the redundant controls for simplicity and standardizing on React Flow's controls.