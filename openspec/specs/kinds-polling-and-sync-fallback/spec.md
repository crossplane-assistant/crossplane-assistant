# kinds-polling-and-sync-fallback Specification

## Purpose
TBD - created by archiving change kinds-polling-and-sync-fallback. Update Purpose after archive.
## Requirements
### Requirement: Synchronous Fallback on Empty Cache
The Go backend SHALL execute a synchronous, blocking cache update if the cache has never been warmed up before returning results.

#### Scenario: Server first startup and immediate request
- **WHEN** a client requests managed resource kinds and `lastUpdated` is zero
- **THEN** the backend blocks, runs `refreshCache` synchronously, and returns the accurate counts.

### Requirement: Frontend Active Polling
The React Query client SHALL periodically poll the managed resource kinds endpoint to reflect real-time count updates.

#### Scenario: Real-time update of sidebar badge
- **WHEN** the browser is open
- **THEN** the frontend fetches managed resource kinds every 10 seconds.

