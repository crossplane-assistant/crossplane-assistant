## Why

The React 19 UI is currently missing the critical interactive dependency tree/graph view for Claim objects, which displays how Claims dynamically resolve into multiple Composed and Managed Resources inside the cluster. Users need this view to visualize and troubleshoot resources in real-time, restoring parity with the original Angular application.

## What Changes

- Add a "Graph" column in the Claim list view (`ListClaims.tsx`) containing a link with a tree/fork icon to navigate to each claim's visual graph.
- Port and replace the `/explore/claims/:ref` placeholder view with a fully functional `ClaimDetailsView` component.
- Implement `ClaimGraph` and `ClaimGraphNode` React components to render the claim resource tree recursively as a modern horizontal graph.
- Implement `ClaimNodeLogo` to provide smart logo/initials visual identity with stable color hashing for nodes.
- Implement an interactive sliding drawer inside the claim details view to inspect any selected graph node's filtered `Manifest`, its dclared composition `Template` (from its Composition Revision), and Kubernetes `Events` fetched in real-time.

## Capabilities

### New Capabilities
- `claim-dependency-graph`: Interactive horizontal tree-graph rendering claim-resolved resources, including the sliding drawer (Manifest, Template, Events tabs), automatic reload every 15 seconds, and logo visual mapping.

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation). -->

## Impact

- **Frontend Routes (`ui/src/App.tsx`)**: Replace `PlaceholderView` with `ClaimDetailsView` for `/explore/claims/:ref`.
- **Claim Explorer (`ui/src/components/ListClaims.tsx`)**: Append a "Graph" column in columns definition.
- **Queries (`ui/src/queries/`)**:
  - Add `useClaim` and `useClaimTree` in `useClaimQueries.ts`.
  - Add `useCompositionRevision` in `useCompositionQueries.ts`.
  - Add `useEvents` for Kubernetes events retrieval.
- **Types (`ui/src/types.ts`)**: Export `decodeRef(ref: string): Ref` and typings for `ClaimTreeNode`.
