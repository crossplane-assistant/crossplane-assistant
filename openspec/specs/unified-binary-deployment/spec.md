## Purpose

This capability enables deployment of a single self-contained binary that includes both API server and frontend assets, with configurable port binding for flexible deployment scenarios.

## Requirements

### Requirement: Single binary contains all runtime dependencies

The system SHALL provide a single self-contained binary that includes both API server and frontend assets.

#### Scenario: Binary runs standalone on Linux
- **WHEN** user executes the binary on a Linux system
- **THEN** the application starts and serves both API and frontend without additional dependencies

#### Scenario: Binary runs in minimal container
- **WHEN** binary is deployed in a distroless or scratch container
- **THEN** the application runs without requiring nginx, node, or other external servers

### Requirement: Configurable port binding

The system SHALL allow port configuration via environment variable.

#### Scenario: Default port when not configured
- **WHEN** PORT environment variable is not set
- **THEN** system binds to port 8080

#### Scenario: Custom port via environment
- **WHEN** PORT environment variable is set to "9000"
- **THEN** system binds to port 9000

#### Scenario: Invalid port handled gracefully
- **WHEN** PORT environment variable contains invalid value
- **THEN** system logs error and fails to start with clear message

### Requirement: Binary size remains reasonable

The system SHALL maintain a total binary size under 50MB to ensure practical distribution.

#### Scenario: Binary size check
- **WHEN** binary is built with embedded assets
- **THEN** total file size is less than 50MB
