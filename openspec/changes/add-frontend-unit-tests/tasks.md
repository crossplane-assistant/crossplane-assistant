## 1. Test infrastructure

- [x] 1.1 Add `vitest` test config (jsdom environment, setup file) either in `ui/vite.config.ts`'s `test` block or a new `ui/vitest.config.ts`, and verify `npx vitest --version` and a trivial `expect(true).toBe(true)` test run and pass
- [x] 1.2 Add a `test` script to `ui/package.json` (e.g. `vitest run`) and verify `npm test` from `ui/` runs the suite and exits 0 when all tests pass
- [x] 1.3 Install `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, and `jsdom` as devDependencies and verify they resolve (`npm ls <pkg>` for each)
- [x] 1.4 Add `tests` to `ui/tsconfig.json`'s `include` and verify `tsc --noEmit` type-checks the `tests/` directory without new unrelated errors

## 2. Fix existing broken tests

- [x] 2.1 Add the missing `import { describe, test, expect } from 'vitest'` to `ecosystem-catalog.test.ts` and `compositionParser.test.ts` (also found and fixed the same missing import in `package.test.ts`), and verify all three files run and pass under `npm test`
- [x] 2.2 Rewrite `health.test.ts`: convert the `runHealthTests()` `if/throw` checks into `describe`/`test`/`expect` blocks with one-to-one equivalent assertions, and verify all converted cases pass under `npm test`
- [x] 2.3 Rewrite `reconciliation-gantt-timeline.test.ts`: convert the `runMathTests()` `if/throw` checks into `describe`/`test`/`expect` blocks with one-to-one equivalent assertions, and verify all converted cases pass under `npm test`
- [x] 2.4 No corresponding `field-filter` logic exists anywhere in `src/` (confirmed via search + git history); per user decision, deleted `field-filter.test.ts` instead of inventing coverage for non-existent behavior
- [x] 2.5 Run the full suite (`npm test`) and verify all existing test files (9, after deleting `field-filter.test.ts`) pass with zero failures and zero "no test suite found" files

## 3. Component tests: ListManagedResources

- [x] 3.1 Add a test for `ListManagedResources` that mocks the relevant hook in `src/queries/useManagedResourceQueries.ts` and renders the component with `@testing-library/react`, verifying each mocked resource appears in the rendered output

## 4. Component tests: CompositionCanvas

- [x] 4.1 Add isolated tests for the custom node components in `CompositionCanvas.tsx` (e.g. `CompositeInputNode`), rendering them directly with `@testing-library/react`, and verify the rendered output reflects the given `data` prop (exported the 3 previously-unexported node components; each uses xyflow's `<Handle>` internally, which needs a `ReactFlowProvider` store even in isolation, so tests wrap with a bare `ReactFlowProvider` — no full `<ReactFlow>` canvas involved). Also added global `afterEach(cleanup)` in the test setup file, needed once component tests exist since RTL's auto-cleanup doesn't trigger without `globals: true`.
- [x] 4.2 Add jsdom polyfills required by `@xyflow/react` (`ResizeObserver`, `Element.prototype.getBoundingClientRect`) in the test setup file
- [x] 4.3 Add a smoke test rendering `CompositionCanvas` wrapped in `<ReactFlowProvider>` with sample nodes/edges, and verify it mounts without throwing and the expected node content is present

## 5. Component tests: CompositionWorkspace

- [x] 5.1 Add a mock for `@monaco-editor/react` in the test setup (or per-test `vi.mock`), and verify it satisfies `CompositionWorkspace`'s import without invoking a real editor
- [x] 5.2 Add a test rendering `CompositionWorkspace` wrapped in `MemoryRouter` and a `QueryClientProvider` (fresh `QueryClient`), with `useComposition`, `useCompositionDependencies`, and `useClaims` mocked, and verify it mounts without throwing and without issuing a real network request

## 6. CI

- [x] 6.1 Add `.github/workflows/frontend-tests.yml` triggered on push/PR with a path filter on `ui/**`, running `npm ci` and `npm test` inside `ui/`, and verify the workflow YAML is valid (`actionlint` unavailable; verified via `act -l` dry-run listing the job correctly)

## 7. Final verification

- [x] 7.1 Run `npm test` from `ui/` one final time and verify the full suite (existing + new tests) passes with zero failures
- [x] 7.2 Confirm no backend (Go) files were modified as part of this change (`git status` / `git diff --stat` shows only `ui/` and `.github/workflows/` changes)
