## Why

The Go backend has 24 packages; 19 sit at 0% test coverage and the 5 that have tests mix `testify` with hand-rolled assertion helpers (`diagnostic/service_test.go` reimplements `strings.Contains` instead of using it). There is no shared mocking convention — each test file hand-writes its own k8s-client mock (e.g. an 8-method `mockProviderRevisionInterface` in `managedresource_test.go`) instead of generating one. Worse, 9 of the 13 HTTP handler packages depend on the concrete `*Service` struct rather than an interface, so they cannot be mock-tested at all today; only the 4 that already expose an interface (`provider`, `providerrevision`, `managedresource`, `function`) could be. The companion `add-frontend-unit-tests` change explicitly scoped backend testing out ("Backend (Go) testing is explicitly out of scope... will be addressed separately") — this change is that follow-up. The highest-risk, highest-usage business logic (claim resolution, composition dependency wiring, diagnostics orchestration) sits underneath every feature the UI exposes and is currently unverified.

## What Changes

- Add `mockery` as the mock-generation tool for Go interfaces (`.mockery.yaml` config), replacing hand-written mock structs going forward.
- Generalize the existing handler-depends-on-interface pattern (already used by `provider`, `providerrevision`, `managedresource`, `function`) to the packages touched here: extract a `ClaimService` interface in `claim`, a `CompositionService` interface in `composition`, and a `DiagnosticService` interface in `diagnostic`; update each package's `Handler` to depend on its interface instead of the concrete `*Service`.
- Widen two dependency fields from a concrete client-go struct to the interface it already implements, so tests can substitute a fake: `unstruct.ResourceResolver.dynamicClient` and `claim.Service.dynamicClient` (`*dynamic.DynamicClient` → `dynamic.Interface`). Extract a minimal `KubernetesProviderClient` interface (`Objects() ObjectInterface`) for `claim.Service.xK8sProviderClient` (currently the concrete `*v1alpha1.KubernetesV1AlphaClient`).
- Standardize backend test assertions on `testify` (`assert`/`require`); remove the hand-rolled `stringsContains`/`containsInBetween` helpers from `diagnostic/service_test.go`.
- Add unit tests, in priority order (highest risk/usage first):
  1. **`unstruct`**: GVR resolution logic (`resolveGVR`, `resolveNativeGVR`, `resolveCustomResourceGVR`, `isK8SNativeGroup`) and the dynamic-client-backed methods (`GetClient`, `ResolveUnstructuredResources`), using a fake CRD clientset and a fake dynamic client. This is foundational, pure-logic-heavy, and used by `claim`, `managedresource`, and `telemetry`.
  2. **`claim`**: `Service` (`List`, `Get`, `GetResourcesTree`, `Create`, `Update`, `Delete`) and the new `Handler`-via-mocked-`ClaimService` tests. Fixes a nil-pointer bug found while scoping this: `Service.List`'s `if opts == nil && len(opts.Kinds) > 0` panics whenever `opts` is nil, since Go evaluates the right operand of `&&` when the left is true.
  3. **`composition`**: `Service` (`List`, `Get`, `GetDependencies`, `Create`, `Update`, `Delete`) via a mockery-generated mock of `CompositionInterface`, and `Handler` via a mocked `CompositionService`.
  4. **`diagnostic`**: complete coverage of `GetClaimDiagnostics` (tree traversal, event aggregation, log filtering orchestration) and `FindProviderRevisionForMR`, using a mocked `ClaimService`, a real `event.Service` backed by `k8s.io/client-go/kubernetes/fake`, a real `CRDRegistry`/`providerrevision.Registry` backed by fake/mocked clients, and `Handler` via a mocked `DiagnosticService`.

No breaking changes: all interface extractions and field-type widenings are internal refactors with no change to HTTP request/response contracts or CLI behavior.

**Explicitly deferred** (not part of this change): CI wiring (`backend-tests.yml`), and coverage for the remaining 9 packages (`schema`, `sandbox`, `telemetry`, `managedresource`, `provider`, `providerrevision`, `function`, `xrd`, `compositionrevision`, `event`), `server.go`, and the `internal/crossplane/client/*` wrapper packages.

## Capabilities

### New Capabilities
- `backend-test-infrastructure`: the Go backend's testing tooling and conventions — mockery-based interface mocking, the testify assertion standard, and the interface-per-service pattern for handlers — plus the resulting unit test coverage for `unstruct`, `claim`, `composition`, and `diagnostic`.

### Modified Capabilities
(none — this change adds test infrastructure and internal refactors; it does not change the requirements or observable behavior of any existing product capability, aside from fixing the `claim.Service.List` nil-`opts` panic, which is a defect fix rather than a requirements change)

## Impact

- **Tooling**: `mockery` added as a dev-tool dependency, new `.mockery.yaml` config, generated mock files per targeted interface (`ClaimService`, `CompositionService`, `DiagnosticService`, `CompositionInterface`, `ProviderRevisionInterface`, `KubernetesProviderClient`).
- `internal/crossplane/innervision/claim/claim.go`, `handler.go`: new `ClaimService` interface; `dynamicClient` field widened to `dynamic.Interface`; new `KubernetesProviderClient` interface; `List` nil-`opts` bugfix.
- `internal/crossplane/innervision/composition/composition.go`, `handler.go`: new `CompositionService` interface.
- `internal/crossplane/innervision/diagnostic/service.go`, `handler.go`: new `DiagnosticService` interface; `claimService` field re-typed to `ClaimService`.
- `internal/crossplane/innervision/unstruct/resolver.go`: `dynamicClient` field widened to `dynamic.Interface`.
- `internal/server/server.go`: no behavioral change expected — existing concrete client types already satisfy the widened interfaces.
- New/updated test files: `unstruct/resolver_test.go`, `claim/claim_test.go`, `claim/handler_test.go`, `composition/composition_test.go`, `composition/handler_test.go`, `diagnostic/service_test.go` (extended, cleaned up), `diagnostic/handler_test.go`.
