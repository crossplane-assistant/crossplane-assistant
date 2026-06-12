## Context

The crossplane-assistant is a stateless, single-binary tool querying live Kubernetes objects. While viewing a Claim dependency graph, developers can see which objects are healthy or failing, but have no timeline perspective on *when* objects were created, *how long* they waited for upstream patches/status, or *how long* they took to provision in the cloud compared to historical averages.

Calculating average provisioning duration must be done in a lightweight, stateless fashion directly against the Kubernetes API, avoiding database dependencies to preserve the zero-config, single-binary deployment.

## Goals / Non-Goals

**Goals:**
- Provide a clear, Gantt-style sequential rendering of Claim provisioning.
- Distinctly separate scheduling/dependency wait times from actual cloud provider creation/ready times.
- Implement a stateless Go telemetry API endpoint to calculate cluster-wide average provisioning times.
- Implement client-side memory caching to minimize API server load.
- Design a modern, premium UI using pure Tailwind CSS and React DOM.

**Non-Goals:**
- Setting up a database (like SQLite or Postgres) or requiring a Prometheus instance to query historical data.
- Tracking metrics for resources that have been deleted and no longer exist in the cluster.
- Animating standard timeline ticks under high performance load; timeline calculations should be math-based and purely static during display.

## Decisions

### Decision 1: Render the Gantt Chart using Pure HTML and Tailwind CSS
- **Rationale**: Keeps the application bundle size tiny and avoids potential React 19 compatibility issues with heavy graphing libraries like Recharts or Chart.js. HTML layout combined with absolute/relative CSS allows for effortless styling of animated striped patterns, responsive widths, and standard glassmorphism Tooltips with rich DOM content.
- **Alternatives Considered**: 
  - *SVG Canvas*: Offers pixel-perfect precision but makes tooltip rendering and interactive events (like clicking a row to open the details drawer) significantly harder to program and maintain.
  - *Recharts/ApexCharts*: Introduces extra bundle weight and risks breaking under React 19 due to internal dependency deprecations.

### Decision 2: Calculate Averages Dynamically via Live-Scans
- **Rationale**: Since the app is stateless, we can compute the cluster-wide average time-to-ready for a given Kind by dynamically listing all active instances of that Kind in the cluster, checking their `.status.conditions[Ready].lastTransitionTime`, and calculating the arithmetic mean. This provides a highly accurate statistical benchmark without requiring a database.
- **Alternatives Considered**: 
  - *Local Average*: Calculating the average only across sibling resources in the same tree. This is a fallback but does not give a global cluster benchmark (e.g. "is 5 minutes for my RDS normal in this cluster?").

### Decision 3: Client-side In-Memory Caching for Telemetry Averages
- **Rationale**: A lightweight React-level cache with a 5-minute Time-To-Live (TTL) is sufficient to prevent flooding the Kubernetes API with listing requests when the user switches tabs, selects nodes, or triggers a manual graph refresh.
- **Alternatives Considered**:
  - *Server-side Caching*: Adding a cache layer in Go. While feasible, client-side caching is simpler, handles session restarts automatically, and fits the single-user local developer workflow.

## Risks / Trade-offs

- **[Risk] High API latency or load when listing hundreds of cluster resources for average calculation** → *Mitigation*: In the Go dynamic client, specify a limit on listing items (e.g., `Limit: 50` in `metav1.ListOptions`) and restrict the search scope namespace-wide first, only falling back to cluster-wide if needed.
- **[Risk] Resource kind has no other instances, resulting in a sample size of 1** → *Mitigation*: On the frontend, if the `sampleSize <= 1`, do not render the indigo benchmark marker, or render a subtle badge saying "First instance benchmark".
- **[Risk] Custom resources do not follow standard Crossplane `Ready` condition schemas** → *Mitigation*: Fall back gracefully by using `.status.conditions[Ready]` first, then `.status.conditions[Available]`, and if no condition is found, do not display the provisioning timeline for that specific resource (only show its age).
