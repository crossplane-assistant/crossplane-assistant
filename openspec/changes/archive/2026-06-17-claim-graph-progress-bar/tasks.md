## 1. Core Calculation Logic

- [x] 1.1 Implement the `getProgressStats` recursive helper function to count total resources and ready resources (with status 'Ready' equal to 'True') from the claim tree root.
- [x] 1.2 Create a new unit test file `ui/tests/claim-progress.test.ts` containing comprehensive test scenarios for different tree topologies and status condition mixes to mathematically validate the progress calculation.

## 2. UI Component Rendering

- [x] 2.1 Import the `Activity` icon from `lucide-react` (if not already present) in `ui/src/components/ClaimGraph.tsx`.
- [x] 2.2 Add the modern, gradient-filled progress bar component with responsive sizing and transition animations to `ClaimGraph.tsx` above the actions bar.
- [x] 2.3 Verify the visual presentation of the progress bar for active provisioning (blue gradient) versus complete provisioning (emerald gradient) in the browser/dev environment and run existing frontend tests to ensure no regressions.
