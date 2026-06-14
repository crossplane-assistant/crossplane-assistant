## Why

Debugging reconciliation failures and cloud resource errors in Crossplane is currently the single greatest developer pain point, forcing operators to hop between multiple Kubernetes resources (Claims, XRs, MRs) and query multiple provider logs manually via `kubectl`. This change introduces a central, unified **Real-Time Diagnostic Hub** inside Crossplane Assistant that aggregates Kubernetes events, resolves dependency trees, and automatically correlates and live-filters Provider logs for failing resources to provide a single-pane troubleshooting interface.

## What Changes

- **Unified Diagnostics API**: Introduce a new backend endpoint `GET /crossplane/claims/:ref/diagnostics` that aggregates events, resolves resource trees, maps GVKs to active ProviderRevisions, and streams filtered logs from provider pod containers.
- **Diagnostics Hub Dashboard**: Create a new top-level `Diagnostic Hub` view inside the Claim detail screen alongside the current Graph and Timeline views.
- **Log Correlation Terminal**: Build a styled black-background, high-contrast terminal viewer for real-time provider logs linked to individual resources.
- **Sliding Drawer Log tab**: Integrate a "Diagnostic Logs" tab directly inside the existing sliding details drawer for quick debugging of any selected Managed Resource.

## Capabilities

### New Capabilities
- `diagnostic-hub`: Provides unified event timeline aggregation across the entire claim hierarchy and real-time, auto-correlated Provider log filtering and streaming for Managed Resources (MRs).

### Modified Capabilities
<!-- None. No existing specs/requirements are being modified, we are adding a brand new diagnostics system. -->

## Impact

- **Backend (Go)**: A new Go package `internal/crossplane/innervision/diagnostic/` comprising a service, an HTTP handler, and associated models, registered in `internal/server/server.go`.
- **Frontend (React)**: React components including `ClaimDiagnosticsHub.tsx`, a log terminal viewer, and integration into `ClaimDetailsView.tsx`.
- **RBAC**: Requires read permissions for pods, pod logs, and event streams in the cluster (within scope of the server's ServiceAccount).
