## Context

Currently, only the Compositions page (`ListCompositions.tsx`) implements a custom, mock resource creation flow via an inline modal and Monaco Editor. Other list pages (Claims, XRDs, Providers, Functions, Managed Resources) do not offer any creation features.

Additionally, while most pages use the centralized `ResourceListView` layout, `ListCompositions.tsx` has a completely independent layout implementation, leading to visual inconsistency, redundant sliding drawer code, lack of search capability, and a different user experience.

Standardizing both layout and creation mechanics using a centralized component will clean up code, remove duplication, and provide a unified, professional user experience.

## Goals / Non-Goals

**Goals:**
- Eliminate custom layout, sliding drawer, backdrop, and Monaco rendering from `ListCompositions.tsx` by fully migrating it to `<ResourceListView>`.
- Extend `<ResourceListView>` to handle mock resource creation button rendering and a YAML-based Monaco modal out-of-the-box.
- Implement specialized, valid default Crossplane YAML templates for all 6 list explorer pages.
- Standardize visual modal styling, animations (fadeIn/slideIn), close mechanics (close button, cancel, backdrop click, Escape key), and success feedback across all pages.

**Non-Goals:**
- Connecting creation actions to a real backend write API (it is explicitly mock-only for this frontend explorer prototype).
- Changing database schemas or API definitions.

## Decisions

### 1. Extending `ResourceListView` for Centralized Creation
Instead of implementing a custom modal in every list view file, we will add new optional configuration properties to `ResourceListViewProps`:
```typescript
interface ResourceListViewProps<T> {
  // ... existing props
  createModalTemplate?: string;       // Default YAML template content
  createModalTitle?: string;          // Modal header text (e.g. "Create PostgreSQL Claim")
  onCreateSuccess?: (yaml: string) => void; // Success callback
}
```
If `createModalTemplate` is provided, `ResourceListView` will automatically render a standardized `+ Create {title}` button and encapsulate the modal state (`showCreateModal`), Monaco YAML Editor, cancel/close, and notification logic.

### 2. Standardized Templates per Page
We will supply distinct, high-quality, valid Crossplane templates for each page:

- **Claims** (`ListClaims.tsx`):
  ```yaml
  apiVersion: database.example.org/v1alpha1
  kind: PostgreSQLInstance
  metadata:
    name: my-postgresql-claim
    namespace: default
  spec:
    parameters:
      storageGB: 20
  ```
- **Compositions** (`ListCompositions.tsx`):
  ```yaml
  apiVersion: apiextensions.crossplane.io/v1
  kind: Composition
  metadata:
    name: xpostgres-custom
  spec:
    compositeTypeRef:
      apiVersion: database.example.org/v1alpha1
      kind: XPostgreSQLInstance
    resources:
      - name: postgres-db
        base:
          apiVersion: kubernetes.crossplane.io/v1alpha1
          kind: Object
          spec:
            forProvider:
              manifest:
                apiVersion: v1
                kind: ConfigMap
                metadata:
                  name: custom-db-config
  ```
- **XRDs** (`ListXrds.tsx`):
  ```yaml
  apiVersion: apiextensions.crossplane.io/v1
  kind: CompositeResourceDefinition
  metadata:
    name: xpostgresqlinstances.database.example.org
  spec:
    group: database.example.org
    names:
      kind: XPostgreSQLInstance
      plural: xpostgresqlinstances
    claimNames:
      kind: PostgreSQLInstance
      plural: postgresqlinstances
    versions:
      - name: v1alpha1
        served: true
        referenceable: true
        schema:
          openAPIV3Schema:
            type: object
            properties:
              spec:
                type: object
                properties:
                  parameters:
                    type: object
                    properties:
                      storageGB:
                        type: integer
  ```
- **Providers** (`ListProviders.tsx`):
  ```yaml
  apiVersion: pkg.crossplane.io/v1
  kind: Provider
  metadata:
    name: provider-aws-s3
  spec:
    package: xpkg.upbound.io/crossplane/provider-aws-s3:v1.0.0
  ```
- **Functions** (`ListFunctions.tsx`):
  ```yaml
  apiVersion: pkg.crossplane.io/v1
  kind: Function
  metadata:
    name: function-patch-and-transform
  spec:
    package: xpkg.upbound.io/crossplane/function-patch-and-transform:v0.2.0
  ```
- **Managed Resources** (`ListManagedResources.tsx`):
  ```yaml
  apiVersion: s3.aws.upbound.io/v1beta1
  kind: Bucket
  metadata:
    name: my-app-static-bucket
  spec:
    forProvider:
      region: us-east-1
    providerConfigRef:
      name: default
  ```

### 3. Cleaning Up `ListCompositions.tsx` Boilerplate
By leveraging `<ResourceListView>`, we can safely delete more than 150 lines of duplicate drawer rendering, state tracking, overlay backdrops, and event listeners in `ListCompositions.tsx`. It will now purely load data, configure columns, define its custom detail view (via `<CompositionViewer>`), and feed them directly into `<ResourceListView>`.

### 4. Consistent Creation Feedback Loop
When the "Create" button is clicked in the modal, a beautiful, uniform alert notification or browser `alert()` is triggered confirming successful mock creation of the resource. The modal is automatically closed.

## Risks / Trade-offs

- **[Risk] Monaco Editor size on small screens** → *Mitigation*: Restrict modal width to `max-w-2xl` and Monaco height to `h-[250px]` (or `h-[300px]`) with responsive overflow handling to guarantee accessibility on all viewports.
- **[Risk] YAML changes discarded on modal close** → *Mitigation*: Ensure clicking the Backdrop overlay on creation modal does NOT close the modal to avoid accidental loss of edited YAML text. Only clicking the close (X) or "Cancel" button will dismiss it.
