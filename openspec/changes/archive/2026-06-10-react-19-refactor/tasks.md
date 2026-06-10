## 1. Project Initialization & Tooling

- [x] 1.1 Clean the `ui/` directory: remove all Angular files (`.ts`, `.html`, `.scss`, `angular.json`, etc.) but keep structural files like `package.json` (to be overwritten) and `README.md`.
- [x] 1.2 Initialize Vite + React 19 project structure within `ui/` (create `vite.config.ts`, `tsconfig.json`, `index.html` at root).
- [x] 1.3 Update `ui/package.json` with React 19, Radix UI, Tailwind CSS, TanStack Query, and Monaco Editor dependencies, and Vite scripts.
- [x] 1.4 Configure Tailwind CSS (`tailwind.config.js` and `postcss.config.js`).
- [x] 1.5 Configure `vite.config.ts` to output to `dist/crossplane-assistant-ui` and setup path aliases.
- [x] 1.6 Configure Vite development proxy in `vite.config.ts` to redirect `/crossplane` and `/events` to `http://localhost:8080`.

## 2. Shared Utilities & State

- [x] 2.1 Create shared TypeScript definitions (`src/types.ts`) for `ResourceContext`, `ResourcesGraph`, etc.
- [x] 2.2 Setup TanStack Query provider and query hooks (`src/app/queries/useCompositionQueries.ts`).
- [x] 2.3 Create the layout shell and React Router setup (`src/app/App.tsx`).

## 3. Core UI Components (Radix + Tailwind)

- [x] 3.1 Implement `ResourcePanel` using Radix Collapsible.
- [x] 3.2 Implement `ResourceDependencyViewer` UI layout (adapting the SCSS logic to Tailwind).
- [x] 3.3 Implement `LogoViewer` component to dynamically load icons from `public/assets/logo/`.

## 4. Resource Viewers implementation

- [x] 4.1 Implement `KubernetesResourceViewer` using Radix Tabs and `@monaco-editor/react`.
- [x] 4.2 Implement `TerraformResourceViewer` using Radix Tabs and `@monaco-editor/react`.
- [x] 4.3 Implement `GenericResourceViewer` for unhandled types.
- [x] 4.4 Implement `DynamicResourceViewer` to declaratively dispatch based on `apiVersion` and `kind`.

## 5. Integration & Refinement

- [x] 5.1 Implement the main `CompositionViewer` component that ties together the query hooks and the `DynamicResourceViewer`.
- [x] 5.2 Validate that the frontend builds correctly via `npm run build` and output matches the expected Go embedded filesystem path.
- [x] 5.3 Update `build/front/Dockerfile` to use Vite build command if necessary.
