## 1. Sidebar Explorer Enhancements

- [ ] 1.1 Update `ui/src/components/ListManagedResources.tsx`: Modify the `groupKinds` map rendering. Replace the single-line layout with a two-line column structure inside the button.
- [ ] 1.2 Update `ui/src/components/ListManagedResources.tsx`: Display `k.kind` prominently on the first line (bold text when selected, otherwise medium).
- [ ] 1.3 Update `ui/src/components/ListManagedResources.tsx`: Display `{k.group}/{k.version}` on the second line in a smaller monospace font.
- [ ] 1.4 Test `ListManagedResources` visually to ensure layout consistency across different length names and active states.

## 2. Resource Detail Drawer Enhancements

- [ ] 2.1 Update `ui/src/components/ResourceListView.tsx`: Import the `ClaimNodeLogo` component.
- [ ] 2.2 Update `ui/src/components/ResourceListView.tsx`: Extract `itemKind` and `itemApiVersion` from `selectedItem` safely (handling both direct properties and `.base` wrapper properties).
- [ ] 2.3 Update `ui/src/components/ResourceListView.tsx`: Inject the `ClaimNodeLogo` component in the sliding drawer's header area, using the extracted `itemApiVersion` and `itemKind`.
- [ ] 2.4 Update `ui/src/components/ResourceListView.tsx`: Modify the header's text container to display both the resource name (prominent) and a new subtitle with `{itemKind} ({itemApiVersion})`.
- [ ] 2.5 Test `ResourceListView` detail drawer to verify logo rendering, subtitle visibility, and resilience when viewing resources without clear `apiVersion` or `kind` properties.
