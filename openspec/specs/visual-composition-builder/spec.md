# visual-composition-builder Specification

## Purpose
TBD - created by archiving change visual-composition-builder. Update Purpose after archive.
## Requirements
### Requirement: Bi-directional Canvas Editor
The system SHALL provide a Canvas editor built with `@xyflow/react` that visually represents the Composition's Managed Resources as nodes and Patches as directed edges. The editor SHALL synchronize bi-directionally with the underlying YAML definition using an AST-based parser, ensuring that changes in the canvas update the YAML text without removing user comments, and manual edits in the YAML text automatically update the Canvas graph.

#### Scenario: Dragging a new Patch link
- **WHEN** the user drags a connection from a Composite Input handle to a Managed Resource field handle in the Canvas
- **THEN** the system generates a new `FromCompositeFieldPath` patch in the Composition's internal IR
- **THEN** the internal YAML AST is updated and pushed to the shared editor state, reflecting immediately in the Monaco editor

#### Scenario: Parsing complex YAML
- **WHEN** the user opens the Canvas for a Composition containing unsupported or highly complex patch semantics
- **THEN** the Canvas renders the supported elements normally and displays a "Read-Only / Complex Mode" warning to prevent accidental destructive visual edits

### Requirement: Data Flow Visualization
The canvas SHALL distinctly render `FromCompositeFieldPath` and `ToCompositeFieldPath` patches, visually differentiating inputs (Composite to MR) from outputs (MR to Composite status).

#### Scenario: Visualizing outputs
- **WHEN** a Composition maps a Managed Resource status to a Composite status field
- **THEN** an edge is drawn from the Managed Resource node back to a dedicated "Composite Output" node, styled differently (e.g., green dashed line) from input edges

