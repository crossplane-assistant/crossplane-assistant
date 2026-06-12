## Context

The Crossplane Assistant application provides an interactive explorer for Kubernetes and Crossplane resources. However, several core features are compromised by layout limitations, unhandled API types, a critical backend watch decoder error, and a lack of cross-navigation links. This design defines targeted refactoring of layout widths, safe API parsers, Go controllers, and UI controls.

## Goals / Non-Goals

**Goals:**
- Unbind the horizontal graph layout to occupy full width, avoiding cramped scrolling.
- Refactor the claim graph cards to grow vertically to fit all metadata labels dynamically.
- Prevent sliding drawer crashes by ensuring Kubernetes Events are always returned as safe iterable arrays.
- Restore complete discovery of all Managed Resource kinds (like pubsub Topics) by aligning types in the backend ProviderRevision watcher.
- Implement explicit pipeline/function support and XRD banners in the Composition viewer.
- Add an interactive relationships traverser to jump seamlessly across the Crossplane hierarchy.
- Update UI headers to leverage the newly designated high-res PNG logo asset.

**Non-Goals:**
- Introducing heavy modal or state-management frameworks.
- Modifying Crossplane CRD schemas or altering the cluster-level RBAC/permissions.

## Decisions

### 1. Adaptive Card Layouts over Rigid Dimensions
To resolve text truncations and overlapping tags, we will widen the graph cards to `w-[390px]` and transition from a fixed `h-20` height to an elastic `min-h-[90px]` height. Removing `h-[52px] overflow-hidden` from the card's inner top row allows elements to flow naturally. Spacing in the recursive tree-connectors will be adjusted from `370px` to `400px` to maintain alignment.

### 2. Envelope Translation in React Query Hooks
Instead of having the UI component handle the unwrapping of the raw Kubernetes `EventList` response, we centralize this mapping inside `useEventQueries.ts`. By returning `data?.items || []` directly from the `queryFn`, we guarantee that the `events` variable returned to components is always a native JS array, preventing spreading and iteration crashes.

### 3. Pipeline Step Support in Composition Drawer
Modern Crossplane Compositions rely heavily on Composition Functions (`spec.pipeline`) rather than static resources (`spec.resources`). We will update `CompositionViewer.tsx` to conditionally render:
- An XRD header signature (`spec.compositeTypeRef`) at the top of the View tab.
- A list of Pipeline Steps (if `spec.pipeline` is present) showing step name, function name, and Monaco-rendered configuration inputs.
- Composed resources (if `spec.resources` is present) initialized in an expanded state when the count is <= 3, with top-level toggle controls.

### 4. Correcting client-go Informer Prototypes
In `internal/crossplane/innervision/providerrevision/registry.go`, the controller watches the Go `ProviderRevision` client but passes a `CustomResourceDefinition` prototype pointer. We will align this with `&xpv1.ProviderRevision{}`. This enables client-go's deserializer to successfully hydrate the indexer, allowing `ListActive()` to fetch running providers and `ListKind()` to expose their owned CRDs.

### 5. Standardized Cross-Resource Relationship Parsing
We will build a lightweight utility to extract references from any Kubernetes object:
- **From Claim**: link to `spec.resourceRef` (XR).
- **From XR**: link to `spec.claimRef` (Claim) and `spec.resourceRefs` (MRs).
- **From MR**: link to `metadata.ownerReferences` (XR) and `spec.providerConfigRef` (ProviderConfig).
Clicking an MR link from an XR details panel will route to `/explore/managed-resources` and pass the Kind as a query parameter, prompting the list page to load that kind and auto-open the resource drawer.

### 6. PNG Logo Asset Copying
We will copy `docs/assets/crossplane-assistant-logo.png` directly into `ui/src/assets/crossplane-assistant-logo.png` during the build/execution phase and change `App.tsx` image sources to point to this new path.

### 7. Correcting React Hook Sequences to Prevent Mismatch Crashes
To eliminate the `Rendered fewer hooks than expected` exception, we must adhere strictly to the Rules of Hooks. In `ClaimDetailsView.tsx`, the `useSearchParams` hook and matching auto-select `useEffect` will be moved to the very top of the function body, ensuring they are executed *prior* to any early `return` checks for loading (`claimLoading || treeLoading`) or error states.

### 8. Unifying Compositions Drawer Mechanics
To bring `ListCompositions.tsx` up to par with the other list pages' UX, we will:
- Inject a window-level keydown `useEffect` listener to dismiss the drawer when the user presses `Escape`.
- Introduce a background backdrop overlay `<div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 ..."/>` with an `onClick` handler that resets `selectedComposition` to `null`.

## Risks / Trade-offs

- **[Risk] High volume of MR kinds overloading drop-down selection** → *Mitigation*: Ensure the drop-down handles broad lists gracefully, utilizing search filters if available or alphabetical sorting.
- **[Risk] Broken link transitions if resources are missing in cluster** → *Mitigation*: Before displaying a relationship link, verify that the reference fields contain valid data, and render a helpful "Not Found" state if the API queries for a linked resource return 404.
