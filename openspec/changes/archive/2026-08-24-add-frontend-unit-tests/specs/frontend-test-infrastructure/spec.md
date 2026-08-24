## Purpose

This capability provides the `ui/` frontend with an automated, runnable test suite and a CI gate, so that regressions in frontend behavior are caught before merge rather than discovered manually.

## ADDED Requirements

### Requirement: Automated frontend test suite

The `ui/` project SHALL provide a single command that runs its full automated test suite and reports a non-zero exit status when any test fails.

#### Scenario: Running the suite locally
- **WHEN** a developer runs the test command in `ui/`
- **THEN** every test file in the suite executes and pass/fail results are reported for each test

#### Scenario: Suite fails on a broken test
- **WHEN** any test in the suite fails
- **THEN** the command exits with a non-zero status code

### Requirement: CI gate on frontend changes

The system SHALL automatically run the frontend test suite whenever a pull request or push modifies a file under `ui/`.

#### Scenario: Pull request touching ui/ triggers the check
- **WHEN** a pull request changes a file under `ui/`
- **THEN** a CI check runs the frontend test suite and reports pass/fail on the pull request

#### Scenario: Failing suite is visible in CI
- **WHEN** the frontend test suite fails during a CI run
- **THEN** the corresponding CI check reports a failed status

### Requirement: Core interactive views have automated coverage

The system SHALL have automated tests verifying the rendering behavior of the managed resources list view and the composition canvas/workspace views.

#### Scenario: Managed resources list renders resource data
- **WHEN** the managed resources list view is rendered with a given set of resources
- **THEN** each resource is present in the rendered output

#### Scenario: Composition canvas renders node data
- **WHEN** the composition canvas is rendered with composite input node data
- **THEN** the corresponding node content is present in the rendered output

#### Scenario: Composition workspace renders without a live backend
- **WHEN** the composition workspace view is rendered with mocked data dependencies
- **THEN** it renders without throwing and without making a real network request
