## ADDED Requirements

### Requirement: Composed Resource Patch Data Flow Tab
Each composed resource viewer (including generic, kubernetes, and terraform resource panels) SHALL feature a dedicated "Data Flow" tab. This tab SHALL parse and display the resource's `patches` configuration in a structured, readable tabular format. It SHALL classify patches into "Incoming Inputs" (type `FromCompositeFieldPath` or `CombineFromComposite`) and "Outgoing Outputs" (type `ToCompositeFieldPath` or `CombineToComposite`). It SHALL show the source field path, target field path, and any mapping/conversion transformations.

#### Scenario: Visualizing Composed Resource Patches
- **WHEN** the user opens a composed resource panel in the Composition details and selects the "Data Flow" tab
- **THEN** the system lists all incoming patches (from Composite field paths to Resource field paths)
- **THEN** the system lists all outgoing patches (from Resource field paths to Composite field paths, e.g. status)

### Requirement: Go Backend Pipeline Dependency Analyser
The Go backend composition dependency analyzer SHALL be upgraded to support pipeline-based Compositions (`spec.pipeline`). It SHALL scan all steps in the pipeline, and if a step uses `function-patch-and-transform` with step inputs containing a list of `resources`, it SHALL extract and index these resource templates identically to legacy `spec.resources`. The analyzer SHALL compute patch-based dependencies among these resources and return them via the `/crossplane/compositions/:name/dependencies` API endpoint. On the frontend, the computed dependency graph SHALL be rendered in the "Dependencies" tab of each pipeline composed resource.

#### Scenario: Resolving Pipeline Compositions Dependencies in Backend
- **WHEN** the backend receives a request for `/crossplane/compositions/:name/dependencies` for a pipeline-based composition
- **THEN** the analyzer parses the pipeline steps and extracts resources from `function-patch-and-transform` inputs
- **THEN** it indexes their patches and computes dependencies (edges) where one resource outputs to a field that another resource reads from
- **THEN** it returns the resource list and computed edges in a JSON payload

#### Scenario: Visualizing Pipeline Composed Resource Dependencies
- **WHEN** the user views a pipeline composed resource panel in the UI and selects the "Dependencies" tab
- **THEN** the system displays the incoming and outgoing dependencies computed from the backend's resource graph
