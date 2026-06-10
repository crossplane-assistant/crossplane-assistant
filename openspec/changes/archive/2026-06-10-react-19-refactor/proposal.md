## Why

The current Angular frontend (`ui/`) is complex to maintain, with heavy RxJS usage and a large amount of boilerplate for component dispatching (e.g., `DynamicResourceViewer`). Migrating to React 19 with Vite, Radix UI, and Tailwind CSS will drastically simplify the codebase, improve developer experience (DX), and provide better performance through a more declarative component model and modern data fetching (TanStack Query).

## What Changes

- Complete rewrite of the frontend application in `ui/` from Angular to React 19.
- Replacement of `angular.json` and Webpack with Vite.
- Replacement of custom CSS and Angular Material (if any) with Tailwind CSS and Radix UI primitives.
- Transition from RxJS-based services to TanStack Query for data fetching.
- Integration of `@monaco-editor/react` for the YAML/Kubernetes manifests editor.
- **BREAKING**: The frontend build process and directory structure will be entirely different.

## Capabilities

### New Capabilities
- `react-ui-refactor`: Complete rewrite of the Crossplane Assistant frontend using React 19, Radix UI, and Tailwind CSS.

### Modified Capabilities
<!-- None. The behavioral requirements of the application remain the same, only the implementation stack changes. -->

## Impact

- `ui/` directory: All Angular files (`.ts`, `.html`, `.scss`, `.spec.ts`) will be removed and replaced by React functional components (`.tsx`).
- `build/front/Dockerfile` and `ui/package.json`: Need to be updated to use Vite.
- `vite.config.ts`: Must be configured to output build artifacts to `dist/crossplane-assistant-ui` to maintain compatibility with the Go backend embedded file serving (`static.go`).
