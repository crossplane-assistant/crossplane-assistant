## Why

The current Managed Resources health status badge in the sidebar counts the number of available Kinds (resource categories) rather than the actual number of active, physical resource instances deployed in the cluster. This is confusing for users who expect the badge to represent their real infrastructure. Furthermore, the UI selection dropdown in the Managed Resources screen offers no visibility into which categories contain active resources without clicking through each option.

## What Changes

- **Backend Data Structure**: Expand the `MRKind` struct in the Go backend to include `TotalItems` and `ReadyItems` counts.
- **Parallel Querying**: Implement concurrent retrieval of resource instances in the Go backend (`ListKind` service) utilizing goroutines and a bounded concurrency channel (semaphore) to prevent APIServer overload.
- **Sidebar Badge Aggregation**: Update the React frontend `App.tsx` to sum the `totalItems` and `readyItems` across all kinds to display the true number of active resource instances and their global health.
- **Dropdown Enhancements**: Update the selection dropdown in `ListManagedResources.tsx` to display active counts and readiness (e.g. `Topic (3 active, 2/3 ready)`).

## Capabilities

### New Capabilities
- `managed-resource-instances-count`: Surfacing real-time counts and health of active managed resource instances in the sidebar explorer badge and the category selection dropdown, driven by high-performance concurrent backend querying.

### Modified Capabilities
<!-- Leave empty as this is a new capability representing parallel counting -->
