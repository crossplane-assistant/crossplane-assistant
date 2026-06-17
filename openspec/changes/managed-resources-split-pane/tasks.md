## 1. UI Layout and State (Split-Pane Container)

- [ ] 1.1 Refactor the layout of `ListManagedResources.tsx` to utilize a flex row split-pane layout with independent height controls (`h-[calc(100vh-120px)]`) for both columns.
- [ ] 1.2 Add React state variables in `ListManagedResources.tsx` to handle the explorer's search query, selected quick filter tab (`all | active | unhealthy`), and collapsed state of provider sections.

## 2. Kinds Explorer Sidebar Component

- [ ] 2.1 Create the header search input and the quick filter tabs (All, Active, Unhealthy) in the sidebar pane with responsive states and Lucide icons.
- [ ] 2.2 Implement the cloud provider categorization logic using regex parsing on the kind's API group (e.g., `s3.aws.upbound.io` -> `AWS`, `compute.gcp.upbound.io` -> `GCP`).
- [ ] 2.3 Build collapsible accordion menus for each provider grouping in the left-hand panel.
- [ ] 2.4 Render the individual Kind elements with badges displaying their active resource counts and readiness status (e.g., `3 active, 2/3 ready`), supporting selection on click.

## 3. Smart Selection and Table Integration

- [ ] 3.1 Add smart initial selection logic: when landing on the page with no Kind selected in the URL, automatically select the first Kind that has active (and ideally unhealthy) resources.
- [ ] 3.2 Embed the existing `ResourceListView` as the right-hand detail pane, omitting the `headerRightArea` parameter to cleanly remove the legacy native `<select>` dropdown.

## 4. Verification and Polish

- [ ] 4.1 Polish the Tailwind styles for the split-pane navigation, ensuring independent scroll behavior (`overflow-y-auto`) and consistent dark/light themes.
- [ ] 4.2 Verify URL parameter synchronization (`?kind=...&group=...`) is preserved and correctly updates the state when utilizing the browser's back and forward buttons.
- [ ] 4.3 Add or update relevant frontend unit tests to verify the kinds filtering and provider grouping logic.
