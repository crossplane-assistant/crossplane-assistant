## 1. Mockery tooling

- [x] 1.1 Add `mockery` as a dev-tool dependency (a tools file or documented `go run github.com/vektra/mockery/v2@<version>` invocation) and verify `mockery --version` runs
- [x] 1.2 Add a `.mockery.yaml` scoped to exactly the interfaces this change needs (`claim.ClaimService`, `composition.CompositionService`, `diagnostic.DiagnosticService`, `compositionv1.CompositionInterface`, `xpv1cli.ProviderRevisionInterface`) and verify `mockery` generates a mock for each with no unrelated interfaces picked up
- [x] 1.3 Add a `Makefile` target (e.g. `make mocks`) that runs `mockery` and verify it regenerates the same output idempotently (`git status` shows no diff on a second run)

## 2. Testify standardization

- [x] 2.1 Remove `stringsContains`/`containsInBetween` from `diagnostic/service_test.go`, replacing their call sites with `strings.Contains` / `assert.Contains`, and verify `TestFilterLogLines` still passes
- [x] 2.2 Sweep the other 4 existing test files (`managedresource_test.go`, `sandbox`, `schema`, `telemetry`, `composition/dependency`) for any non-testify hand-rolled assertions and convert them to `testify`, verifying each package's tests still pass after conversion

## 3. `unstruct`: interface widening + tests

- [x] 3.1 Change `ResourceResolver.dynamicClient` from `*dynamic.DynamicClient` to `dynamic.Interface` in `resolver.go` and `NewResourceResolver`'s parameter, and verify `go build ./...` succeeds (confirming `server.go`'s call site still compiles unchanged)
- [x] 3.2 Add `unstruct/resolver_test.go` covering `isK8SNativeGroup`, `resolveNativeGVR`, and `resolveCustomResourceGVR` (found, not-found, and group-mismatch cases) against a fake `CRDRegistry` built from `apiextensionsfake.NewSimpleClientset`, and verify all cases pass
- [x] 3.3 Add test cases for `GetClient` and `ResolveUnstructuredResources` using `k8s.io/client-go/dynamic/fake.NewSimpleDynamicClient`, covering both the namespaced and cluster-scoped (`namespace == ""`) paths, and verify they pass
- [x] 3.4 Run `go test ./internal/crossplane/innervision/unstruct/... -cover` and verify coverage increases from 0%

## 4. `claim`: interface extraction, bugfix, and tests

- [x] 4.1 Extract a `ClaimService` interface in `claim` covering `List`, `Get`, `GetResourcesTree`, `Create`, `Update`, `Delete`, and change `handler.go`'s `NewHandler` to accept `ClaimService` instead of `*Service`, verifying `go build ./...` succeeds
- [x] 4.2 Change `claim.Service.dynamicClient` from `*dynamic.DynamicClient` to `dynamic.Interface`, verifying `go build ./...` succeeds
- [x] 4.3 Extract a `KubernetesProviderClient` interface (`Objects() ObjectInterface`) for `claim.Service.xK8sProviderClient` and update `NewClaimService`'s parameter type, verifying `go build ./...` succeeds and `server.go`'s call site (passing `*v1alpha1.KubernetesV1AlphaClient`) still compiles unchanged
- [x] 4.4 Fix `Service.List`'s nil-`opts` bug (`opts == nil && len(opts.Kinds) > 0` → `opts != nil && len(opts.Kinds) > 0`, and guard the `opts.HideManagedFields` check the same way) and verify with a regression test that `List(ctx, nil)` returns the unfiltered list without panicking
- [x] 4.5 Generate the `mockery` mock for `ClaimService` (per task 1.2) and add `claim/handler_test.go` covering `Get`, `Create`, `Update`, `Delete` against the mock, asserting the correct HTTP status and body/error mapping, and verify all pass
- [x] 4.6 Add `claim/claim_test.go` covering `Service.List` (nil and non-nil `opts`, including the `HideManagedFields` path) and `Service.Get` against a fake dynamic client + fake CRD registry, and verify all pass
- [x] 4.7 Add a `Service.GetResourcesTree` test covering: claim with no composite reference, claim → composite → plain managed resource, and claim → composite → `kubernetes.crossplane.io` `Object` resource (using the `KubernetesProviderClient` fake from 4.3), and verify the resulting tree shape (node kinds, parent/child links, `MetaKind` values) matches expectations
- [x] 4.8 Run `go test ./internal/crossplane/innervision/claim/... -cover` and verify coverage increases from 0%

## 5. `composition`: interface extraction and tests

- [x] 5.1 Extract a `CompositionService` interface in `composition` covering `List`, `Get`, `GetDependencies`, `Create`, `Update`, `Delete`, and change `handler.go`'s `NewHandler` to accept `CompositionService` instead of `*Service`, verifying `go build ./...` succeeds
- [x] 5.2 Generate the `mockery` mock for `compositionv1.CompositionInterface` (per task 1.2) and add `composition/composition_test.go` covering `List`/`Get` (asserting `APIVersion`/`Kind` are stamped), `Create`, `Update`, `Delete` against the mock, and verify all pass
- [x] 5.3 Add a `GetDependencies` test covering both a composition whose patches the dependency analyser resolves successfully and one where `analyser.Load`/`GetResourceGraph` returns an error, asserting the error propagates unchanged, and verify both cases pass (note: `dependency.Analyser.Load`/`GetResourceGraph` have no reachable error path in the current implementation - only logged, never returned - so per user decision the error case tests `compositionClient.Get` failing instead, which is the error path `GetDependencies` actually propagates today)
- [x] 5.4 Add `composition/handler_test.go` covering `List`, `Get`, `GetDependencies`, `Create`, `Update`, `Delete` against a mocked `CompositionService`, asserting correct HTTP status codes (including the `400` on invalid YAML body for `Create`/`Update`), and verify all pass
- [x] 5.5 Run `go test ./internal/crossplane/innervision/composition/... -cover` and verify coverage increases from 0%

## 6. `diagnostic`: interface extraction and orchestration tests

- [x] 6.1 Extract a `DiagnosticService` interface in `diagnostic` covering `GetClaimDiagnostics`, and change `handler.go`'s `NewHandler` to accept `DiagnosticService` instead of `*Service`, verifying `go build ./...` succeeds
- [x] 6.2 Re-type `diagnostic.Service.claimService` from `*claim.Service` to `claim.ClaimService` and update `NewService`'s parameter type, verifying `go build ./...` succeeds and `server.go`'s call site still compiles unchanged
- [x] 6.3 Generate the `mockery` mock for `xpv1cli.ProviderRevisionInterface` (per task 1.2) and add a `FindProviderRevisionForMR` test covering: CRD found + active revision found (success), CRD not found (error, no revision lookup attempted), and CRD found but no matching active revision (error), using a fake `CRDRegistry` (`apiextensionsfake`) and a `providerrevision.Registry` built on the mocked `ProviderRevisionInterface`
- [x] 6.4 Add a `GetClaimDiagnostics` test using a mocked `ClaimService` (returning a multi-node claim tree) and a real `event.Service` backed by `k8s.io/client-go/kubernetes/fake` seeded with `Event` objects for multiple nodes, asserting: every node's events are aggregated, events are sorted newest-first, and each node's `Status` reflects `IsNodeHealthy`
- [x] 6.5 Add `diagnostic/handler_test.go` covering `GetClaimDiagnostics` against a mocked `DiagnosticService` (success and error cases), and verify correct HTTP status/body mapping
- [x] 6.6 Run `go test ./internal/crossplane/innervision/diagnostic/... -cover` and verify coverage increases from the current 21.1%

## 7. Final verification

- [x] 7.1 Run `go test ./... -cover` from the repo root and verify: all tests pass, `unstruct`/`claim`/`composition` show non-zero coverage, `diagnostic` coverage has increased, and no other package's coverage regressed
- [x] 7.2 Run `go vet ./...` and verify it reports no new issues introduced by this change
- [x] 7.3 Confirm no CI workflow files were added or modified (`git status` shows changes only under `internal/`, `.mockery.yaml`, and the `Makefile`), consistent with CI being explicitly deferred (no `.github/workflows` changes; `go.mod` also picked up `testify/mock`, `testify/require`, and `stretchr/objx` as direct/indirect deps - a necessary side effect of the mockery tooling and new test fakes, per the proposal's stated "Tooling" impact; `go.sum` is unchanged and `vendor/` is gitignored)
