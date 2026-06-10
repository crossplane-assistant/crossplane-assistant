## Context

The initial React 19 modernization focused on the Composition Viewer and core shell. The other five exploration tabs—Claims, XRDs, Managed Resources, Providers, and Functions—still display fallback placeholders. To complete the migration and deliver a fully functional, production-ready product, we must port these remaining views.

## Goals / Non-Goals

**Goals:**
- Port the remaining explorer views (Claims, XRDs, Managed Resources, Providers, Functions) to React 19 functional components.
- Establish a highly generic, reusable, and customizable `<ResourceListView>` component to minimize duplication of table layouts, details panels, Monaco Editors, and status badge configurations.
- Hook up all list components with TanStack Query hooks, integrating active polling/reloading similar to the original Angular `Reloader` pattern.
- Enable full CRUD options, specifically including the resource "Delete" action in the detail panel header.

**Non-Goals:**
- Modifying backend endpoints or Go routers.
- Adding unrelated UI features or dashboards.

## Decisions

- **Generic `<ResourceListView>` Pattern**: Instead of copying identical sliding-drawer, tab-selection, and YAML-editor logic across five separate view files, we will implement a generalized list component. It will receive column layouts, queries, and details-rendering parameters to render any listing uniformly.
- **Dynamic Managed Resource Kinds**: Since Managed Resources are fully dynamic in Crossplane, the Managed Resources page will perform a double-layered fetch:
  1. Retrieve all available `ManagedResourceKind`s via `/crossplane/managed-resources/kinds`.
  2. Maintain active state of the selected Kind, and dynamically trigger the resource list fetch for `group/version/kind` (invalidating and refetching on Kind selection change).
- **TanStack Query Active Polling**: We will replace the custom Angular `Reloader` class with TanStack Query's native `refetchInterval: 5000` option for active status polling.

## Risks / Trade-offs

- [Risk] **High-Frequency Polling Overhead**: Active 5-second polling can strain the cluster in highly loaded environments.
  - *Mitigation*: Limit the polling interval to 5000ms and disable background polling if window focus is lost.
- [Risk] **API endpoint complexity of Managed Resources**: Managed Resource paths contain variable parts (`group/version/kind`) in their endpoint URLs.
  - *Mitigation*: Design the query hook `useManagedResources(group, version, kind)` to automatically disable itself or return empty arrays until a valid Kind is selected.
