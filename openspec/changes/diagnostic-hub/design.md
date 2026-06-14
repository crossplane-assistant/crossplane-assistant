## Context

The current debugging process in Crossplane Assistant is heavily fragmented. When a claim or composite resource fails, developers must manually inspect resources and jump into terminals to query logs from the various provider controller pods (e.g. AWS, GCP, Azure). This design describes a centralized backend diagnostics engine and frontend tab/view to unify event timelines and dynamically correlate real-time provider logs directly within the UI.

## Goals / Non-Goals

**Goals:**
- Implement a backend service `internal/crossplane/innervision/diagnostic/` to serve aggregated events and correlated logs.
- Map Managed Resources (MR) dynamically to their active ProviderRevisions using existing cached `CRDRegistry` and `ProviderRevision` registry stores, avoiding any additional external network overhead.
- Fetch active Provider controller logs by querying Kubernetes Pods with the label `pkg.crossplane.io/revision` and streaming container log outputs.
- Filter provider logs in-memory on the backend by matching resource name, namespace, or UID.
- Introduce an interactive `Diagnostic Hub` view in the React frontend, displaying an aggregated event timeline and a black-background cyberpunk log terminal.
- Integrate the correlated log viewer into the sliding details drawer for individual Managed Resource nodes.

**Non-Goals:**
- Building arbitrary pod logging or generic shell terminals (logs are strictly restricted to relevant Crossplane controller pods).
- Replacing standard Kubernetes events or log aggregation platforms (this is optimized for localized, real-time developer troubleshooting).

## Decisions

### Decision 1: Low-Overhead GVK-to-Pod Mapping using Local Caches
- **Rationale**: To match an MR's GVK with its corresponding ProviderRevision and Pod, we will scan the locally-cached registries `crdRegistry` and `prRegistry` instead of polling the Kubernetes API Server repeatedly. This ensures that locating the active provider revision takes less than 1ms.
- **Alternatives Considered**: Direct querying of the Kubernetes API on every request. *Rejected* due to excessive API Server load and rate-limiting risks (HTTP 429).

### Decision 2: Stream-based Log Tail Retrieval
- **Rationale**: To prevent memory spikes or large payload transfers, log requests will retrieve only the latest 500 lines of logs from the controller pod container (`TailLines: 500`). The backend will filter these lines and return them to the client.
- **Alternatives Considered**: Implementing full log historical search or indexing. *Rejected* as it introduces high operational complexity (e.g. Elasticsearch/Loki) and is out of scope for a localized developer dashboard.

### Decision 3: Multi-Keyword Name/UID Filtering
- **Rationale**: Different Crossplane providers log reconciliations using varied patterns (some log the Kubernetes metadata name, some log the UID, and some log the external name annotation). The backend filter will match a line if it contains the resource's `Name`, `UID`, or `crossplane.io/external-name` annotation, ensuring ultra-reliable log correlation.
- **Alternatives Considered**: Strict regex parsing. *Rejected* as different cloud providers have heterogeneous log schemas; simple multi-keyword substring matching is much more resilient.

## Risks / Trade-offs

- **[Risk]** Container log rotation or eviction may lose older error messages.
  - **Mitigation**: If log queries yield no matching lines, the UI will automatically fall back to highlight the persistent, long-lived `.status.conditions[].message` field on the resource node.
- **[Risk]** Multi-container provider pods causing client-go `GetLogs` errors if no container is specified.
  - **Mitigation**: The Go service will query the pod spec and automatically pass `pod.Spec.Containers[0].Name` as the target container, guaranteeing successful log streaming.
