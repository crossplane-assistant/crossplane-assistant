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
