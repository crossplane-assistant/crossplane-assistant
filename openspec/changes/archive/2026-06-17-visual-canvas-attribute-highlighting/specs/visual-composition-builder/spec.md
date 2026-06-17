## ADDED Requirements

### Requirement: Interactive Attribute Connection Tracing
The No-Code Builder canvas SHALL support visual connection tracing when hovering over an attribute (handle/field) of any custom node (Composite Input, Managed Resource, or Composite Output). When hovered, the canvas SHALL highlight all connected edges and target/source attributes across all nodes, while dimming all non-connected edges and attributes to an opacity of 30% or less.

#### Scenario: Hovering over a Composite Input attribute
- **WHEN** the user hovers over a field/handle inside the Composite Input node
- **THEN** all edges connected to that source handle are highlighted with an active visual style (increased thickness, vibrant color)
- **THEN** all corresponding target attributes inside Managed Resource nodes are highlighted
- **THEN** all other non-connected attributes and edges are dimmed to 25% opacity

#### Scenario: Mouse leaving a hovered attribute without lock
- **WHEN** the mouse leaves a hovered attribute and no attribute selection is locked
- **THEN** the active tracing highlights are cleared
- **THEN** all attributes and edges revert to their standard visual representation and opacity

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
