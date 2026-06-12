## 1. Backend Core Alignment (ProviderRevision Watcher)

- [x] 1.1 Update `internal/crossplane/innervision/providerrevision/registry.go` NewIndexerInformerWatcher argument from `&v1.CustomResourceDefinition{}` to `&xpv1.ProviderRevision{}`.
- [x] 1.2 Validate backend compile/build with `go build` to ensure types are correctly aligned.

## 2. Frontend Stability and Core Fixes (Events, Logo)

- [x] 2.1 Update `ui/src/queries/useEventQueries.ts` to return `data?.items || []` instead of the raw `EventList` object, resolving the Events tab crash.
- [x] 2.2 Copy the `docs/assets/crossplane-assistant-logo.png` file to `ui/src/assets/crossplane-assistant-logo.png`.
- [x] 2.3 Modify image sources in `App.tsx` to display the new `/src/assets/crossplane-assistant-logo.png` asset.

## 3. Responsive Claim Graph Layout Expansion

- [x] 3.1 Rework `ui/src/components/ClaimDetailsView.tsx` by replacing the `max-w-7xl` restriction with full-viewport classes `max-w-full px-4 sm:px-6 lg:px-8`.
- [x] 3.2 Update node dimension bounds in `ui/src/components/ClaimGraphNode.tsx` (card width `w-[390px]`, min height `min-h-[90px]`, padding `py-2.5 px-3.5`).
- [x] 3.3 Remove `h-[52px] overflow-hidden` from the top row group and expand parent spacing `minWidth` style to `400px` to prevent overlaps or misalignments.

## 4. Advanced Composition Viewer Enhancements

- [x] 4.1 Update `ui/src/components/CompositionViewer.tsx` to conditionally detect and render Function Pipeline steps (`spec.pipeline`) alongside their input YAML configurations in Monaco.
- [x] 4.2 Display the implemented XRD interface signature (`spec.compositeTypeRef`) as a prominent header banner in the Composition view tab.
- [x] 4.3 Configure `ResourcePanel` instances to initialize as expanded (`isOpen: true`) by default if the resource count is <= 3, and add global expand/collapse buttons.

## 5. Cross-Resource Relationship Navigation

- [x] 5.1 Implement a helper to extract relations (Claim -> XR, XR -> MRs, MR -> parent XR & ProviderConfig) from live manifests inside details drawers.
- [x] 5.2 Build uniform `ResourceLink` UI components and wire them up so that clicking them updates the page route, filters appropriately, and automatically opens the matching sliding drawer.

## 6. Hook Count Mismatch & Compositions Drawer Alignment

- [x] 6.1 Reposition the `useSearchParams` hook and matching auto-select `useEffect` inside `ui/src/components/ClaimDetailsView.tsx` to the top of the component (before early conditional returns).
- [x] 6.2 Refactor `ui/src/components/ListCompositions.tsx` to add a semi-transparent backdrop overlay and window-level Escape key `useEffect` listener to dismiss the drawer.
