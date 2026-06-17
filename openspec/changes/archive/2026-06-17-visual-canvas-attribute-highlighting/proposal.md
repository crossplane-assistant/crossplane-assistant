## Why

Tracing field-to-field mappings (patches) in complex compositions is cognitively challenging. Users need an intuitive, interactive way to immediately identify where a given attribute is mapped, which other resource attributes it is linked to, and how the data flows across the workspace canvas.

## What Changes

- Add attribute hover highlighting in the No-Code Builder canvas panel: hovering over an attribute immediately highlights its incoming/outgoing links (edges) and connected target/source attributes, while dimming unrelated attributes and edges.
- Add click-to-lock/freeze interaction: clicking on an attribute freezes the highlight, allowing permanent inspection. The lock can be shifted by clicking another attribute, or deactivated by clicking elsewhere on the canvas.
- Introduce dynamic styling states for handles, edges, and field items inside `CompositeInputNode`, `ManagedResourceNode`, and `CompositeOutputNode`.
- Improve edge rendering to react to highlight states (glowing stroke, increased thickness, animation for active path; dimmed opacity for inactive path).

## Capabilities

### New Capabilities
<!-- None needed as we are extending the visual-composition-builder -->

### Modified Capabilities
- `visual-composition-builder`: Add requirements for interactive field-to-field connection tracing, hover states, and selection freezing inside the visual builder.

## Impact

- **UI Components**:
  - `ui/src/components/CompositionCanvas.tsx`: State management for `activeAttribute` (selected/hovered), dynamic edge styling, custom callbacks in custom node `data`.
  - Custom nodes inside `CompositionCanvas.tsx` (`CompositeInputNode`, `ManagedResourceNode`, `CompositeOutputNode`): Custom classes to dim unrelated attributes, highlight active ones, and bind hover/click events.
- **Testing**:
  - Verification of state transition logic (hover, leave, click, lock, unlock) via tests.
