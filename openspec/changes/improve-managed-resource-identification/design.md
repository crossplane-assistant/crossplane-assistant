## Context

In Crossplane, identical `Kind` names are frequently used across different providers and API groups (e.g., `Bucket` exists in AWS, GCP, etc.). The current UI only displays the `Kind` and the resource name in the Managed Resources views (sidebar explorer and detail drawer). This makes it impossible to distinguish between resources with identical Kinds without digging into their manifests.
The user has decided to implement a multi-line layout to fix this (Option A), prioritizing absolute clarity.

## Goals / Non-Goals

**Goals:**
- Provide immediate visual distinction for Managed Resources that share the same `Kind`.
- Display API group and version information directly in the Managed Resources Sidebar.
- Display the Provider Logo, API group, and version directly in the Resource Detail sliding drawer header.
- Maintain existing component patterns, re-using `ClaimNodeLogo` for visual consistency.

**Non-Goals:**
- Refactoring the core data fetching logic for resources.
- Adding arbitrary visual badges or inline identifiers that truncate or hide information behind tooltips.
- Changing the layout of other views outside of `ListManagedResources.tsx` and `ResourceListView.tsx`'s drawer.

## Decisions

- **Two-Line Sidebar Items**: We will refactor the rendering of the `k` items in `ListManagedResources.tsx` from a simple `<span>` to a flexible column layout. The first line will hold the `kind`, and the second will display `group/version` in a smaller monospace font. This is chosen over inline badges because it avoids horizontal truncation and guarantees full visibility.
- **Drawer Header Enrichment**: In `ResourceListView.tsx`, the detail drawer header will be enhanced. We will extract `kind` and `apiVersion` from `selectedItem` to instantiate `<ClaimNodeLogo />`. We will also add a subtitle displaying the `kind` and `apiVersion` beneath the resource name. This brings the header on par with the visual richness of the Claim nodes.

## Risks / Trade-offs

- **Risk: Vertical Space in Sidebar** → By moving to a two-line display, each item in the explorer sidebar will take up more vertical height, potentially requiring more scrolling if there are many active kinds.
  - **Mitigation**: We will use compact padding and small text sizes (e.g., `text-[9px]`, `py-2`) to keep the density acceptable.
- **Risk: `selectedItem` typings in `ResourceListView`** → `ResourceListView` is a generic component `<T>`. Extracting `kind` and `apiVersion` assumes a specific shape.
  - **Mitigation**: We will safely cast to `any` and check for both `(selectedItem as any).kind` and `(selectedItem as any).base?.kind` to support both raw objects and Unstructured wrappers, providing fallbacks to prevent runtime crashes.
