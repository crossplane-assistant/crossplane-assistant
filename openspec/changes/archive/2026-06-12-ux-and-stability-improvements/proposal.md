## Why

The application currently suffers from several UI/UX limitations and critical stability issues that degrade the developer experience:
- The Claim dependency graph is confined to a narrow container and truncates vital resource details, with age and version tags obscuring text.
- The Events tab in the sliding detail drawer crashes with a blank screen ("TypeError: events is not iterable") due to mismatching API types.
- The Compositions detail drawer "View" tab appears empty because its panels are collapsed by default, and it lacks support for modern Composition Functions (Pipelines).
- The Managed Resources page fails to display cloud provider resource kinds (like GCP Topics, AWS Buckets, etc.) due to a copy-paste error in the Go ProviderRevision controller watcher.
- Navigating between interconnected Crossplane resources (Claims, Composite XRs, Managed Resources, and ProviderConfigs) is disconnected and manual.
- Navigating to the Claim Graph page or clicking 'Inspect XR' triggers a React hook count mismatch crash (`Rendered fewer hooks than expected`) due to query hooks placed after early return statements.
- The Compositions page sliding detail drawer has inconsistent drawer dismissal and layout behaviors, missing backdrop overlays and key down event listeners.

## What Changes

- **Full-Width Claim Graph & Un-Truncated Cards**: Rework the graph container to span full width, widen the node cards, remove rigid height caps, and format metadata cleanly to prevent text overlaps.
- **Robust Event Query parsing**: Correct the Event React Query hook to extract the `items` array from the Kubernetes `EventList` response, resolving the blank-screen crash.
- **Enriched Compositions View**: Add support for Pipeline/Composition Functions rendering, display the XRD interface implemented, and initialize resource panels in a smart open state with expand/collapse-all controls.
- **Standardized Compositions Drawer**: Refactor `ListCompositions.tsx` to include a semi-transparent backdrop overlay and an Escape key keydown listener, unifying drawer dismissal mechanics.
- **Go ProviderRevision Registry Watcher Fix**: Rectify the controller watcher type prototype in Go from `CustomResourceDefinition` to `ProviderRevision`, restoring discovery of all active provider-owned resource kinds.
- **Cross-Resource Navigation Panel**: Introduce a standardized "Relations" widget/tab in sliding drawers to automatically parse and provide clickable links across the Claim -> XR -> MR -> ProviderConfig chain.
- **Correct Hook Ordering**: Reposition the `useSearchParams` and related hooks to the top of `ClaimDetailsView.tsx` (before early load/error returns) to solve the Hook count crash.
- **Logo Asset Update**: Transition the application logo from SVG to the new PNG asset (`docs/assets/crossplane-assistant-logo.png`).

## Capabilities

### New Capabilities
- `cross-resource-navigation`: Interactive relationships map in details drawer allowing seamless traversal from Claim -> XR -> MR -> ProviderConfig.
- `stability-fixes`: Structural resolution of the Event tab iterable crash and the ProviderRevision watcher type decoding bug.

### Modified Capabilities
- `claim-dependency-graph`: Expand the graph canvas to full screen and refactor node elements into adaptive-height, wider cards with no text truncation.
- `port-remaining-views`: Enhance the Composition detail view to render Pipeline steps, XRD signatures, and support responsive drawer layout behaviors.

## Impact

- **Frontend components**: `ui/src/App.tsx`, `ui/src/components/ClaimDetailsView.tsx`, `ui/src/components/ClaimGraphNode.tsx`, `ui/src/components/ClaimEventsList.tsx`, `ui/src/components/ListCompositions.tsx`, `ui/src/components/CompositionViewer.tsx`, `ui/src/components/ResourcePanel.tsx`.
- **Frontend queries**: `ui/src/queries/useEventQueries.ts`.
- **Backend services**: `internal/crossplane/innervision/providerrevision/registry.go`.
