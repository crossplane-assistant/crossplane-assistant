## Context

Compositions in Crossplane map a cluster-wide composite resource type (XRD) to a list of nested managed resources. In modern Crossplane architectures, compositions have shifted from static resource lists (`spec.resources`) to pipeline-based functions (`spec.pipeline`), where modular containerized functions dynamically generate and patch the resources.

Currently, the Crossplane Assistant UI does not visualize resources declared inside pipeline steps, displays no patch-based data flow, and backend dependency analysis fails for pipeline compositions. We need a clean, cohesive technical design to extract static resource configurations from standard pipeline functions (specifically `function-patch-and-transform`), restore backend dependency resolution, add a dedicated data-flow viewer, and link Composition definitions to their active Claims.

## Goals / Non-Goals

**Goals:**
- Extract and visually render composed resources defined under `step.input.resources` for pipeline steps using `function-patch-and-transform`.
- Enrich `internal/crossplane/innervision/composition/dependency/analyser.go` to scan `spec.pipeline` step inputs, restoring the functional "Dependencies" tab on the frontend.
- Implement a structured "Data Flow" tab inside the composed resource viewers to display incoming/outgoing patches (value exchanges).
- Modify the "Relations" tab for Compositions to query and display active namespace-scoped Claims with direct links to their dynamic graphs.

**Non-Goals:**
- Statically parsing resources from custom or programming-language-based functions (e.g. `function-kcl`, `function-go-templating`) where resources are generated purely via custom code at runtime.
- Modifying the live reconciliation state or writing to the Kubernetes cluster API during visualization.

## Decisions

### 1. Static Pipeline Resource Extraction (Frontend)
We will update `CompositionViewer.tsx` to detect if `step.functionRef.name` corresponds to `function-patch-and-transform`. If so, we will extract `step.input.resources` (which contains an array of `ComposedTemplate` structures) and render them using `<DynamicResourceViewer>`.
- *Rationale*: Reuses the existing visual panel system and ensures a consistent visual standard between legacy and modern compositions.
- *Alternatives Considered*: Standardizing a generic parser for all function inputs. Rejected because other functions (e.g. Cue, KCL) have arbitrary, highly customized input schemas that do not match the standard `ComposedTemplate` signature.

### 2. Upgrading backend dependency analyzer (`analyser.go`)
We will modify the backend `Analyser.Load(c *v1.Composition)` function. If `c.Spec.Resources` is empty and `c.Spec.Pipeline` is present, the analyzer will traverse the pipeline steps. For any step referencing `function-patch-and-transform` (either by name or conventional naming), it will extract the resource list from the raw `step.Input` field and index them for dependency resolution.
- *Rationale*: By doing this calculation on the backend, the existing frontend `ResourceDependencyViewer` (which reads `/crossplane/compositions/:name/dependencies`) automatically gains full support for pipeline compositions without changing any frontend dependency logic.
- *Alternatives Considered*: Re-implementing dependency graph logic entirely on the client side in TypeScript. Rejected because the backend Go code already has a robust `PathIndexer` and dependency engine which we should reuse.

### 3. Dedicated "Data Flow" Tab for Patches
We will introduce a "Data Flow" tab inside `<GenericResourceViewer>`, `<KubernetesResourceViewer>`, and `<TerraformResourceViewer>`. It will parse the `patches` array of each resource.
- *Classification*:
  - **Inputs**: Patches of type `FromCompositeFieldPath` or `CombineFromComposite`.
  - **Outputs**: Patches of type `ToCompositeFieldPath` or `CombineToComposite`.
- *UI*: A clean list layout with input/output visual indicators, source path, target path, and optional mapping transformations.

### 4. Direct Claim Lookup in Composition Relations
We will modify `ResourceRelations.tsx` to handle `kind: "Composition"`. It will invoke `useClaims()` to fetch all active namespace-scoped claims on the cluster, filter them to keep only those whose GVK matches the Composition's `spec.compositeTypeRef`, and display them with an external-link icon pointing to their live dependency graph page (`/explore/claims/:encodedRef`).
- *Rationale*: Creates a highly intuitive bridge between the blueprint (Composition definition) and live, running systems (Claims).

## Risks / Trade-offs

- **[Risk]**: Pipeline step inputs (`step.Input`) are stored as raw Kubernetes JSON extensions and could be malformed or fail to unmarshal.
- **[Mitigation]**: Implement robust error boundaries and safe unmarshaling in Go (with logging instead of hard failures) so that a single malformed step input does not crash the entire dependency or composition listing.
