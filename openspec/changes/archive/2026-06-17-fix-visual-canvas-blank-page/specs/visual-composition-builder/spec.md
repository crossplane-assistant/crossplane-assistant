## MODIFIED Requirements

### Requirement: Interactive Attribute Connection Tracing
The No-Code Builder canvas SHALL support visual connection tracing when hovering over an attribute (handle/field) of any custom node (Composite Input, Managed Resource, or Composite Output). When hovered, the canvas SHALL highlight all connected edges and target/source attributes across all nodes, while dimming all non-connected edges and attributes to an opacity of 30% or less. This tracing capability MUST be computed dynamically during render passes and SHALL NOT trigger state changes in the underlying node/edge positions or structure, ensuring 100% loop-free React rendering performance.

#### Scenario: Hovering over a Composite Input attribute
- **WHEN** the user hovers over a field/handle inside the Composite Input node
- **THEN** all edges connected to that source handle are highlighted with an active visual style (increased thickness, vibrant color)
- **THEN** all corresponding target attributes inside Managed Resource nodes are highlighted
- **THEN** all other non-connected attributes and edges are dimmed to 25% opacity
