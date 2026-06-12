## ADDED Requirements

### Requirement: Retrieve Local CRD Schema
The Go API server SHALL provide an HTTP GET endpoint `/crossplane/schemas` to fetch the OpenAPI v3 schema of any Custom Resource installed in the cluster using its API group, version, and kind (GVK).

#### Scenario: Retrieve installed CRD schema
- **WHEN** an HTTP GET request is made to `/crossplane/schemas?group=pkg.crossplane.io&version=v1&kind=Provider`
- **THEN** the server retrieves the `providers.pkg.crossplane.io` CRD from the local registry, extracts the `openAPIV3Schema` for version `v1`, and returns it as a JSON payload with a 200 OK status.

### Requirement: Retrieve Native Kubernetes Resource Schema
The Go API server SHALL fall back to querying the cluster's native `/openapi/v3` API when a schema request is received for a native Kubernetes resource (e.g., in the empty core group `""` or standard native groups like `apps`, `batch`, etc.).

#### Scenario: Retrieve native Secret schema
- **WHEN** an HTTP GET request is made to `/crossplane/schemas?group=&version=v1&kind=Secret`
- **THEN** the server queries the cluster's `/openapi/v3/api/v1` discovery endpoint, extracts the schema for the `Secret` kind, and returns it as a JSON payload with a 200 OK status.

### Requirement: Fetch and Cache External Schema Fallback
The Go API server SHALL query an external OpenAPI schema registry (like `doc.crds.dev`) when a schema is requested for a custom resource that is not currently installed in the cluster, and cache the retrieved schema to disk or memory for subsequent requests.

#### Scenario: Fetch and cache non-installed CRD schema
- **WHEN** an HTTP GET request is made for a GVK that is not found in the local CRD registry
- **THEN** the server requests the CRD schema from `doc.crds.dev`, writes the successful response to a local cache, and returns it to the client.

### Requirement: Reusable Schema Browser Component
The React UI SHALL include a highly reusable `<SchemaBrowser />` component that accepts an `apiVersion` and `kind` as props, manages schema loading states, and fetches schema data using React Query.

#### Scenario: Load and render schema for a resource
- **WHEN** the `<SchemaBrowser apiVersion="database.aws.upbound.io/v1beta1" kind="RDSInstance" />` component is mounted
- **THEN** it triggers a React Query to `/crossplane/schemas`, shows a loading spinner during fetch, and renders the recursive collapsible tree upon success.

### Requirement: Interactive Recursive Tree Traversal
The `<SchemaBrowser />` component SHALL render each property in the JSON schema as an interactive tree node showing its name, type, a required badge (if specified in the parent's `required` array), and the field description. Object and array type nodes SHALL be collapsible.

#### Scenario: Expand collapsible object node
- **WHEN** the user clicks the expand chevron on an object property node (such as `spec` or `forProvider`)
- **THEN** the UI expands the node to recursively display all child properties with clear hierarchy indentation and type annotations.

### Requirement: Viewport Height Alignment
The `<SchemaBrowser />` component and its property tree Card SHALL dynamically stretch to occupy the entire remaining vertical space of the details sliding side panel, with a minimum default height of `300px` and an independent inner scrollbar, ensuring fixed headers remain visible.

#### Scenario: Adjust height dynamically to viewport
- **WHEN** the "API Ref" tab is active in the sliding panel
- **THEN** the schema property tree stretches to fit the remaining vertical space of the viewport, and scrolling is restricted to the tree card itself.
