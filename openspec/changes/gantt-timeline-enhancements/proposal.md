## Why

While our newly implemented Gantt chart timeline provides a clear chronological sequence of Claim provisioning, developers still need deeper, actionable context to troubleshoot provisioning issues. Specifically, they need to:
1. Distinguish between Crossplane synchronization lag and physical cloud provider instantiation delay.
2. See live error events and warnings (Event Pins) overlaid directly on the resource's timeline bar to explain unexpected delays.
3. Visually trace parent-child dependency relationships on hover to instantly isolate bottleneck propagation paths.

This change introduces advanced Gantt timeline enhancements, elevating the chart from a sequence visualization into a powerful, interactive cloud-native infrastructure profiling dashboard.

## What Changes

- **Multi-Condition Phase Breakdown**: Split the active provisioning bar of each row into separate **Synced** (Crossplane API registered) and **Ready** (physical provisioning completed) visual segments based on condition timestamps.
- **Interactive Event Pins**: Fetch and overlay live Kubernetes Events (with a strong visual emphasis on `Warning` events) as clickable/hoverable dots directly on each resource's bar. Hovering displays tooltips detailing the event reason and message.
- **Interactive Dependency Highlighting**: Upon hovering over a row, automatically highlight its upstream parents (the resources it waited on) and downstream children (the resources waiting on it) to clearly demonstrate composition dependencies.
- **Friction Protection**: Integrate defense-in-depth mitigations (like timeline clock-skew clamping, debounce handling for condition flickering, and lazy-loading for events) to ensure robust stability and high performance on larger claim trees.

## Capabilities

### New Capabilities
- `gantt-timeline-enhancements`: Upgraded Gantt profiling interface featuring multi-condition status segmenting, live Event pins, and interactive dependency hover highlights.

### Modified Capabilities
- `reconciliation-gantt-timeline`: Refactor the `ClaimGanttTimeline` component to integrate events data, split rendering segments, and implement hover state highlights.

## Impact

- **Frontend UI Components**:
  - `ui/src/components/ClaimGanttTimeline.tsx` (Major visual enhancements and interactive logic)
- **Frontend Queries**:
  - `ui/src/queries/useEventQueries.ts` (Extend or leverage event queries for live-pins loading)
