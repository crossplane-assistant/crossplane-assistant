## Context

Currently, Crossplane Assistant provides live resources, claims, compositions, and event visualizers. However, to inspect the schema definitions of these resources, developers must switch to the official online API reference. This technical design outlines an integrated, recursive schema browser that resolves OpenAPI v3 schemas from local cluster CRDs, native Kubernetes discovery endpoints, or external registries.

## Goals / Non-Goals

**Goals:**
- Implement a backend server route `/crossplane/schemas` that accepts GVK queries (`group`, `version`, `kind`) and resolves their schemas.
- Implement native Kubernetes resource schema resolution using the cluster's `/openapi/v3` API.
- Implement an external schema fetcher (via `doc.crds.dev`) that runs in the backend, avoiding CORS and enabling local file/memory caching.
- Build a reusable React `<SchemaBrowser />` component and a recursive `<SchemaNode />` collapsible UI.
- Add an "API Ref" tab to the sliding drawer in the resource list view.

**Non-Goals:**
- Building a deep Monaco editor auto-complete schema provider (this is visual browsing only).
- Creating interactive editing forms based on the schema (read-only reference).

## Decisions

### Decision 1: Server-side Schema Resolver Gateway
We will route all schema queries through the Go backend rather than fetching them directly from the frontend.
- **Rationale:** The backend has secure, direct access to the cluster's `DiscoveryClient` and `CRDRegistry` without exposing cluster credentials to the browser or triggering CORS errors when contacting external registries like `doc.crds.dev`.

### Decision 2: OpenAPI v3 for Native Kubernetes Fallbacks
For native resources (e.g. `Secret`, `ConfigMap`), we will query the cluster's `/openapi/v3/apis/<group>/<version>` or `/openapi/v3/api/v1` via the `DiscoveryClient`.
- **Rationale:** OpenAPI v3 splits the massive Kubernetes API spec into small, group-specific payloads. This allows the backend to fetch only the requested group (e.g., core `v1`), minimizing CPU and network overhead.

### Decision 3: Simple File-Based Cache for External Fallbacks
When a Custom Resource's schema is resolved externally via `doc.crds.dev` (because the CRD is not installed in the cluster), we will cache the result in a local directory (e.g. `.cache/schemas/`).
- **Rationale:** Ensures that once a schema has been downloaded once, the developer can work completely offline, and we avoid triggering external API rate-limiting.

## Risks / Trade-offs

- **[Risk] External Network Failure for Uninstalled Providers:** If a developer is working offline and references a provider CRD that isn't installed locally, the external fallback will fail.
  - *Mitigation:* The UI will display a clean, informative message ("Offline / Schema Not Found") advising the user that the schema is not installed locally and couldn't be fetched online, along with a "Retry" button.
- **[Risk] Large Schema File Payload Sizes:** Some massive schemas (like AWS/GCP provider resources) can exceed several megabytes of JSON.
  - *Mitigation:* The backend will strip irrelevant properties (like extensive validation regexes or nested status fields if not requested) and only return `type`, `description`, `required`, and `properties` to the frontend.
