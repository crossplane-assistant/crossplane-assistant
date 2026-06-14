## Why

Currently, the list of installed Providers and Functions on the cluster displays their Name, Healthy, and Installed status, but does not display their installed package version. This makes it difficult for users to verify what version of a provider or function is currently active in the cluster without clicking the resource and manually searching through the raw Kubernetes YAML manifest.

## What Changes

- Introduce a new helper function on the frontend to parse the package version tag from a package image string (e.g., `xpkg.upbound.io/crossplane-contrib/provider-kubernetes:v0.3.0` -> `v0.3.0`).
- Add a new "Version" column to the table in the installed Providers list view (`ListProviders.tsx`).
- Add a new "Version" column to the table in the installed Functions list view (`ListFunctions.tsx`).

## Capabilities

### New Capabilities
- `installed-package-versions`: Capability to extract and display the active version of installed Crossplane packages (Providers and Functions) directly in their respective dashboard lists.

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing. Leaving empty as we are establishing this as a new capability. -->

## Impact

- **Affected Components**: `ui/src/components/ListProviders.tsx` and `ui/src/components/ListFunctions.tsx`.
- **New Utilities**: `ui/src/utils/package.ts` or addition of a parsing helper inside `ui/src/utils/ecosystemCatalog.ts`.
- **Dependencies**: None. No backend API or schema changes are needed since the existing Go API already returns the complete `spec.package` field in the resource lists.
