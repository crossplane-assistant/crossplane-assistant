## 1. Extend ResourceListView Component with Creation Modal

- [ ] 1.1 Add `createModalTemplate`, `createModalTitle`, and `onCreateSuccess` props to `ResourceListViewProps` in `ui/src/components/ResourceListView.tsx`.
- [ ] 1.2 Manage `showCreateModal` and modal state inside `<ResourceListView>`.
- [ ] 1.3 Implement a standard overlay modal featuring Monaco Editor and standard "+ Create {title}" action button in `ResourceListView.tsx`.
- [ ] 1.4 Configure standard cancel, close, and Escape keydown event listeners on the creation modal inside `ResourceListView.tsx`.

## 2. Refactor Compositions List

- [ ] 2.1 Migrate `ListCompositions.tsx` to utilize `ResourceListView` with custom columns and a `CompositionViewer` detail view.
- [ ] 2.2 Delete the custom table rendering, sliding drawer panel, backdrop overlay, and duplicate hook event handlers from `ListCompositions.tsx` to eliminate code redundancy.
- [ ] 2.3 Wire up Compositions default YAML template and mock creation success alert on the Compositions page.

## 3. Wire Creation Modals on Remaining Views

- [ ] 3.1 Implement default YAML template and mock creation callback for Claims in `ui/src/components/ListClaims.tsx`.
- [ ] 3.2 Implement default YAML template and mock creation callback for XRDs in `ui/src/components/ListXrds.tsx`.
- [ ] 3.3 Implement default YAML template and mock creation callback for Providers in `ui/src/components/ListProviders.tsx`.
- [ ] 3.4 Implement default YAML template and mock creation callback for Functions in `ui/src/components/ListFunctions.tsx`.
- [ ] 3.5 Implement default YAML template and mock creation callback for Managed Resources in `ui/src/components/ListManagedResources.tsx`.

## 4. Verification

- [ ] 4.1 Confirm successful UI compilation and type-checking.
- [ ] 4.2 Validate search, modal forms, and sliding detail drawers on all pages in the user interface.
