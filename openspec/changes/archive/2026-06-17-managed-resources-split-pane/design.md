## Context

The current Managed Resources screen renders a simple page containing a header and a table of instances. The specific resource Kind is selected using a native HTML `<select>` dropdown menu in the top right. In larger clusters with active cloud providers, this dropdown can contain over 300 entries, making it very hard to search or navigate. Furthermore, the page defaults to showing the first alphabetical Kind, which is typically empty, leading to a poor initial landing experience.

## Goals / Non-Goals

**Goals:**
- Implement a Split-Pane view layout for Managed Resources: a left-hand "Kinds Explorer" navigation panel and a right-hand resource instances table.
- Provide real-time search filtering in the Kinds Explorer sidebar.
- Categorize Kinds by cloud provider (AWS, GCP, Azure, Kubernetes, Helm, etc.) using collapsible accordion menus.
- Implement quick-filter buttons to show All, Active-only, or Unhealthy-only Kinds.
- Introduce smart initial selection: on first load, default to the first active (or unhealthy) Kind instead of an empty alphabetical Kind.
- Keep full URL synchronization for seamless shareability and browser back-button behavior.

**Non-Goals:**
- Modifying backend endpoints or database structures; all data is already available via `/crossplane/managedresources/kinds`.
- Refactoring lists of other resources (like Claims, XRDs, Compositions) which do not suffer from high-volume Kind counts.

## Decisions

### Decision 1: Grouping Logic for Providers
- **Option A (Regex-based Group Parsing)**: Extract provider names from the `group` suffix (e.g., `*.aws.upbound.io` -> `AWS`, `*.gcp.upbound.io` -> `GCP`, `*.azure.upbound.io` -> `Azure`, `*.kubernetes.crossplane.io` -> `Kubernetes`).
- **Option B (Static Mapping)**: Map each known API group statically to a provider.
- **Chosen**: **Option A**, supplemented by fallback to the prefix or the raw `provider` field if returned by the backend. Option A is highly scalable, handling any future providers automatically without needing code updates.

### Decision 2: State Synchronization and UI Responsiveness
- We will leverage `useSearchParams` from `react-router-dom` to sync the currently selected Kind. This keeps navigation deep-linkable and allows us to easily support back-button navigation.
- Selection changes will immediately trigger query invalidation and refetching of resources for the chosen Kind.

### Decision 3: Component Reusability
- We will preserve and embed the existing `ResourceListView` as the right-hand panel of the split-pane. This minimizes duplication of complex code (e.g., the Monaco YAML editor, the creation modals, resource relations tabs, delete mutations).
- We will omit `headerRightArea` parameter when calling `ResourceListView`, which naturally removes the legacy `<select>` dropdown.

## Risks / Trade-offs

- **[Risk] High DOM Element Count**: Rendering 300+ list elements inside accordions could potentially cause lag during search typing.
  - *Mitigation*: 300-400 items are easily handled by modern virtual DOM engines. We will use simple and optimized array filters on the `kinds` array inside the React render cycle to avoid unnecessary recalculations.
