## Context

The Crossplane Assistant currently features an Angular frontend with custom RxJS logic and a significant amount of boilerplate for dynamically rendering different types of resources in the Composition Viewer. The goal is to modernize this stack to improve maintainability, reduce CSS overhead, and leverage more declarative data-fetching and component models. 

## Goals / Non-Goals

**Goals:**
- Completely replace Angular with React 19 as the view library.
- Use Vite as the build tool to replace `angular.json` and Webpack, improving build times.
- Use Radix UI primitives for complex UI components (tabs, accordions/collapsibles, dialogs) to ensure accessibility without managing complex CSS states.
- Use Tailwind CSS for styling, removing the need for custom SCSS files per component.
- Use TanStack Query (React Query) to replace RxJS-based services for data fetching.
- Maintain compatibility with the Go backend embedded file serving (`static.go`) by outputting the Vite build to `dist/crossplane-assistant-ui`.

**Non-Goals:**
- Adding new features to the application (this is strictly a refactor).
- Changing backend Go APIs or routes.
- Changing the `docs/` or `charts/`.

## Decisions

- **React 19 vs Angular**: Selected React 19 for its simpler functional component model and the explicit decision to move away from Angular's DI and RxJS complexity for this specific application.
- **Vite over Create React App / Next.js**: Selected Vite for rapid build times. We do not need SSR or complex server setups (Next.js), as the Go binary serves the SPA and handles the backend.
- **Radix UI + Tailwind CSS**: Selected over component libraries like Material-UI or Ant Design to maintain full control over styling (via Tailwind) while getting robust accessibility for complex interactive components out of the box (via Radix).
- **TanStack Query vs Zustand/Redux**: Since most state is "Server State" (e.g., compositions, dependencies), React Query is the optimal tool for fetching, caching, and updating this data declaratively without writing a custom store.
- **`@monaco-editor/react`**: Chosen to replace `ngx-monaco-editor-v2` because it handles Monaco Web Workers dynamically from a CDN (or locally if configured), simplifying Vite integration.
- **Vite Development Server Proxy (Option A)**: Configured Vite's `server.proxy` to automatically forward requests starting with `/crossplane` and `/events` to `http://localhost:8080` (Go API) during local development. This ensures that frontend relative API calls resolve to the correct backend without polluting the code with origin logic or hardcoded variables.

## Risks / Trade-offs

- [Risk] **Vite Build Output Path Mismatch**: The Go backend `static.go` strictly expects `ui/dist/crossplane-assistant-ui`. 
  - *Mitigation*: Configure Vite's `build.outDir` to `dist/crossplane-assistant-ui` explicitly.
- [Risk] **Development API Calls Black Hole**: Without proxy routing, calls to `/crossplane/...` hit the Vite server directly, resulting in index.html being served instead of querying the Go API.
  - *Mitigation*: Enable `server.proxy` for `/crossplane` and `/events` in `vite.config.ts`.
- [Risk] **SPA Routing Fallback**: The React Router requires the server to serve `index.html` for unknown routes.
  - *Mitigation*: The Go backend already implements SPA fallback routing via the `spa-fallback-routing` spec, returning `index.html` appropriately. We just need to ensure `<base href="/">` and absolute paths for assets in Vite.
- [Risk] **Loss of typing strictly enforced by Angular**: Angular enforces heavy class structures.
  - *Mitigation*: Use strict TypeScript configurations in Vite and define clear `types.ts` for contexts like `ResourceContext` and `ResourcesGraph`.
