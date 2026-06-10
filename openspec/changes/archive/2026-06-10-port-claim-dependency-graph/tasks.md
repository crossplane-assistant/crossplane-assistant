## 1. Foundation and Types

- [x] 1.1 Implement `decodeRef(ref: string): Ref` and typings for `ClaimTreeNode` / `ClaimTree` in `ui/src/types.ts`.
- [x] 1.2 Implement `useClaim(ref: Ref)` and `useClaimTree(ref: Ref)` queries with a 15-second background reload in `ui/src/queries/useClaimQueries.ts`.
- [x] 1.3 Implement the `useCompositionRevision(name: string)` query in `ui/src/queries/useCompositionQueries.ts`.
- [x] 1.4 Implement the `useEvents(ref: Ref)` query to retrieve Kubernetes events from the `/events/:ref` API.

## 2. Graphe and Logo Components

- [x] 2.1 Implement the `ClaimNodeLogo` component in `ui/src/components/ClaimNodeLogo.tsx` with provider logos, uppercase initials fallback, and deterministic kind-based color hashing.
- [x] 2.2 Append the custom CSS tree connectors (`.graph-wrapper`, `.connector`, `.first`, `.last`, `.uniq`) to `ui/src/index.css`.
- [x] 2.3 Implement the recursive `ClaimGraphNode` component in `ui/src/components/ClaimGraphNode.tsx`.
- [x] 2.4 Implement the `ClaimGraph` parent component in `ui/src/components/ClaimGraph.tsx` with reload timestamp tracking.

## 3. Sliding Inspection Drawer

- [x] 3.1 Implement a simple list-based event renderer component `ClaimEventsList` (or inline) to show events clearly.
- [x] 3.2 Implement the interactive sliding drawer in the Claim Details page using Radix UI Tabs with Manifest, Template, and Event panels.

## 4. Integration and Routing

- [x] 4.1 Add a "Graph" column with a fork/tree icon to `ui/src/components/ListClaims.tsx` using `encodeRef` and standard link navigation.
- [x] 4.2 Replace the `PlaceholderView` with the fully realized `ClaimDetailsView` in `ui/src/App.tsx`.

## 5. Verification

- [x] 5.1 Verify TypeScript compiling, build, and formatting by running `npm run build` inside the `ui` directory.
- [x] 5.2 Validate rendering and CSS connections on multiple levels of resource nesting.
