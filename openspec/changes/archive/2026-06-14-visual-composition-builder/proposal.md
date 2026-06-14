## Why

Writing Crossplane Compositions (especially those involving complex patch-and-transform operations) is notoriously difficult and error-prone, acting as a major barrier to adoption. This change introduces a Visual Composition Builder—a drag-and-drop, node-based canvas editor. By allowing users to visually link Composite Resource fields to Managed Resource fields, we can abstract away the complexity of YAML patch syntax and eliminate syntax errors, transitioning the tool from a read-only observability platform to a powerful authoring environment.

## What Changes

- Introduce a new "Canvas" mode in the Composition Workspace UI alongside the existing code editor.
- Implement a bi-directional parsing engine that converts Crossplane Composition YAML into an Intermediate Representation (IR) and then into React Flow nodes/edges, and vice versa.
- Add an interactive visual patch editor (the "Inspector") for configuring sequences of transformations (map, string, math, etc.) as stackable blocks.
- Integrate seamlessly with the upcoming `sandbox-dryrun-engine` to provide a real-time preview of transformation outputs within the visual editor.

## Capabilities

### New Capabilities
- `visual-composition-builder`: The core React Flow canvas, node/edge generation, and bi-directional YAML ↔ IR ↔ Graph synchronization engine.
- `visual-transform-pipeline`: The side-panel inspector for composing and previewing patch transformations using stackable blocks.

### Modified Capabilities
- `composition-workspace`: Added a new mode (Canvas) and state management to orchestrate synchronization between the Monaco text editor, the Canvas editor, and the Sandbox.

## Impact

- **Frontend**: Major additions to the UI using `@xyflow/react`. Requires implementing a robust AST-based YAML parser (e.g., the `yaml` npm package) to maintain formatting during bi-directional edits. Significant changes to `CompositionWorkspace.tsx` to handle the shared state between Monaco and the Canvas.
- **UX**: Introduces a completely new paradigm for interacting with Compositions.
