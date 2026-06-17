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

### Requirement: Interactive Attribute Connection Tracing
The No-Code Builder canvas SHALL support visual connection tracing when hovering over an attribute (handle/field) of any custom node (Composite Input, Managed Resource, or Composite Output). When hovered, the canvas SHALL highlight all connected edges and target/source attributes across all nodes, while dimming all non-connected edges and attributes to an opacity of 30% or less. This tracing capability MUST be computed dynamically during render passes and SHALL NOT trigger state changes in the underlying node/edge positions or structure, ensuring 100% loop-free React rendering performance.

#### Scenario: Hovering over a Composite Input attribute
- **WHEN** the user hovers over a field/handle inside the Composite Input node
- **THEN** all edges connected to that source handle are highlighted with an active visual style (increased thickness, vibrant color)
- **THEN** all corresponding target attributes inside Managed Resource nodes are highlighted
- **THEN** all other non-connected attributes and edges are dimmed to 25% opacity

### Requirement: Attribute Selection Freezing
The No-Code Builder canvas SHALL allow users to freeze (lock) the highlighted tracing state of an attribute by clicking on it. When locked, the selection SHALL remain highlighted even when the cursor leaves the attribute area, until the user clicks on another attribute or clicks on an empty canvas area.

#### Scenario: Clicking an attribute to freeze highlights
- **WHEN** the user clicks on an attribute in any custom node
- **THEN** the highlighted tracing state for that attribute and its connections is frozen
- **WHEN** the cursor leaves the attribute area
- **THEN** the highlights remain active and are not cleared

#### Scenario: Clicking another attribute while locked
- **WHEN** an attribute's highlights are locked
- **WHEN** the user clicks on a different attribute
- **THEN** the lock is released from the previous attribute and transferred to the new attribute
- **THEN** the canvas updates the visual highlights to reflect the newly locked attribute's connections

#### Scenario: Clicking empty canvas area to unlock highlights
- **WHEN** an attribute's highlights are locked
- **WHEN** the user clicks on an empty area of the canvas pane
- **THEN** the locked highlight state is cleared
- **THEN** all attributes and edges revert to their standard visual representation and opacity

