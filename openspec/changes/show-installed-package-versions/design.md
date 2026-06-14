## Context

The Crossplane Assistant allows users to view and manage installed Providers and Functions. However, their specific active versions are not exposed in the tables, leaving users blind to whether they are running `v0.3.0`, `v1.0.0`, or some other package tag. This design details the implementation strategy for extracting this information from the existing raw Kubernetes resource objects and displaying it in the UI.

## Goals / Non-Goals

**Goals:**
- Extract the active version of installed Providers and Functions from the Kubernetes resources on the frontend.
- Display the package version inside a new, styled "Version" column in both the Providers and Composition Functions lists.
- Write robust unit tests to verify the version extraction logic under all possible package string inputs (digests, standard tags, missing packages, latest, etc.).

**Non-Goals:**
- Modify the Go API or backend resource services. (Out of scope, as the backend already serializes the entire Custom Resource including `spec.package`.)
- Modify views for non-package resources like Claims, Compositions, or XRDs.

## Decisions

### Decision 1: Pure Frontend Parsing of `spec.package`
- **Rationale**: The Crossplane Custom Resources for `Provider` and `Function` define the image under `spec.package`. This field is already fetched and returned by the backend lists (`/crossplane/providers` and `/crossplane/functions`). We will parse the version directly on the frontend using a lightweight utility function.
- **Alternatives Considered**: 
  - *Backend Parsing*: Adding Go logic to parse the image string and expose it as a custom API field. *Rejected* because the API is designed to return clean, raw Kubernetes representations. Keeping it on the frontend is simpler, faster, and maintains API schema purity.

### Decision 2: Location of Parsing Utility and Tests
- **Rationale**: We will create a new frontend utility file `ui/src/utils/package.ts` containing the `getPackageVersion` helper. Accompanying unit tests will be created in `ui/tests/package.test.ts` to verify its correctness across multiple edge cases.
- **Alternatives Considered**: 
  - *Inline parsing*: Inline parsing inside each list view. *Rejected* because duplicate logic violates DRY, and makes it harder to write unit tests.

### Decision 3: Column Positioning and Styling
- **Rationale**: We will insert the "Version" column between the "Name" and "Healthy" columns in both `ListProviders.tsx` and `ListFunctions.tsx`. This maintains a logical visual flow (Name -> Version -> Health -> Status). We will style the version using a light slate monospace badge (`font-mono text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded`) to differentiate it from status badges.

## Risks / Trade-offs

- **[Risk]** Package image string is missing `spec.package` (e.g. if the resource was created manually with incorrect schema, or is in transitional state).
  - *Mitigation*: The `getPackageVersion` function will gracefully handle `undefined` or empty strings and return `'Unknown'`.
- **[Risk]** Package images referenced with a SHA256 digest instead of a simple tag (e.g., `provider-kubernetes@sha256:1234abcd...`).
  - *Mitigation*: Our parsing utility will use a robust extraction pattern (using a regex or index analysis) to correctly identify tag vs. digest formats and return a clean short value.
