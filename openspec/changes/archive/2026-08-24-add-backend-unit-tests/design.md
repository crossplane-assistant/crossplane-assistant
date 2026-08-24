## Context

See `proposal.md` for motivation. Relevant current-state facts that shape the approach:

- 4 of 13 handler packages (`provider`, `providerrevision`, `managedresource`, `function`) already take an interface (e.g. `ProviderService`) in `NewHandler`; the other 9, including the three in scope here (`claim`, `composition`, `diagnostic`), take the concrete `*Service`.
- `diagnostic.Service` depends concretely on `*claim.Service` and `*event.Service`, plus `*resource.CRDRegistry` and `*providerrevision.Registry`. The latter two already wrap a generated client-go interface (`crdv1.CustomResourceDefinitionInterface`, `xpcliv1.ProviderRevisionInterface`) behind a real k8s-style `List`/`Watch` informer, and the existing `managedresource_test.go` already shows the pattern for faking them (a fake `apiextensionsfake` clientset for CRDs, a hand-rolled mock for `ProviderRevisionInterface`).
- `unstruct.ResourceResolver` and `claim.Service` both hold a `dynamicClient *dynamic.DynamicClient` field — the concrete struct type, not the `dynamic.Interface` it implements. `k8s.io/client-go/dynamic/fake` produces a fake that implements `dynamic.Interface`, but cannot satisfy a field typed as the concrete struct.
- `claim.Service.List` has a pre-existing bug: `if opts == nil && len(opts.Kinds) > 0` dereferences `opts` whenever it is `nil` (Go's `&&` still evaluates the right operand once the left is `true`), so the method panics on its documented nil-options input. This surfaces as soon as a test calls `List(ctx, nil)`.
- Existing tests use `testify` in most files but `diagnostic/service_test.go` hand-rolls a substring matcher instead.

## Goals / Non-Goals

**Goals:**
- Make `claim`, `composition`, and `diagnostic` handlers testable via a mocked service, following the `ProviderService`-style pattern already in the codebase.
- Make `unstruct`, `claim`, `composition`, and `diagnostic` services testable without a live cluster, using `mockery`-generated mocks for interfaces and existing fake-clientset conventions for generated k8s client types.
- Standardize backend test assertions on `testify`.
- Fix the `claim.Service.List` nil-`opts` panic as part of testing `List` (a test can't pass otherwise, and shipping a test-shaped workaround around a real bug would be worse than fixing it).

**Non-Goals:**
- CI wiring for backend tests (deferred to a later change, matching the frontend precedent of splitting tooling from CI).
- Coverage for the other 9 handler/service packages, `server.go`, or `internal/crossplane/client/*` (deferred; not in the agreed priority order).
- Any change to HTTP request/response shapes, status codes, or route wiring in `server.go`.
- Introducing `mockery` mocks for every generated k8s client interface project-wide — only the interfaces this change's tests actually need are targeted.

## Decisions

### Mockery targets: service interfaces + the two client interfaces tests actually need
Generate mocks for exactly: `claim.ClaimService`, `composition.CompositionService`, `diagnostic.DiagnosticService` (the new handler-facing interfaces), plus `compositionv1.CompositionInterface` (composition's k8s client dependency) and `xpv1cli.ProviderRevisionInterface` (needed to test `diagnostic.FindProviderRevisionForMR` via `providerrevision.Registry`, replacing the hand-rolled `mockProviderRevisionInterface` pattern from `managedresource_test.go`).
- **Alternative considered**: generate mocks for every client-go interface used anywhere in the touched packages (`CompositeResourceDefinitionsInterface`, `CustomResourceDefinitionInterface`, `discovery.DiscoveryInterface`, etc.). Rejected for this change — most of these are already well-served by real fake clientsets (`apiextensionsfake`, `k8s.io/client-go/kubernetes/fake`), which exercise more real client behavior (list/watch semantics) than a mock would, and expanding the mockery surface beyond what's needed adds maintenance cost without adding test value.

### Widen `dynamicClient` fields to `dynamic.Interface`, no wrapper type
Change `unstruct.ResourceResolver.dynamicClient` and `claim.Service.dynamicClient` from `*dynamic.DynamicClient` to `dynamic.Interface`. Both `NewResourceResolver` and `NewClaimService` accept the field as a constructor parameter, and `*dynamic.DynamicClient` (returned by `kubernetes.KubernetesDynamicClient()` in `server.go`) already implements `dynamic.Interface` — so `server.go`'s call sites need no change. Tests then inject `k8s.io/client-go/dynamic/fake.NewSimpleDynamicClient(...)`.
- **Alternative considered**: introduce a project-specific `DynamicClient` interface wrapping only the methods actually called. Rejected — `dynamic.Interface` already exists, is what the fake package implements, and adding a second abstraction on top would be pure indirection.

### Extract `KubernetesProviderClient` interface for `claim.Service.xK8sProviderClient`
`claim.Service` only ever calls `.Objects()` on this field, which already returns the interface `ObjectInterface`. Extract a one-method interface (`Objects() ObjectInterface`) in `claim` (or reuse one exported from `v1alpha1` if adding it there is more idiomatic) so a test can supply a fake without constructing a real `*v1alpha1.KubernetesV1AlphaClient`.
- **Alternative considered**: leave the field as the concrete type and skip testing the `Object`-kind branch of `GetResourcesTree`. Rejected — that branch (resolving `kubernetes.crossplane.io` `Object` resources) is exactly the kind of cross-provider logic most likely to regress silently.

### `diagnostic.Service.claimService` becomes `claim.ClaimService`; `eventService` stays concrete
Re-type `diagnostic.Service.claimService` from `*claim.Service` to the new `claim.ClaimService` interface so `GetClaimDiagnostics` tests can mock the claim tree without standing up claim's own dependencies. Leave `eventService` as the concrete `*event.Service` — it's a thin, one-method wrapper around `kubernetes.Interface`, which already has a standard fake (`k8s.io/client-go/kubernetes/fake`); constructing a real `event.Service` backed by a fake clientset with canned `Event` objects is simpler than adding an `EventService` interface for a single call site.
- **Alternative considered**: extract an `EventService` interface too, for symmetry with `claimService`. Rejected — no other consumer needs it, and the fake-clientset route is already the codebase's established pattern for thin k8s-client wrappers (see `crdRegistry`/`prRegistry` handling in `managedresource_test.go`).

### Fix the `List` nil-`opts` bug as part of writing its test
Change `if opts == nil && len(opts.Kinds) > 0` to `if opts != nil && len(opts.Kinds) > 0`, and guard the later `if opts.HideManagedFields` the same way. This is a one-line correctness fix uncovered by the very test this change adds; leaving it unfixed would mean either the new test can't call `List(ctx, nil)` (a documented, presumably common call shape) or the test would have to assert a panic as correct behavior.
- **Alternative considered**: only test `List` with non-nil `opts` and leave the bug for a separate fix. Rejected — the bug was found *because* this change is adding the test that exercises it; deferring a one-line fix to a hypothetical future change serves no one.

## Risks / Trade-offs

- **Widening `dynamicClient` to an interface could mask a future accidental narrowing** (someone re-narrows the field back to the concrete type without noticing) → the compile error at the `server.go` call site if that happens is immediate and unambiguous, so this is a low risk.
- **Re-typing `diagnostic.Service.claimService` to an interface changes `claim`'s public surface slightly** (the interface must be kept in sync with `claim.Service`'s public methods) → scope the interface to exactly what `diagnostic` and `claim.Handler` call today; Go's compiler flags any drift immediately at the call sites.
- **Mockery introduces a new generated-code footprint** (`mocks/` or `mock_*.go` files that must be regenerated on interface changes) → keep `.mockery.yaml` scoped to the specific interfaces named above rather than a blanket "mock everything" config, and document the regeneration command in the mockery config's comments.
- **Fixing the `List` nil-`opts` bug changes production behavior, not just test scaffolding** → the fix makes `List(ctx, nil)` behave like "no filter" instead of panicking, which is strictly safer and matches what every other `Service` method already assumes about optional filters; no caller currently relies on the panic.
