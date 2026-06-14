## ADDED Requirements

### Requirement: Deterministic Production Builds
The build environment SHALL be capable of executing deterministic clean installations using standard CI commands.

#### Scenario: Clean installation in CI
- **WHEN** `npm ci` is executed in the `ui` directory
- **THEN** npm installs all dependencies strictly matching the lockfile with zero resolution errors
