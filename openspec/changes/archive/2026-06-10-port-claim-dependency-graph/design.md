## Context

The React 19 UI was migrated from Angular, but the Claim Details route `/explore/claims/:ref` was left as a placeholder ("Under React 19 Refactor"). The backend has existing endpoints supporting Claim Resource Tree fetching (`GET /crossplane/claims/:ref/tree`), Composition Revision fetching (`GET /crossplane/compositionrevisions/:name`), and Events fetching (`GET /events/:ref`), but these are not used by the frontend yet. We need a modern, fully typed React 19 rendering of this graph.

## Goals / Non-Goals

**Goals:**
- Build a modern React 19 interactive horizontal graph displaying the recursive resource dependency tree.
- Implement a hybrid logo/initials component (`ClaimNodeLogo`) with stable hash-based color palettes to make custom resources visually distinct.
- Build a sliding drawer inside the Claim Details view displaying Monaco YAML editors for the resource manifest and its composition template, along with live Kubernetes events.
- Provide a "Graph" redirect link with a Lucide tree/fork icon in the Claim explorer list.
- Use TanStack Query's built-in hooks to manage async states and automatic 15-second background updates.

**Non-Goals:**
- Implementing a canvas-based graph library (like React Flow), which would be over-engineered, heavy, and increase bundle size.
- Adding interactive resource editing or creation from this details page.

## Decisions

### Decision 1: Lightweight Recursive DOM Layout with CSS Connectors
Instead of introducing a heavy, canvas-based graphing package (e.g. React Flow), we will port the original Angular layout strategy. It renders nodes recursively as standard DOM elements and draws connection lines using custom CSS borders and margins (classes like `first`, `last`, `uniq`).
- **Rationale**: Keeps the application lightweight, fast-loading, highly responsive, and matches the original pixel-perfect visual design perfectly.

### Decision 2: Smart Hybrid Node Logo Component
If a node does not have a specific provider logo (like Kubernetes, GCP, AWS, Azure, Postgres, Mongo, Terraform), we will generate a circular badge with its uppercase initials (e.g., `CompositeMySQLInstance` -> `CMSI`) and select a deterministic color scheme based on a simple string hash of the resource `Kind`.
- **Rationale**: Eliminates visual clutter from displaying a repeating generic logo on custom/user-defined resources, making different resource types immediately distinguishable.

### Decision 3: Declarative Auto-Reload using TanStack Query
Instead of using manual `setInterval` in React effects (which can easily cause memory leaks or double-firing), we configure the `useClaim` and `useClaimTree` hooks with `refetchInterval: 15000`.
- **Rationale**: Fits perfectly with the project's existing asynchronous state management pattern and ensures safe, declarative, automatic UI updates.

## Risks / Trade-offs

- **[Risk] Deeply nested trees overflow the screen horizontally** → *Mitigation*: The main container of the graph SHALL be wrapped in `overflow-x-auto` and `overflow-y-auto` to allow seamless and responsive scrolling across wide graphs.
- **[Risk] Monaco Editor bundle size and loading performance** → *Mitigation*: We reuse the standard `@monaco-editor/react` library, which loads lazily on-demand only when the sliding drawer is visible, minimizing initial page load impact.
