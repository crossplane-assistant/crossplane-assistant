## ADDED Requirements

### Requirement: Safe Event Array Parsing
The `useEvents` hook SHALL parse the `/events/:ref` API response and return its `items` array or a fallback empty array, ensuring that the returned type is always a safe iterable array of events.

#### Scenario: Rendering resource events tab without crashes
- **WHEN** the user opens the Events tab for any resource
- **THEN** the system queries `/events/:ref` and successfully renders the list of events
- **THEN** no rendering crash or "TypeError" occurs even if the cluster returns empty or populated event collections

### Requirement: Correct ProviderRevision Watcher Type
The Go backend ProviderRevision registry watcher SHALL initialize its reflector with the `*v1.ProviderRevision` prototype type, ensuring proper decoding and indexing of active providers to enable the discovery of all active Managed Resource kinds.

#### Scenario: Accessing Managed Resource kinds list
- **WHEN** the system boots up and queries `/crossplane/managedresources/kinds`
- **THEN** the backend successfully decodes and lists all CustomResourceDefinitions owned by active ProviderRevisions (such as pubsub Topics, CloudSQL instances, buckets, etc.)

### Requirement: Logo Asset Swap
The application SHALL utilize the high-resolution PNG logo (`/src/assets/crossplane-assistant.png`) instead of the legacy SVG.

#### Scenario: Sidebar logo display
- **WHEN** the application loads
- **THEN** the sidebar header displays the updated `/src/assets/crossplane-assistant.png` logo image

### Requirement: Safe React Hook Sequencing
The `ClaimDetailsView` component SHALL declare all of its React Hook instances (including `useSearchParams` and any `useEffect` triggers) at the very top of the component body, preceding any early conditional return blocks.

#### Scenario: Navigating to Claims Graph during loading state
- **WHEN** the user visits a Claim details page or clicks "Inspect XR" while data is loading
- **THEN** the system executes the top-level React hooks in the exact same sequence as in the loaded state
- **THEN** no "Rendered fewer hooks than expected" runtime exception or blank screen occurs

### Requirement: Standardized Compositions Drawer Dismissal
The Compositions list details sliding drawer SHALL support dismissal mechanisms identical to other resources list drawers: dismissing on backdrop overlay click and on Escape key press.

#### Scenario: Closing Compositions drawer via backdrop click
- **WHEN** the user clicks on the semi-transparent backdrop overlay surrounding the Compositions sliding drawer
- **THEN** the Compositions detail drawer closes and state is reset to null

#### Scenario: Closing Compositions drawer via Escape key
- **WHEN** the user presses the Escape key on the keyboard
- **THEN** the Compositions detail drawer closes and state is reset to null
