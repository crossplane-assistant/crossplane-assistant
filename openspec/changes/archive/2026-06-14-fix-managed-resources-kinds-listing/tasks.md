## 1. Backend Implementation

- [x] 1.1 Update `Service.ListKind` in `internal/crossplane/innervision/managedresource/managedresource.go` to match both `"CustomResourceDefinition"` and `"ManagedResourceDefinition"` kinds in revision objects.
- [x] 1.2 Add `nil` checking for retrieved CRD object `crd` to prevent nil pointer panics when a referenced CRD is missing.
- [x] 1.3 Add filtering of `"ClusterProviderConfig"` from the list of kinds returned by `Service.ListKind` to avoid exposing infrastructure configuration.

## 2. Verification and testing

- [x] 2.1 Start the application in development mode (`make dev`) or run tests.
- [x] 2.2 Verify that the `/crossplane/managedresources/kinds` endpoint works correctly and returns actual managed resources (including GCP PubSub).
- [x] 2.3 Verify that the Managed Resources select dropdown in the UI successfully lists GCP PubSub resource kinds and no longer lists ClusterProviderConfig.
- [x] 2.4 Verify that selecting GCP PubSub resource kinds successfully retrieves and lists the corresponding active resources from the cluster.
