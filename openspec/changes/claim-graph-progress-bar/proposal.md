## Why

During the provisioning of a complex Crossplane Claim, multiple resources (the Composite Resource and its nested Managed Resources) are created and reconciled in stages. Currently, users have to manually inspect each individual node in the dependency graph to determine if it is Ready, making it difficult to quickly gauge the overall progress of the provisioning process.

## What Changes

- Add a high-visibility, visually modern provisioning progress bar component at the top of the Claim Graph view.
- Traverses the entire claim dependency tree to compute the number of ready resources versus the total number of resources in the graph.
- Calculates and displays the overall completion percentage (`readyNodes / totalNodes * 100`).
- Dynamically highlights the progress bar using emerald gradient styling when 100% (fully provisioned) is reached, and a blue/indigo gradient during active provisioning.

## Capabilities

### New Capabilities

<!-- None -->

### Modified Capabilities

- `claim-dependency-graph`: Add a "Provisioning Progress Bar" requirement to the claim details graph tab to show overall provisioning completion percentage of the resolved resource tree.

## Impact

- **Frontend Components**:
  - `ui/src/components/ClaimGraph.tsx`: Modified to compute tree progress stats and render the new progress bar UI block.
- **Testing**:
  - `ui/tests/claim-progress.test.ts` or addition to existing tests to verify the recursive progress calculation logic.
