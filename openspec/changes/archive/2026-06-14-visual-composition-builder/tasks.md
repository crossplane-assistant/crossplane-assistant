## 1. Core Engine: AST Parsing and IR
- [x] 1.1 Add `yaml` dependency to the frontend package (`ui/package.json`)
- [x] 1.2 Implement the YAML-to-IR parser (extracting `spec.resources` or `spec.pipeline` resources)
- [x] 1.3 Implement the IR-to-YAML updater (using AST nodes to inject patches without losing comments)
- [x] 1.4 Write unit tests for bi-directional parsing

## 2. Canvas UI Setup
- [x] 2.1 Add `@xyflow/react` dependency to the frontend package
- [x] 2.2 Create the `CompositionCanvas` component and initialize the React Flow instance
- [x] 2.3 Implement the IR-to-Graph mapper (converting IR resources to Nodes and Patches to Edges)
- [x] 2.4 Add auto-layout logic (using `dagre` or similar) for initial node positioning

## 3. Node and Edge Interactions
- [x] 3.1 Implement custom Node component for Composite Input (displaying `spec` fields based on XRD schema)
- [x] 3.2 Implement custom Node component for Managed Resources (dynamic handles based on resource fields)
- [x] 3.3 Implement custom Edge component to visualize Transforms (interactive badge)
- [x] 3.4 Wire up React Flow's `onConnect` to trigger an IR update (creating a new Patch)

## 4. Transform Inspector & State Management
- [x] 4.1 Update `CompositionWorkspace` state management to sync Monaco text changes to the IR, and IR changes to Monaco text
- [x] 4.2 Create the `TransformInspector` side-panel component
- [x] 4.3 Implement stackable block UI for editing `map`, `math`, and `string` transform operations
- [x] 4.4 Add a Live Preview input in the Inspector to compute the output of the selected transformations locally

## 5. Integration and Polish
- [x] 5.1 Implement the "Visual Canvas" toggle in the Workspace header
- [x] 5.2 Add "Complex YAML" fallback warning mode when the AST parser detects unsupported structure
- [x] 5.3 Test integration with the `sandbox-dryrun-engine` context (sharing the updated YAML state)
