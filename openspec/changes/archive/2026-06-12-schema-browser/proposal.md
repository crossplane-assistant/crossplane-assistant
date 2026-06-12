## Why

Developers using Crossplane Assistant currently have to leave the application and navigate to the external official Crossplane API Reference or provider documentation to inspect the JSON schema (allowed properties, types, requirements, and descriptions) of their objects. This proposal introduces an interactive, inline JSON schema browser within the resource details sliding panel to keep developers focused and productive inside the workspace.

## What Changes

- **Backend (Go API):** Implement a new `GET /crossplane/schemas` API endpoint that resolves OpenAPI v3 validation schemas.
- **Hybrid Schema Resolution:**
  - **Option A (Primary - Local CRDs):** Extract OpenAPI schemas directly from local cluster CustomResourceDefinitions (CRDs) for absolute version accuracy.
  - **Option B (Secondary - Native fallback):** Extract core schemas for native Kubernetes resources (e.g., `Secret`, `ConfigMap`) using the cluster's `/openapi/v3` discovery endpoint.
  - **Option C (Tertiary - External fallback):** Fetch schemas for non-installed provider resources from an external registry (e.g., `doc.crds.dev`) and cache them locally to preserve performance and rate limits.
- **Frontend (React UI):**
  - Create a highly reusable `<SchemaBrowser />` component to browse JSON schemas as interactive, recursive collapsible trees mimicking the official API docs.
  - Integrate `<SchemaBrowser />` as a new tab ("API Ref") in the details sliding panel.

## Capabilities

### New Capabilities
- `schema-browser`: Interactive inline JSON schema browser for Crossplane and native Kubernetes resources.

### Modified Capabilities
<!-- No requirement changes to existing capabilities -->

## Impact

- **Backend:** New endpoint `GET /crossplane/schemas` registered in the Echo/Gin router. New internal service/helper for OpenAPI v3 discovery and external API caching.
- **Frontend:** New UI components under `ui/src/components/` and a new query file `ui/src/queries/useSchemaQueries.ts`.
- **Ecosystem:** No breaking changes.
