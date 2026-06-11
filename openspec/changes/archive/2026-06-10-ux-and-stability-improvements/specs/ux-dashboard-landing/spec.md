## ADDED Requirements

### Requirement: Dashboard Landing Page
The system SHALL display a polished, dynamic dashboard landing page at `/` to serve as a cockpit for the Crossplane Assistant application. It SHALL fetch counts and statuses for Claims, Compositions, XRDs, Providers, and Functions in real-time. Each statistic card SHALL present total counts, health/readiness counts, and an active progress bar indicating the healthy ratio. The page SHALL also feature an interactive visual pipeline of Crossplane's core concepts to educate and orient the user.

#### Scenario: Displaying Landing Page and Fetching Stats
- **WHEN** the user visits the root route `/`
- **THEN** the system fetches claims, compositions, XRDs, providers, and functions in parallel via React Query
- **THEN** it renders interactive cards displaying status counts and health progress bars for each category
- **THEN** it renders the interactive pipeline diagram showing the relationship between Claims, XRDs, Compositions, and Managed Resources
