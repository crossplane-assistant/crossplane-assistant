## 1. Extend ResourceListView Component with Creation Modal

- [x] 1.1 Add `createModalTemplate`, `createModalTitle`, and `onCreateSuccess` props to `ResourceListViewProps` in `ui/src/components/ResourceListView.tsx`.
- [x] 1.2 Manage `showCreateModal` and modal state inside `<ResourceListView>`.
- [x] 1.3 Implement a standard overlay modal featuring Monaco Editor and standard "+ Create {title}" action button in `ResourceListView.tsx`.
- [x] 1.4 Configure standard cancel, close, and Escape keydown event listeners on the creation modal inside `ResourceListView.tsx`.

## 2. Refactor Compositions List

- [x] 2.1 Migrate `ListCompositions.tsx` to utilize `ResourceListView` with custom columns and a `CompositionViewer` detail view.
- [x] 2.2 Delete the custom table rendering, sliding drawer panel, backdrop overlay, and duplicate hook event handlers from `ListCompositions.tsx` to eliminate code redundancy.
- [x] 2.3 Wire up Compositions default YAML template and mock creation success alert on the Compositions page.

## 3. Wire Creation Modals on Remaining Views

- [x] 3.1 Implement default YAML template and mock creation callback for Claims in `ui/src/components/ListClaims.tsx`.
- [x] 3.2 Implement default YAML template and mock creation callback for XRDs in `ui/src/components/ListXrds.tsx`.
- [x] 3.3 Implement default YAML template and mock creation callback for Providers in `ui/src/components/ListProviders.tsx`.
- [x] 3.4 Implement default YAML template and mock creation callback for Functions in `ui/src/components/ListFunctions.tsx`.
- [x] 3.5 Implement default YAML template and mock creation callback for Managed Resources in `ui/src/components/ListManagedResources.tsx`.

## 4. Verification

- [x] 4.1 Confirm successful UI compilation and type-checking.
- [x] 4.2 Validate search, modal forms, and sliding detail drawers on all pages in the user interface.
