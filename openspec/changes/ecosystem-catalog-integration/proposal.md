## Why

Crossplane's strength lies in its rich community ecosystem of Providers and Functions (e.g., those hosted under `crossplane-contrib`). Currently, users can only install these components by writing raw YAML files from scratch, without any discovery mechanism, templates, or contextual documentation inside the Crossplane Assistant. This capability bridges that gap by offering a built-in Ecosystem Hub to browse, study, and install these components seamlessly.

## What Changes

- **Ecosystem Hub UI**: Introduce a new "Ecosystem Hub" tab alongside the "Installed" list in both the Providers and Functions explorer pages.
- **Hybrid Local-Hub with Fallback**: Build a hybrid client-side catalog. When online, it fetches live repository metadata from the `crossplane-contrib` GitHub organization and merges it with a local curated registry of high-quality presets. When offline or rate-limited, it gracefully falls back to the local curated registry.
- **Documentation Deep-Links**: Render direct documentation links on each catalog card to help users read official guides and understand usage before installing.
- **Auto-Config & Curated Presets**: Populate the standard Monaco YAML Creation Modal with optimized, pre-configured manifests for curated items, or automatically generated valid templates for other community items.

## Capabilities

### New Capabilities
- `ecosystem-catalog`: Dual-mode (online/offline) catalog of Crossplane providers and functions integrated directly into the list views, providing dynamic GitHub metadata, documentation links, and direct installation presets.

### Modified Capabilities
<!-- None -->

## Impact

- **UI Components**: `ListProviders.tsx` and `ListFunctions.tsx` will be updated to host the tabbed layout. A new `EcosystemCatalog.tsx` reusable component will be introduced to handle the hub rendering, filtering, and card views.
- **Catalog Utilities**: Create a file `ui/src/utils/ecosystemCatalog.ts` (or similar) containing local curated package presets, types, and the merge logic for GitHub API integration.
- **API Dependencies**: Browser-based queries to `https://api.github.com/orgs/crossplane-contrib/repos`. No backend adjustments are required, keeping the proxy microservice light and isolated from internet connectivity requirements.
