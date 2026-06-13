## MODIFIED Requirements

### Requirement: Standardized Explorer List Component
All explorer lists, including Compositions, SHALL utilize the shared `<ResourceListView>` component to render search filters, page headers, a details drawer, and interactive status markers. The sliding details drawer SHALL support dismissal via close buttons, clicking on a semi-transparent backdrop overlay, or pressing the keyboard Escape key. The component SHALL safely handle null or undefined data arrays, displaying an empty table row without crashing the React application. For Compositions specifically, the list view and the details drawer SHALL provide a clear entry point (e.g. an "Open Workspace" action button) to navigate to the full-screen Composition Workspace.

#### Scenario: Launching detail drawer
- **WHEN** the user clicks on any row in the explorer list
- **THEN** a sliding panel displays with a backdrop overlay, showing the View, Manifest, and Event tabs.

#### Scenario: Closing list drawer via backdrop click
- **WHEN** the user clicks on the backdrop overlay surrounding the list drawer
- **THEN** the sliding details panel closes and state is reset to null

#### Scenario: Closing list drawer via Escape key
- **WHEN** the user presses the Escape key on the keyboard
- **THEN** the sliding details panel closes and state is reset to null

#### Scenario: Gracefully handling null data array
- **WHEN** the resource list component receives a null or undefined data array from the API
- **THEN** the system renders a clean table row showing "No <resource> found" and does not throw React rendering exceptions

#### Scenario: Launching Composition Workspace from List View
- **WHEN** the user views the Compositions list or opens a Composition details drawer
- **THEN** an action button labeled "Open Workspace" is available
- **WHEN** the user clicks this button
- **THEN** the application navigates to the dedicated Composition Workspace route for that composition
