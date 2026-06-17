# sidebar-live-status-badges Specification

## Purpose
TBD - created by archiving change explorer-sidebar-health-badges. Update Purpose after archive.
## Requirements
### Requirement: Sidebar Count and Health Badges
The navigation sidebar (ExplorerLayout) SHALL consume the React Query hooks for Claims, XRDs, and Providers to display live resource counts and health statuses.

#### Scenario: Displaying healthy state badges
- **WHEN** all resources for a specific category (e.g. Claims) are fully Ready/Healthy
- **THEN** the sidebar displays a subtle grey/blue badge next to the menu item showing the total count (e.g. "3")

#### Scenario: Displaying warning or critical state badges
- **WHEN** at least one resource in a category is not Ready/Healthy (e.g. 1 out of 3 Providers is unhealthy)
- **THEN** the sidebar displays a high-contrast pulsing warning or critical badge next to the menu item, formatted with the ready ratio (e.g. "2/3 🔴" or "1/3 ⚠️") in a semi-transparent cyberpunk theme

### Requirement: Interactive Badge Filter Redirection
The navigation sidebar SHALL support interactive clicking on warning/critical status badges to navigate the user directly to the filtered view.

#### Scenario: Clicking a normal healthy badge
- **WHEN** the user clicks on the text, icon, or healthy badge of a category
- **THEN** they are navigated to `/explore/<category>` without any status filters

#### Scenario: Clicking an active warning or critical badge
- **WHEN** the user clicks directly on a pulsing warning/critical status badge
- **THEN** they are navigated to `/explore/<category>?status=unready`

### Requirement: URL-driven Table Filtering
The generic list view (ResourceListView) SHALL intercept the `?status=unready` query parameter and filter the displayed data table to only show non-ready or unhealthy resources.

#### Scenario: Filtering data by unready status
- **WHEN** the user visits a resource list page with `?status=unready` present in the URL
- **THEN** the table only displays items that do not meet the Ready/Healthy/Established condition criteria

#### Scenario: Showing active filter banner with clear action
- **WHEN** the list view table is filtered by `?status=unready`
- **THEN** a high-contrast cyberpunk alert banner is displayed in the list header indicating the active filter, along with a "Clear filter" button that resets the URL query parameters

### Requirement: Discrete Loading States
The navigation sidebar SHALL display a subtle loading indicator during the initial data fetch to prevent layout shifts.

#### Scenario: Displaying loading indicators
- **WHEN** the sidebar resource queries are in their initial loading state (isLoading is true)
- **THEN** the badge container displays a small pulsing skeleton block of fixed width, shifting gracefully to the loaded badge once the queries succeed

