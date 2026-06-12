## 1. Backend Go API Implementation

- [ ] 1.1 Register the new route `GET /crossplane/schemas` in `internal/server/server.go`.
- [ ] 1.2 Implement the schema resolution handler in Go, resolving local CRD schemas from `crdRegistry` (Option A).
- [ ] 1.3 Add support for native Kubernetes OpenAPI v3 schema lookup via the cluster's `DiscoveryClient` (Option B).
- [ ] 1.4 Implement the external fallback logic to fetch schemas from `doc.crds.dev` and save them in a local cache directory (Option C).
- [ ] 1.5 Create unit/integration tests to verify the schema server endpoints and fallback caching.

## 2. Frontend Query & Component Implementation

- [ ] 2.1 Create the React Query hook `useSchema` under `ui/src/queries/useSchemaQueries.ts` to fetch schema metadata.
- [ ] 2.2 Build the recursive, collapsible `<SchemaNode />` tree component in `ui/src/components/SchemaNode.tsx` using Tailwind CSS and Lucide icons.
- [ ] 2.3 Build the parent `<SchemaBrowser />` component in `ui/src/components/SchemaBrowser.tsx` to handle loading, empty, and offline retry states.
- [ ] 2.4 Write unit tests for the schema components under `ui/tests/` to verify tree traversal and state handling.

## 3. UI Integration & Verification

- [ ] 3.1 Integrate the `<SchemaBrowser />` component as a new "API Ref" tab inside the details sliding panel in `ui/src/components/ResourceListView.tsx`.
- [ ] 3.2 Verify layout, styling, and correct scroll-container behavior inside the slide-over drawer when displaying large schema trees.
- [ ] 3.3 Verify that both native, installed custom resources, and uninstalled external resources correctly resolve and display their respective schemas.
