## MODIFIED Requirements

### Requirement: Advanced Composition Details Viewer
The composition details viewer SHALL render the Composition Function Pipeline steps if a pipeline is defined (`spec.pipeline`), or the list of composed resources if resources are defined (`spec.resources`). For compositions using `spec.pipeline`, the viewer SHALL parse and extract the composed resources declared within `function-patch-and-transform` step inputs and render them using collapsible, nested resource panels. The resource panels inside the viewer SHALL support being pre-expanded by default if there are only a few items, and provide global expand/collapse controls. It SHALL also display the Composite Type Reference (XRD) implemented by the composition. Additionally, when a Composition is explored, its Relations tab SHALL query active namespace-scoped Claims, filter them to match the Composition GVK, and present them with direct links to their dynamic dependency graphs.

#### Scenario: Visualizing a Composition with Pipeline Steps and Extracted Resources
- **WHEN** the user views a composition that uses Composition Functions via `spec.pipeline`
- **THEN** the system lists the ordered pipeline steps with step names, function references, and their input configurations in a YAML view
- **THEN** for steps using `function-patch-and-transform`, the system extracts and displays the underlying composed resources in nested panels using `<DynamicResourceViewer>`

#### Scenario: Visualizing Composition Interface and Resource Controls
- **WHEN** the user opens the View tab of a composition
- **THEN** the system displays the compositeTypeRef Kind and ApiVersion at the top as the XRD interface signature
- **THEN** the resource collapsible panels are initialized in an open (expanded) state if there are 3 or fewer resources, and can be collapsed/expanded individually or globally

#### Scenario: Visualizing Composition Relations and Active Claims
- **WHEN** the user views a Composition and switches to the Relations tab
- **THEN** the system displays the XRD API interface signature
- **THEN** the system queries active Claims, filters them by GVK matching the Composition's composite type ref, and lists them with direct action links to their live dependency graphs
