## Context

The current `CompositionWorkspace` relies heavily on Monaco editors to allow users to view and edit Crossplane Compositions. While this is sufficient for exploration, creating new Compositions or modifying complex `Patch` and `Transform` structures is highly error-prone. We want to implement a Node-based Canvas Editor (using `@xyflow/react`) to provide a No-Code/Low-Code authoring experience, making the creation of Compositions accessible to a wider audience. This feature will also integrate with the `sandbox-dryrun-engine` to provide real-time testing capabilities.

## Goals / Non-Goals

**Goals:**
- Provide a split-pane interface in the `CompositionWorkspace` containing both a textual YAML editor (Monaco) and a Visual Canvas (React Flow).
- Ensure a 100% bi-directional synchronization between the text editor and the visual canvas without destroying formatting or comments.
- Create a visual representation of Managed Resources (Nodes) and Patches (Edges).
- Implement a properties side-panel (Inspector) to easily stack and configure Transformation operations.

**Non-Goals:**
- Supporting every single edge-case feature of the Crossplane API from day one. If a user writes an overly complex YAML structure that the IR cannot map, the canvas will gracefully fallback to a Read-Only or unsupported state.
- Replacing the textual editor. The text editor remains the absolute source of truth.

## Decisions

### Decision 1: Three-Layer Architecture (YAML ↔ IR ↔ Graph)
- **Decision**: We will decouple the visual library (React Flow) from the Crossplane YAML by introducing an Intermediate Representation (IR) layer.
  - **YAML Source**: Handled by an AST-based parser (the `yaml` npm package) to preserve document structure and comments.
  - **Intermediate Representation (IR)**: A logical TypeScript object graph representing the Composite Input, Managed Resources, and Data Flows (Patches).
  - **React Flow Graph**: The visual representation (Nodes and Edges) generated purely from the IR.

### Decision 2: Visual Representation of Transformations
- **Decision**: Instead of cluttering the canvas with individual nodes for every transformation (e.g., Map, String Format), we will use an **Active Edge + Panel Inspector** approach.
  - Edges between resources will display an interactive badge summarizing the transformations.
  - Clicking an edge will open a side panel allowing users to stack and configure transformations in a Lego-like interface.

### Decision 3: Shared Editor State
- **Decision**: A central `CompositionContext` (or Zustand store) will hold the current raw YAML string as the ultimate source of truth.
  - Changes in the Canvas update the AST, serialize it back to YAML, and push it to the store.
  - Changes in Monaco parse the YAML, update the IR, and trigger a re-render of the Canvas.

## Risks / Trade-offs

- **[Risk] Complex bi-directional AST mapping** → *Mitigation*: We will start with a strict subset of supported `Patch` types (`FromCompositeFieldPath`, `ToCompositeFieldPath`, `CombineFromComposite`) and progressively add support for edge cases. Unrecognized patches will be preserved in the YAML but not necessarily visualised.
- **[Risk] Canvas Cluttering with many resources** → *Mitigation*: Implement auto-layout algorithms (e.g., using `dagre` or `elkjs`) to organize nodes intelligently, and allow grouping or collapsing of nodes.
