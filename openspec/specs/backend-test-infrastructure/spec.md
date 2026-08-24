# backend-test-infrastructure Specification

## Purpose

This capability provides the Go backend with a consistent, mock-driven unit testing convention and the resulting coverage for its highest-risk business logic, so that regressions in resource resolution, claim handling, composition management, and diagnostics are caught by `go test` before they reach a cluster.

## Requirements

### Requirement: Consistent backend assertion library

Backend Go test files SHALL use `testify` (`assert`/`require`) for assertions rather than hand-rolled comparison helpers.

#### Scenario: New test uses testify
- **WHEN** a new backend test file is added
- **THEN** it asserts outcomes via `testify`'s `assert` or `require` packages rather than defining its own string/equality helper functions

#### Scenario: Existing hand-rolled helper is replaced
- **WHEN** a backend test file previously asserted via a hand-written helper (e.g. a custom substring-matching function)
- **THEN** the helper is removed and the equivalent `testify` assertion (or a standard library call such as `strings.Contains`) is used in its place

### Requirement: Interface-backed service dependencies for handler testing

Each HTTP handler covered by this change (`claim`, `composition`, `diagnostic`) SHALL depend on an interface implemented by its corresponding service, rather than on the service's concrete struct type, so the handler can be tested with a mocked dependency.

#### Scenario: Handler constructed with a mock
- **WHEN** a handler's test constructs it with a mocked service implementing the handler's expected interface
- **THEN** the handler compiles and runs against the mock without requiring the concrete service implementation or any live Kubernetes client

#### Scenario: Concrete service still satisfies the interface
- **WHEN** the real service is wired into the handler at server start
- **THEN** it satisfies the handler's interface with no adapter code required

### Requirement: Generated mocks for interface dependencies

Mocks for Go interfaces used in backend unit tests SHALL be generated via `mockery` rather than hand-written per test file.

#### Scenario: New interface needs a test mock
- **WHEN** a backend unit test needs to substitute a fake for an interface dependency (a service interface or a generated Kubernetes client interface)
- **THEN** the mock used is produced by `mockery` from that interface's definition, not written by hand inside the test file

### Requirement: Unit coverage for resource resolution

The `unstruct` package's GroupVersionResource resolution logic SHALL have unit tests covering native Kubernetes groups, CRD-backed custom resources, and the unresolvable case.

#### Scenario: Native group resolves without a CRD lookup
- **WHEN** resolving the GVR for a kind in a native Kubernetes group (e.g. an empty group or `apps`)
- **THEN** the resolver returns the expected resource name without consulting the CRD registry

#### Scenario: Custom resource resolves via the CRD registry
- **WHEN** resolving the GVR for a kind backed by a registered CRD
- **THEN** the resolver returns the GVR matching that CRD's plural name

#### Scenario: Unregistered custom resource fails to resolve
- **WHEN** resolving the GVR for a kind with no matching CRD in the registry
- **THEN** the resolver returns an error and no GVR

### Requirement: Unit coverage for claim resolution

The `claim` package's `Service` SHALL have unit tests covering listing, retrieval, resource-tree construction, and mutation, without requiring a live cluster.

#### Scenario: Listing claims with no options does not panic
- **WHEN** `Service.List` is called with a `nil` options value
- **THEN** it returns the unfiltered claim list without panicking

#### Scenario: Resource tree includes nested managed resources
- **WHEN** `Service.GetResourcesTree` resolves a claim whose composite has resource references
- **THEN** the returned tree includes a node for the claim, a node for the composite, and a child node per referenced resource

#### Scenario: Claim handler delegates to its service
- **WHEN** a claim HTTP request reaches `Handler.Get`, `.Create`, `.Update`, or `.Delete`
- **THEN** the handler invokes the corresponding method on its `ClaimService` dependency and maps its result or error to the HTTP response

### Requirement: Unit coverage for composition management

The `composition` package's `Service` and `Handler` SHALL have unit tests covering CRUD operations and dependency-graph retrieval.

#### Scenario: List and Get stamp API version and kind
- **WHEN** `Service.List` or `Service.Get` returns compositions from the client
- **THEN** each returned composition has its `APIVersion` and `Kind` fields set to `apiextensions.crossplane.io/v1` and `Composition`

#### Scenario: GetDependencies surfaces analyser errors
- **WHEN** `Service.GetDependencies` is called for a composition whose patches cannot be analysed
- **THEN** the error from the dependency analyser is returned unchanged, with no partial graph

### Requirement: Unit coverage for claim diagnostics orchestration

The `diagnostic` package's `Service.GetClaimDiagnostics` and `Service.FindProviderRevisionForMR` SHALL have unit tests covering tree traversal, event aggregation, and provider-revision resolution, without requiring a live cluster.

#### Scenario: Diagnostics response aggregates events across the whole tree
- **WHEN** `GetClaimDiagnostics` resolves a claim tree with multiple nodes that each have events
- **THEN** the returned response's event list contains every node's events, sorted newest first

#### Scenario: A node healthy check reflects its critical conditions
- **WHEN** the diagnostic tree is built for a node whose critical conditions (e.g. `Ready`, `Synced`) are not all `True`
- **THEN** that node's status in the response is `Unready`

#### Scenario: Provider revision resolution fails gracefully for an unknown kind
- **WHEN** `FindProviderRevisionForMR` is called for a group/kind with no matching CRD in the registry
- **THEN** it returns an error and the diagnostics response skips log collection for that resource instead of failing the whole request
