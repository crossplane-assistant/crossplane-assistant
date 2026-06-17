## Why

The current Managed Resources screen uses a native HTML `<select>` dropdown menu to choose between resource Kinds. In production clusters with hundreds of discovered Kinds (e.g. from AWS, GCP, or Azure providers), navigating this dropdown is highly inefficient: it lacks search/filtering capabilities, does not group Kinds by provider, and defaults to showing an empty Kind alphabetically, which makes the interface appear empty upon loading.

## What Changes

- Introduce a persistent, searchable **Split-Pane layout** for the Managed Resources view.
- Add a dedicated, highly interactive **Kinds Explorer (left-hand pane)** to browse, search, and filter all available resource Kinds.
- Implement **quick filters** (All, Active, Unhealthy) to immediately isolate Kinds of interest.
- Group Kinds visually under collapsible **Provider accordions** with active resource badges.
- Select the first **active/unhealthy Kind** automatically on load to prevent landing on empty lists.
- Re-use the existing `ResourceListView` as the **right-hand detail pane** for displaying instances.

## Capabilities

### New Capabilities
- `managed-resources-explorer`: A persistent, split-pane navigation layout that lets users search, group, and filter hundreds of resource Kinds from a dedicated sidebar.

### Modified Capabilities
- `managed-resource-instances-count`: Update the requirement about displaying count badges in a simple selection dropdown to instead support rendering and filtering counts dynamically in the Split-Pane Kinds Explorer sidebar.

## Impact

- **UI Components**: Major refactoring of `ui/src/components/ListManagedResources.tsx` to handle split-pane state and the new Kinds Explorer.
- **Routing**: Minimal impact, utilizing URL search parameters (`?kind=...&group=...`) to synchronize the selected Kind with the explorer panel.
- **API/Backend**: No impact. Reuses the existing `/kinds` and `/${ref}` endpoints.
