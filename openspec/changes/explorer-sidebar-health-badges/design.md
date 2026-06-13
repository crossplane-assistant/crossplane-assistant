## Context

The Crossplane Assistant has a static navigation sidebar (`ExplorerLayout` in `ui/src/App.tsx`). Currently, the only way to observe the state of the cluster is to navigate to the Landing Dashboard or inspect individual resources. This design addresses how we can bring live health/ready status and item count metrics directly into the navigation sidebar as high-signal, cyberpunk-styled badges, and make them interactive so that clicking an unhealthy badge instantly opens a filtered view of the problem resources.

## Goals / Non-Goals

**Goals:**
- Feed live count and health status into the sidebar (`ExplorerLayout`) for Claims, XRDs, and Providers.
- Style the sidebar badges with a dark-theme "cyberpunk/kubernetes dashboard" theme (high-contrast, semi-transparent pastel colors on slate dark background).
- Support smooth skeleton-style loading indicators for badges during initial queries.
- Allow clicking on warning/critical badges to route to the resource's page with a `?status=unready` URL parameter.
- Implement URL parameter parsing inside `ResourceListView` to filter the table to show only non-ready items.
- Provide a clean filter alert banner inside the list view with a "Clear filter" option.

**Non-Goals:**
- Implement real-time WebSockets or server-sent events (the existing 5s polling configuration in React Query is highly sufficient and performant).
- Implement a full collapsible sidebar mechanism (this will be addressed in a future UX enhancement).
- Show health badges for resource types that do not have active Kubernetes reconcilers or status conditions in the API (Compositions, Functions, and Managed Resource Kinds will only show simple grey count badges).

## Decisions

### Decision 1: Shared Queries and Background Polling via React Query
- **Rationale**: We will invoke the existing query hooks (`useClaims`, `useXrds`, `useProviders`, etc.) directly inside `ExplorerLayout`. Because React Query automatically shares cache entries for identical query keys, there will be no extra network requests if the user is already viewing that list or the Dashboard. For other pages, React Query will run background polling every 5 seconds, ensuring the sidebar remains accurate.
- **Alternatives Considered**: Creating a global Zustand store or React Context. *Rejected* as it introduces redundant state management; React Query's built-in client is already the single source of truth.

### Decision 2: URL Query Parameters for Interactive Filter State (`?status=unready`)
- **Rationale**: By passing the filter intent through the URL path (e.g. `/explore/claims?status=unready`), we completely decouple the navigation sidebar from the list view. This also preserves browser history, allows bookmarked filtered views, and enables reload-resiliency.
- **Alternatives Considered**: Passing component props or using an action-callback system. *Rejected* because it does not support deep-linking or bookmarking, and requires unnecessary state-lifting.

### Decision 3: Unified Kubernetes Resource Health Helper
- **Rationale**: We will implement a reusable helper function to evaluate resource health based on standard Kubernetes status conditions:
  - Claims are healthy if condition `Ready` is `True`.
  - XRDs are healthy if condition `Established` is `True`.
  - Providers are healthy if condition `Healthy` is `True`.
  - For any other resource, it is healthy if it has status conditions and all standard status conditions present match `status: "True"`.
  This allows us to maintain a generic implementation in `ResourceListView` while supporting custom condition types.

## Risks / Trade-offs

- **[Risk]** Excessive background network traffic when the browser window is inactive.
  - **Mitigation**: The React Query Client is configured with `refetchOnWindowFocus: false` and stops polling when the window is out of focus, minimizing resource drain.
- **[Risk]** Layout shifting as counts load.
  - **Mitigation**: We will render a fixed-width loading pulse skeleton (e.g. `w-8 h-5 bg-slate-800 animate-pulse rounded-full`) so the space is reserved before the data arrives.
