## Why

The current Managed Resource (MR) kinds discovery mechanism fails to detect and surface resources from modern Upbound providers (e.g., GCP PubSub, CloudPlatform, etc.). This occurs because the backend only looks for object references with `Kind: "CustomResourceDefinition"` in active `ProviderRevision` resources, whereas modern providers package their resources under `Kind: "ManagedResourceDefinition"`. Additionally, non-managed infrastructure configurations like `ClusterProviderConfig` are incorrectly exposed to the user as empty categories, while actual managed resource instances are completely hidden.

## What Changes

- **Managed Resource Kind Detection**: Update the backend kind-discovery logic to recognize and parse both `CustomResourceDefinition` and `ManagedResourceDefinition` object kinds from active provider revisions.
- **Improved Filtering**: Exclude infrastructure-only configurations (specifically `ClusterProviderConfig`) from the Managed Resources kinds list.
- **Robustness**: Implement a nil-check safeguard when retrieving CRDs from the CRD registry to prevent potential backend panics.

## Capabilities

### New Capabilities
- `managed-resource-kinds-discovery`: Ensures that all active managed resource definitions (including those referenced as `ManagedResourceDefinition` by modern Upbound providers) are accurately identified, retrieved, and listed, while filtering out administrative configurations.

### Modified Capabilities
<!-- Leave empty as we are introducing a new robust discovery capability -->
