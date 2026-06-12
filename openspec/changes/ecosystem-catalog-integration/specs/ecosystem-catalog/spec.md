## ADDED Requirements

### Requirement: Tabbed Explorer Layout
The system SHALL display a tabbed navigation interface on both the Providers and Composition Functions explorer pages, consisting of an "Installed" tab (showing active cluster resources) and an "Ecosystem Hub" tab (showing the community and curated package catalog).

#### Scenario: Switching explorer tabs
- **WHEN** the user selects the "Ecosystem Hub" tab on the Composition Functions explorer page
- **THEN** the system SHALL hide the list of currently installed functions and display the ecosystem catalog.

### Requirement: Hybrid Client-Side Data Fetch and Fallback
The system SHALL attempt to fetch live repository metadata from the GitHub API (`https://api.github.com/orgs/crossplane-contrib/repos?per_page=100`) when the Ecosystem Hub is displayed. If the fetch succeeds, the system SHALL merge the live repositories with the local curated registry, enriching them with live star counts and dynamic community components. If the fetch fails (due to network timeout, offline state, or API rate limits), the system SHALL gracefully fall back to displaying the local curated registry without interrupting the user experience or throwing error screens.

#### Scenario: Successful live data merge
- **WHEN** the user navigates to the Ecosystem Hub while connected to the internet
- **THEN** the catalog displays curated components and community packages enriched with live star counts and descriptions from GitHub.

#### Scenario: Graceful offline fallback
- **WHEN** the user navigates to the Ecosystem Hub while offline
- **THEN** the catalog displays the local curated registry of providers and functions without displaying error messages.

### Requirement: Catalog Cards with Documentation Deep-Links
The system SHALL render each catalog package as an interactive card. Each card MUST display the package name, status badge ("Curated" or "Community"), short description, star count (if online), a direct "Read Docs" link, and an installation action button.

#### Scenario: Clicking documentation link
- **WHEN** the user clicks the "Read Docs" button on a catalog card
- **THEN** the browser SHALL open the corresponding documentation URL or GitHub repository README in a new tab.

### Requirement: Installation Preset Loading in Monaco Editor
The system SHALL open the standard Monaco YAML Creation Modal pre-filled with the selected catalog item's YAML template when the user clicks the install action button on a card.

#### Scenario: Initializing installation modal with curated template
- **WHEN** the user clicks the "Use Preset" button on the "Go Templating Function" card
- **THEN** the system SHALL open the Monaco YAML Creation Modal pre-filled with the exact curated YAML definition for `function-go-templating`.

### Requirement: Deprecation and Archival Management
The system SHALL filter out and hide any community-contributed packages that are archived, disabled, or explicitly marked as deprecated in their GitHub repository name or description. For curated presets, if they are detected as archived or deprecated on GitHub, they SHALL NOT be hidden but instead display a warning badge ("Archived") and restrict installation actions if appropriate to prevent unsafe deployment.

#### Scenario: Filtering archived community packages
- **WHEN** the Ecosystem Hub fetches dynamic packages from GitHub and detects that a community package (e.g., `function-cue-archived`) is archived or has "-archived" in its name
- **THEN** the system SHALL exclude it from the rendered community list.

#### Scenario: Badgeing archived curated presets
- **WHEN** the Ecosystem Hub detects that a curated preset is archived on GitHub
- **THEN** the system SHALL display an "Archived" warning badge on its card rather than hiding it.

### Requirement: Lazy Latest Version Discovery
The system SHALL attempt to fetch the latest release tag dynamically from the GitHub API (`https://api.github.com/repos/crossplane-contrib/<repo-name>/releases/latest`) when the user clicks the install action button on a catalog card. If successful, the system SHALL replace the default package version in the Monaco Editor template with the fetched tag name. If the fetch fails or is offline, the system SHALL fall back to using the default template version.

#### Scenario: Successfully fetching and injecting latest version
- **WHEN** the user clicks "Use Preset" on "Go Templating Function" while online
- **THEN** the system SHALL fetch its latest tag (e.g., `v0.6.0`) and display it in the Monaco Editor package field.

#### Scenario: Offline fallback for version fetching
- **WHEN** the user clicks "Use Preset" on "Go Templating Function" while offline
- **THEN** the system SHALL immediately display the default prefilled template version without throwing network errors.

### Requirement: Live Curated Version Badges
The system SHALL dynamically fetch and display the latest release version on curated catalog card badges in the background upon mounting. To protect GitHub API rate limits, the system MUST store these retrieved tags in a global, in-memory session cache so that each curated component is queried at most once per application session.

#### Scenario: Live version badge retrieval
- **WHEN** the Ecosystem Hub tab mounts while online
- **THEN** the system SHALL launch background fetches for the active tab's curated items, caching and dynamically updating the card version badges (e.g. updating `v0.4.0` to `v0.12.1`) upon success.

#### Scenario: Caching curated version queries
- **WHEN** the user switches between explorer pages or tabs
- **THEN** the system SHALL instantly read the curated versions from the global in-memory session cache instead of issuing duplicate API requests.
