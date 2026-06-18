## Why

In a multi-cloud environment where Crossplane orchestrates numerous resources, it is extremely common to encounter Managed Resources with identical `kind` names originating from different API groups or providers (e.g., an AWS RDS `Instance` vs a GCP CloudSQL `Instance`).
Currently, the UI suffers from two blind spots:
1. In the Kinds Explorer (Sidebar), only the `{k.kind}` is displayed, hiding the API group and version, making similar resources indistinguishable.
2. In the Resource Detail (Sliding Drawer), the top header only shows the resource name, without specifying its Kind, API group, version, or displaying a visual logo.
This change aims to implement a multi-line visual layout (Option A) to provide absolute clarity and immediate visibility without requiring mouse-over actions.

## What Changes

- Update the Managed Resources Kind Explorer (sidebar) to use a two-line layout: the first line showing the `Kind` in bold, and the second line showing the complete API group and version.
- Update the Managed Resource Detail sliding drawer header to display the `ClaimNodeLogo` component (automatically showing the provider's icon) and a clear subtitle detailing the Kind and its version below the resource name.

## Capabilities

### New Capabilities
- `managed-resource-identification`: Enhance the Managed Resources UI components to surface API group, version, and provider logo information alongside the resource Kind and Name to distinguish similarly named resources.

### Modified Capabilities
- `managed-resources-explorer`: Modifying the visual display of resource kinds in the sidebar to include API group and version.
- `cross-resource-navigation`: Modifying the detail drawer header to show richer context (Logo, Kind, API Group, Version).

## Impact

- `ui/src/components/ListManagedResources.tsx`: UI layout change in the sidebar list items.
- `ui/src/components/ResourceListView.tsx`: UI layout change in the sliding drawer header and injection of the `ClaimNodeLogo` component.
