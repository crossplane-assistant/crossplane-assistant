## ADDED Requirements

### Requirement: API routes take precedence over static files

The system SHALL route API requests to handlers before attempting static file serving.

#### Scenario: Crossplane API endpoint
- **WHEN** client requests /crossplane/claims
- **THEN** system routes to API handler, not static file system

#### Scenario: Events API endpoint
- **WHEN** client requests /events/some-resource
- **THEN** system routes to API handler, not static file system

### Requirement: Unknown routes serve index.html for SPA navigation

The system SHALL serve index.html for requests that do not match API routes or static files to support Angular client-side routing.

#### Scenario: Angular route not found as file
- **WHEN** client requests /compositions/view/some-id
- **THEN** system serves index.html (not 404)

#### Scenario: Root path serves index
- **WHEN** client requests /
- **THEN** system serves index.html from embedded filesystem

#### Scenario: Static file exists
- **WHEN** client requests /main.abc123.js
- **THEN** system serves the actual JS file, not index.html

### Requirement: No CORS headers for same-origin requests

The system SHALL NOT add CORS headers since frontend and API are served from same origin.

#### Scenario: API request from embedded frontend
- **WHEN** embedded frontend makes request to /crossplane/claims
- **THEN** system processes request without Access-Control-Allow-Origin headers

#### Scenario: Direct API access still works
- **WHEN** external client makes API request
- **THEN** system processes request normally without CORS restrictions

### Requirement: 404 errors for explicit file requests

The system SHALL return 404 for explicit file extension requests that don't exist.

#### Scenario: Missing asset file
- **WHEN** client requests /missing-file.js
- **THEN** system returns 404 status (not index.html)

#### Scenario: Missing image
- **WHEN** client requests /assets/missing.png
- **THEN** system returns 404 status (not index.html)
