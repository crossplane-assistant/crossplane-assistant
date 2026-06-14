## Context

Currently, the Crossplane Assistant frontend uses the `/crossplane/managedresources/kinds` backend endpoint to retrieve all available Managed Resource (MR) kinds in the cluster.
The backend implementation (`Service.ListKind`) is built on top of the `ProviderRevision` registry and the `CRDRegistry` watchers.
It scans through each active `ProviderRevision`'s `.status.objectRefs` and extracts references of kind `CustomResourceDefinition`. It then queries the corresponding CRD in the cluster to retrieve group/version/kind information and surfaces it to the frontend.

However, modern Upbound providers use a new provider runtime where actual managed resources are referenced in `.status.objectRefs` with `Kind: "ManagedResourceDefinition"`, rather than `CustomResourceDefinition`. Only configuration definitions (such as `ProviderConfig` and `ClusterProviderConfig`) remain listed as `CustomResourceDefinition`.
This causes:
1. Actual managed resource kinds (such as GCP PubSub `Topic` or `Subscription`) to be completely missed and omitted from the listing.
2. Configuration kinds (like `ClusterProviderConfig`) to be incorrectly categorized as Managed Resources, displaying empty categories on the user interface.

## Goals / Non-Goals

**Goals:**
- Adapt the backend's kind-discovery mechanism to parse and list definitions of both `CustomResourceDefinition` and `ManagedResourceDefinition` kinds.
- Implement proper, complete filtering of provider configuration-related kinds from the surfaced managed resource list.
- Ensure type-safety and nil-safety during CRD retrieval from the local indexer/registry.
- Resolve the UI display issues so actual managed resources (like GCP PubSub resources) appear correctly under Managed Resources.

**Non-Goals:**
- Modifying how Managed Resources are created, deleted, or retrieved individually (their CRUD client remains fully functional).
- Redesigning the entire `ProviderRevision` registry or the `CRDRegistry` mechanism.

## Decisions

### Decision 1: Recognize `ManagedResourceDefinition` alongside `CustomResourceDefinition`
- **Option A**: Only read objects with `Kind == "CustomResourceDefinition"` (Current behavior - broken for Upbound v2+ providers).
- **Option B**: Read both `CustomResourceDefinition` and `ManagedResourceDefinition` (Selected).
- **Rationale**: Since the CRDs themselves exist in the cluster as `CustomResourceDefinition` under the same name specified by the `ManagedResourceDefinition` reference in the `ProviderRevision`, we can safely query the `CRDRegistry` with `obj.Name` when `obj.Kind` is either of the two.

### Decision 2: Exclude `ClusterProviderConfig`
- **Option A**: Keep displaying it as a Managed Resource (Current behavior - confusing as it has no managed instances).
- **Option B**: Exclude `ClusterProviderConfig` from the list along with `ProviderConfig`, `ProviderRevision`, `ProviderConfigUsage`, and `ProviderConfigRevision` (Selected).
- **Rationale**: `ClusterProviderConfig` represents cluster-scoped provider settings rather than physical cloud components managed under compositions. It is not an actual Managed Resource.

### Decision 3: Add `nil` Check for CRDs
- **Option A**: Trust that the CRD registry indexer always has the CRD (Current behavior - risk of `nil` pointer dereference / panic if the CRD hasn't been cached or is deleted).
- **Option B**: Explicitly check if the retrieved `crd` object is `nil` and skip if it is (Selected).
- **Rationale**: Robustness is vital for long-running services. If a provider revision references a CRD that does not exist or has been deleted, skipping it is the correct, safe action.

## Risks / Trade-offs

- **[Risk]**: A CRD might exist as `ManagedResourceDefinition` but not yet be indexed by `CRDRegistry` on startup.
  - **Mitigation**: The existing `crdRegistry` watch mechanism dynamically reconciles indices. The nil-check safeguard prevents any crash, and subsequent listings will correctly display the kind once it is synced in the index.
