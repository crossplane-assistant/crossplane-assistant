## ADDED Requirements

### Requirement: Standard Dependency Resolution
The UI project's dependencies SHALL resolve cleanly using standard npm installation commands without requiring any legacy compatibility flags.

#### Scenario: Clean standard npm install
- **WHEN** standard `npm install` is executed in the `ui` directory
- **THEN** npm resolves and installs all peer dependencies successfully with zero ERESOLVE errors
