# visual-transform-pipeline Specification

## Purpose
TBD - created by archiving change visual-composition-builder. Update Purpose after archive.
## Requirements
### Requirement: Interactive Transform Inspector
The system SHALL provide a side-panel "Inspector" when an edge (Patch) is selected in the Visual Composition Builder. This Inspector SHALL display the sequence of Transformation operations (`transforms`) applied to the patch as interactive, stackable blocks.

#### Scenario: Editing a transform block
- **WHEN** the user selects a patch edge containing a `map` transform
- **THEN** the Inspector opens and displays the key-value mapping interface
- **THEN** editing the mapping updates the YAML in real-time

### Requirement: Real-time Transform Preview
The Inspector SHALL provide a live preview input field where the user can enter a test value. The system SHALL compute the output of the transformation pipeline in real-time in the browser and display the result.

#### Scenario: Previewing a string format
- **WHEN** the user adds a `string` format transform (e.g., `infra-%s`) and types `us-east` in the live preview input
- **THEN** the system instantly displays `infra-us-east` as the computed output

