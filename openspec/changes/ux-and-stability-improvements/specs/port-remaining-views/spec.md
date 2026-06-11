## ADDED Requirements

### Requirement: Advanced Composition Details Viewer
The composition details viewer SHALL render the Composition Function Pipeline steps if a pipeline is defined (`spec.pipeline`), or the list of composed resources if resources are defined (`spec.resources`). The resource panels inside the viewer SHALL support being pre-expanded by default if there are only a few items, and provide global expand/collapse controls. It SHALL also display the Composite Type Reference (XRD) implemented by the composition.

#### Scenario: Visualizing a Composition with Pipeline Steps
- **WHEN** the user views a composition that uses Composition Functions via `spec.pipeline`
- **THEN** the system lists the ordered pipeline steps showing step names, function references, and their input configurations in a YAML view

#### Scenario: Visualizing Composition Interface and Resource Controls
- **WHEN** the user opens the View tab of a composition
- **THEN** the system displays the compositeTypeRef Kind and ApiVersion at the top as the XRD interface signature
- **THEN** the resource collapsible panels are initialized in an open (expanded) state if there are 3 or fewer resources, and can be collapsed/expanded individually or globally
