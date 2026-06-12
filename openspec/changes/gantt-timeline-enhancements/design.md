## Context

While our newly implemented Gantt chart timeline provides a clear chronological sequence of Claim provisioning, developers still need deeper, actionable context to troubleshoot provisioning issues.

This document describes the technical design for introducing segment breakdowns (Synced vs. Ready), live Kubernetes event overlays (Event Pins), and interactive relationship highlights, while providing defensive guards against common cluster/local synchronization frictions.

## Goals / Non-Goals

**Goals:**
- Separate active provisioning into a Synced segment and a Ready segment.
- Overlay live Kubernetes events (especially warnings) as interactive pins on each timeline bar.
- Highlight parent-child dependency connections instantly on row hover using simple CSS classes.
- Safeguard calculations against clock-skew anomalies, condition flapping, and high-event densities.

**Non-Goals:**
- Constructing absolute-positioned SVG bezier lines connecting different rows (ruled out due to scrolling layout thrashing and CPU performance issues).
- Setting up persistent database logs or external event streaming.

## Decisions

### Decision 1: Split Active Provisioning into Synced vs. Ready Segments
- **Rationale**: We can read `.status.conditions` for both type `Synced` and type `Ready` on the node. The time elapsed between creation and `Synced=True` is rendered as an orange/indigo block. The time between `Synced=True` and `Ready=True` is rendered as an emerald/teal block. This instantly reveals if provisioning lag is due to Crossplane config syncing or cloud provider execution.
- **Alternatives Considered**: 
  - *Separate Rows*: Rendering separate lines for Synced and Ready. This doubles the vertical height, clutters the screen, and makes it hard to get a unified overview.

### Decision 2: Render Live Event Pins on the Timeline Bar
- **Rationale**: By loading Kubernetes events for the tree, we can map their event timestamps onto the timeline bar using the same math percent scale. This allows overlaying visual dots (Normal/indigo, Warning/red) directly on the bar. Hovering over a dot displays a glassmorphism card detailing the warning reason and message, making errors instantly contextual.
- **Alternatives Considered**: 
  - *Forcing users to read logs in the slide drawer*: This keeps the timeline clean but misses the opportunity to correlate errors with the precise moments they occurred.

### Decision 3: CSS-Based Dependency Highlighting on Hover
- **Rationale**: Instead of drawing heavy SVG connector lines (which break on scroll and require complex pixel calculations), we can maintain a simple `hoveredNodeId` state on the parent timeline component. Each row checks if its resource is a parent or a child of the hovered node (which can be derived from the ClaimTree structure). If so, it applies a subtle, stylish indigo border/background. This is 100% responsive, high-performance, and extremely clean.
- **Alternatives Considered**:
  - *SVG Lines*: Heavy, complex, and prone to layout misalignment during scroll and resize.

## Risks / Trade-offs

- **[Risk] Clock skew between local machine and Kubernetes API server** → *Mitigation*: Clamp all offset and duration calculations using `Math.max(0, val)`.
- **[Risk] Missing conditions on non-standard resources** → *Mitigation*: Fall back gracefully. If `Synced` or `Ready` is missing, render active provisioning as a single, unsegmented block based on what conditions are present.
- **[Risk] Event pin clutter in high-density logs** → *Mitigation*: Consolidate multiple events occurring within the same 5-second interval into a single visual pin with a badge displaying the event count.
