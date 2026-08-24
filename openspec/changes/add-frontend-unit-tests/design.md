## Context

`ui/` is a React 19 + TypeScript + Vite app. `vitest` is already a devDependency but has no config, no `test` script, and no jsdom environment. Of the 10 existing files under `tests/`, 4 pass today (they already import `describe`/`test`/`expect` from `vitest` explicitly), 2 fail from a missing `vitest` import, 2 define `run*Tests()` functions that assert via `throw` but are never called by anything (so vitest reports "no test suite found"), and 1 (`field-filter.test.ts`) is entirely commented out. No component-testing library is installed, and no CI workflow runs any test today — the only existing workflow is `release-please.yml` for versioning. Backend (Go) testing is out of scope; the pre-commit `go-unit-tests` hook is untouched.

See `proposal.md` for motivation and `specs/frontend-test-infrastructure/spec.md` for the resulting requirements.

## Goals / Non-Goals

**Goals:**
- Make the existing test suite fully runnable and green via a single `npm test` command.
- Establish one consistent test-authoring convention going forward.
- Add first component-rendering coverage for the two highest-risk, highest-complexity views.
- Gate merges on the suite passing via CI.

**Non-Goals:**
- Exhaustive component coverage across all 33 components in `src/components/` — only `ListManagedResources`, `CompositionCanvas`, and `CompositionWorkspace` are covered in this change.
- Interaction/e2e testing of drag-and-drop, pan, or zoom inside the composition canvas — this would require a real browser (Playwright/Cypress) and is not part of the unit-test scope.
- Any change to backend (Go) tests or CI.

## Decisions

### Explicit `vitest` imports, no `globals: true`
Standardize every test file on `import { describe, test, expect, vi } from 'vitest'` rather than enabling `test.globals: true` in the vitest config.
- **Alternative considered**: `globals: true` + a `vitest/globals` type reference in `tsconfig.json`. Rejected because 4 of the 5 currently-working test files already use explicit imports, and explicit imports don't require augmenting global types, keeping `tsconfig.json` unchanged for this purpose.

### jsdom as the test environment
Use `jsdom` (not `happy-dom`) as the vitest `environment`, since it's the more widely-supported option for React Testing Library and is the one most examples/docs for `@xyflow/react` testing assume.

### Rewrite the two "manual harness" files instead of deleting them
`health.test.ts` and `reconciliation-gantt-timeline.test.ts` contain correct, already-written assertions (checked manually by reading them) — only the wiring is wrong (`throw`-based assertions in a function that's never invoked). Convert the existing `if (...) throw new Error(...)` checks into equivalent `expect(...).toBe(...)` calls inside `describe`/`test` blocks, preserving the test cases as-is rather than redesigning them.

### `field-filter.test.ts` is rewritten, not deleted
Its current content is fully commented out (dead). Per user decision, this file is rewritten as a real test rather than removed — implementers should look at what `field-filter` utility/logic it was presumably meant to cover (name suggests filtering fields) and write a genuine test for it, or, if no corresponding source logic exists, treat this as a signal to ask before inventing behavior to test.

### `CompositionCanvas` / `@xyflow/react`: hybrid testing approach
`CompositionCanvas.tsx` renders `<ReactFlow>` directly and defines custom node components (e.g. `CompositeInputNode`) that take a plain `data` prop and use no xyflow hooks themselves.
- Test the custom node components in isolation via `@testing-library/react`, with no `@xyflow/react` involved at all — they're plain components.
- Add one smoke test that renders `CompositionCanvas` with the real `@xyflow/react`, wrapped in `<ReactFlowProvider>`, with the minimal jsdom polyfills `@xyflow/react` needs to mount (`ResizeObserver`, `Element.prototype.getBoundingClientRect`). This verifies wiring/mounting, not interaction.
- **Alternatives considered**:
  - Mocking `@xyflow/react` entirely (`vi.mock`) — rejected as the sole approach because it would give zero signal on whether the real library integration still works; kept as a fallback only if the real-library smoke test proves too brittle during implementation.
  - Full interaction testing (drag/connect) via real `@xyflow/react` — rejected, out of scope for unit tests (see Non-Goals); revisit with Playwright/Cypress if needed later.

### `CompositionWorkspace`: full harness, no shortcuts
`CompositionWorkspace.tsx` pulls in `react-router` (`useParams`/`useSearchParams`), 3 `react-query` hooks, and `@monaco-editor/react`, independent of the xyflow question. Render it wrapped in `MemoryRouter` and a `QueryClientProvider` with a fresh `QueryClient`, and mock `@monaco-editor/react` (it does not run meaningfully in jsdom). Assert it mounts without throwing and without issuing a real network request, using mocked query hook return values — this is a smoke/regression test, not exhaustive coverage of the component's many tabs and states.

### `ListManagedResources`: mock the react-query hook, not the network layer
Mock the specific hook from `src/queries/useManagedResourceQueries.ts` that the component calls (via `vi.mock`), returning canned resource data, rather than mocking `fetch`/`axios` underneath react-query. This keeps the test focused on rendering behavior and decoupled from the query layer's internals.

## Risks / Trade-offs

- **`@xyflow/react` version upgrades could break the smoke test's polyfill assumptions** → keep the smoke test minimal (mount + basic node/edge presence) so it has the smallest possible surface exposed to upstream changes.
- **`@monaco-editor/react` mock could drift from real editor behavior** → the mock only needs to satisfy `CompositionWorkspace`'s smoke test (mount without throwing); it is not meant to validate editor behavior itself.
- **Rewriting `health.test.ts` / `reconciliation-gantt-timeline.test.ts` could silently change what's being asserted** → implementers should diff the converted assertions against the original `if/throw` conditions one-to-one rather than rewriting test intent from scratch.
