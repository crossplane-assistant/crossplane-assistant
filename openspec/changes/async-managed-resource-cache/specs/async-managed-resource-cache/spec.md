## ADDED Requirements

### Requirement: Asynchronous Managed Resource Kind Delivery
The system SHALL deliver managed resource kind listings to clients immediately without blocking on backend Kubernetes API calls.

#### Scenario: First application load
- **WHEN** the frontend requests managed resource kinds via the API endpoint
- **THEN** the backend immediately returns the currently cached values (which may initially be empty or stale) without waiting for upstream synchronization.

### Requirement: Background Cache Warmup and Refresh
The backend SHALL maintain a background process to pre-warm and periodically refresh the managed resource kind cache without blocking client HTTP threads.

#### Scenario: Service Initialization
- **WHEN** the `managedresource` service is instantiated
- **THEN** a background goroutine is immediately spawned to populate the initial cache.

#### Scenario: Stale Cache Trigger
- **WHEN** a request arrives and the current cache is older than the configured TTL (e.g., 30 seconds)
- **THEN** the request is served immediately from the stale cache AND a non-blocking background task is triggered to update the cache for subsequent requests.
