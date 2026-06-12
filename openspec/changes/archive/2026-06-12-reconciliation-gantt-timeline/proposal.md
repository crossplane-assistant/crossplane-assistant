## Why

Under Crossplane, understanding why a Claim takes time to provision is a core developer challenge. Developers need clear visibility into which resource is blocking or delaying the overall Claim's readiness. Additionally, understanding if a provisioning duration is normal requires a comparison benchmark against the cluster-wide average of that resource kind. Currently, the UI lacks detailed timing breakdowns, a visual sequence timeline, and comparison benchmarks.

This change introduces a high-fidelity visual Gantt chart in the Claim Details view. It separates the timeline into two distinct phases (waiting for dependencies vs. active cloud provisioning) and compares them dynamically with cluster-wide averages computed on the fly by a stateless backend telemetry service.

## What Changes

- **Claim Timeline View**: Introduce an elegant "Timeline" tab alongside the existing "Graph" tab in the Claim details screen.
- **Waiting vs. Provisioning Separation**: Break down the lifecycle of each resource in the Gantt chart into two distinct segments:
  - **Scheduling/Dependency Delay (Hachured Phase)**: Time elapsed between Claim creation and the actual application of the resource in the cluster (its `.metadata.creationTimestamp`).
  - **Active Cloud Provisioning (Color-Coded Phase)**: Time elapsed between resource creation and its transition to `Ready=True` status.
- **Stateless Backend Telemetry API**: Create a new Go API endpoint `/api/v1/telemetry/average` that dynamically lists and computes the average time-to-ready for any resource kind across the cluster.
- **Dynamic Cluster Averages Integration**: Integrate these cluster-wide benchmarks into the timeline with comparison markers and performance offset badges (e.g., `-(X)s` in green if faster, `+(X)s` in orange if slower).
- **Modern Pure Tailwind & HTML UI**: Deliver a modern, high-fidelity responsive layout without bulky graphing libraries, styled with smooth CSS animation hachures, emerald/amber gradients, and glassmorphism interactive tooltips.

## Capabilities

### New Capabilities
- `reconciliation-gantt-timeline`: Interactive Gantt-style timeline for Claim provisioning, featuring dependency-waiting vs. active-creation breakdowns, along with on-the-fly cluster-wide average indicators.

### Modified Capabilities
- `claim-dependency-graph`: Enhance the main ClaimDetailsView to support tabbed navigation between the full-width dependency tree graph and the new Gantt timeline view.

## Impact

- **Frontend UI Components**:
  - `ui/src/components/ClaimDetailsView.tsx` (Add tab switching and load the timeline)
  - `ui/src/components/ClaimGanttTimeline.tsx` (New component implementing the Gantt view)
  - `ui/src/types.ts` (Enrich models with new fields if necessary)
- **Backend API**:
  - New service package at `internal/crossplane/innervision/telemetry/` with calculations.
  - New route registration at `/api/v1/telemetry/average` in `internal/server/server.go`.
