## Why

Modern Crossplane compositions rely heavily on Composition Functions (`spec.pipeline`) rather than static resources (`spec.resources`). The current `CompositionViewer` only displays raw YAML inputs for pipeline steps and does not visualize the underlying resources, their patch-based data flows, or their dependencies. This change provides rich visualization of composition pipeline blueprints, their data exchanges, and their active instance relationships to make development and troubleshooting of Crossplane compositions intuitive.

## What Changes

- **Static Pipeline Resource Extraction**: Parse and visualize composed resources defined inside `function-patch-and-transform` step inputs within `spec.pipeline`.
- **Composition Relations & Active Claims**: Enhance the Composition `Relations` tab to detect Composition resources and display all active, matching namespace-scoped Claims with direct links to their dynamic dependency graphs.
- **Value Exchange Mapping (Data Flow)**: Add a dedicated "Data Flow" tab to composed resource panels (both legacy and pipeline) to display incoming and outgoing patches with field paths and transformations.
- **Pipeline Dependency Support (Backend)**: Upgrade the Go backend `analyser.go` engine to scan `spec.pipeline` step inputs, restoring functional dependency graph resolution (the "Dependencies" tab) for modern pipeline compositions.

## Capabilities

### New Capabilities
- `composition-pipeline-visualization`: Rich interactive visualization of composed resources, patch-based value exchanges (Data Flow), and computed dependency flows inside Composition pipelines.

### Modified Capabilities
- `port-remaining-views`: Enhancing the Composition viewer within the port-remaining-views scope to handle nested resource panels and active claim lookups in its Relations tab.

## Impact

- **Frontend (React/TypeScript)**: Updates to `CompositionViewer.tsx`, `ResourceRelations.tsx`, `KubernetesResourceViewer.tsx`, and `GenericResourceViewer.tsx`.
- **Backend (Go)**: Refactoring `internal/crossplane/innervision/composition/dependency/analyser.go` to traverse `spec.pipeline` and extract ComposedTemplates from `function-patch-and-transform` step inputs.
- **APIs**: Restores complete graphs for `/crossplane/compositions/:name/dependencies` on pipeline-based compositions.
