## Context

During initial setup of the React 19 user interface, stable React 19 was not yet released or was in its Release Candidate (RC) stage. As a result, older UI dependencies (such as `lucide-react` at version `0.395.0`) only declared support for React versions up to `^18.0.0` in their `peerDependencies`. 

Because npm 7+ strictly enforces peer dependencies by default, trying to run a standard `npm install` fails with `ERESOLVE` errors. Developers were forced to bypass these checks by using `npm install --legacy-peer-deps`. 

Now that React 19 is fully stable and the library ecosystem has caught up, we can perform a clean, standard upgrade to eliminate this workaround.

## Goals / Non-Goals

**Goals:**
- Transition the `ui` project's dependencies to stable, officially supported versions of React 19 and its matching type declarations.
- Upgrade `lucide-react` to a modern version (e.g. `^1.18.0`) that natively supports React 19 in its `peerDependencies`.
- Eradicate the use of `--legacy-peer-deps` or `--force` during installation.
- Verify that the frontend continues to build and compile cleanly.
- Ensure all existing unit tests in `ui/tests/` execute and pass without regressions.

**Non-Goals:**
- Redesigning components or altering UI layouts.
- Unnecessarily upgrading other secondary packages (e.g., Vite, Tailwind) unless they present hard blocking conflicts during standard resolution.

## Decisions

### Decision 1: Option A (Global Upgrade) over Option B (Overrides)
- **Rationale**: While an `overrides` block is a highly effective way of forcing compatibility for abandoned or locked libraries, standard libraries like `lucide-react` are fully active and have released native, tested support for React 19. Upgrading globally ensures we get the latest performance optimizations, bug fixes, and security updates directly from the library authors without relying on hacky overrides.
- **Alternatives Considered**: Using npm `overrides` to force React 19 on `lucide-react` version `0.395.0`. *Rejected* because upgrading is cleaner, reduces tech debt, and represents the true industry standard.

### Decision 2: Surgical Lucide-react Icon Audit
- **Rationale**: Upgrading `lucide-react` across major versions could potentially introduce icon name changes or deprecations. We will let the TypeScript compiler (`tsc`) act as our auditing agent. If any import fails due to a renamed or removed icon, we will identify and surgically rename the component import to its new equivalent.

## Risks / Trade-offs

- **[Risk]** Potential Lucide Icon Name Deprecations.
  - **Mitigation**: Run `npm run build` (which executes `tsc`) immediately after installation. Since Lucide icons are fully typed, any missing icons will be flagged immediately as compilation errors, allowing us to fix them instantly.
- **[Risk]** Type differences in `@types/react` between RC and Stable.
  - **Mitigation**: Match stable React version exactly with matching `@types/react` and `@types/react-dom` versions (e.g. `^19.0.0`).
