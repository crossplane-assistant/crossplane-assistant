## Why

The `ui/` frontend has `vitest` as a devDependency and 10 files under `tests/`, but the suite was never actually wired up: there is no `vitest` config (no jsdom environment, no globals/imports standard), no `test` script in `package.json`, and no CI gate. Running the suite as-is shows 6 of 10 test files fail or report zero tests — two are missing `vitest` imports, two are "manual harness" functions that assert with `throw` but are never invoked by anything, and one is entirely commented out. Only pure utility functions are covered; none of the 33 React components have a test, and no component-testing tooling (`@testing-library/react`, jsdom) is installed. As the frontend grows, this leaves regressions in core flows (e.g. the composition canvas, managed resource lists) undetected until manual QA or production. Backend (Go) testing is explicitly out of scope for this change and will be addressed separately.

## What Changes

- Add proper `vitest` configuration: jsdom test environment, a `test` script in `package.json`, and `tests/` included in `tsconfig.json` so test files are type-checked.
- Install component-testing tooling: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, and `jsdom`.
- Standardize on explicit `vitest` imports (`import { describe, test, expect } from 'vitest'`) across all test files; do not enable `globals: true`.
- Fix the 6 currently-broken test files:
  - `ecosystem-catalog.test.ts`, `compositionParser.test.ts`: add the missing `vitest` imports.
  - `health.test.ts`, `reconciliation-gantt-timeline.test.ts`: rewrite the existing manual `run*Tests()` harnesses into real `describe`/`test`/`expect` blocks, preserving the existing assertions and logic.
  - `field-filter.test.ts`: rewrite as a real test file (the commented-out placeholder content is dropped).
- Add new component tests:
  - `ListManagedResources`: render test with the underlying react-query hook mocked.
  - `CompositionCanvas`: unit tests for the custom node components (e.g. `CompositeInputNode`) in isolation (no `@xyflow/react` involved), plus a smoke test rendering the full canvas with real `@xyflow/react` and the minimal jsdom polyfills it requires (`ResizeObserver`, `getBoundingClientRect`).
  - `CompositionWorkspace`: rendered with `MemoryRouter`, a `QueryClientProvider`, and `@monaco-editor/react` mocked.
- Add a new CI workflow, `.github/workflows/frontend-tests.yml`, running `npm ci && npm test` on push/PR touching `ui/**`.

## Capabilities

### New Capabilities
- `frontend-test-infrastructure`: the testing tooling, conventions, and CI gate for the `ui/` React frontend — test runner configuration, the explicit-import convention, and the automated CI check that runs the suite on relevant changes.

### Modified Capabilities
(none — this change adds tooling and test coverage; it does not change the requirements or behavior of any existing product capability)

## Impact

- `ui/package.json`: new `test` script, new devDependencies (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`).
- `ui/vite.config.ts` (or a new `ui/vitest.config.ts`): jsdom environment, test setup file.
- `ui/tsconfig.json`: `include` extended to cover `tests/`.
- `ui/tests/*.test.ts`: 6 files fixed/rewritten; new test files added for `ListManagedResources` and `CompositionCanvas`.
- `ui/src/components/CompositionWorkspace.tsx` and related: new test file, no source changes expected.
- `.github/workflows/frontend-tests.yml`: new CI workflow.
- No backend (Go) files are affected.
