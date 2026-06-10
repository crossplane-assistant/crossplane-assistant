## Purpose

This capability defines the React-based frontend architecture and component rendering model for the Crossplane Assistant user interface, transitioning from Angular/RxJS to React 19, Vite, and TanStack Query.

## Requirements

### Requirement: React 19 Frontend Architecture
The system SHALL serve a React 19 single-page application built with Vite, styled with Tailwind CSS, and using Radix UI primitives.

#### Scenario: Application Bootstrapping
- **WHEN** the user navigates to the root URL `/`
- **THEN** the Vite-built React application is served and bootstrapped in the browser.

### Requirement: Declarative Component Rendering
The system SHALL dynamically render resource viewers (Kubernetes, Terraform) using declarative React component mapping rather than imperative view container injection.

#### Scenario: Dynamic Resource Viewer Dispatch
- **WHEN** the `DynamicResourceViewer` receives a Kubernetes resource context
- **THEN** it declaratively renders the `KubernetesResourceViewer` component.

### Requirement: TanStack Query Data Fetching
The system SHALL fetch and cache API data (like Composition dependencies) using TanStack Query.

#### Scenario: Fetching Composition Dependencies
- **WHEN** the Composition Viewer loads
- **THEN** it uses a TanStack Query hook (e.g., `useCompositionDependencies`) to asynchronously fetch the graph data and handle loading/error states without RxJS observables.

### Requirement: Compatible Build Output
The build process SHALL output the static assets to the exact directory path expected by the Go backend's embedded filesystem configuration.

#### Scenario: Vite Build Process
- **WHEN** the `npm run build` command is executed in the `ui/` directory
- **THEN** the output files are placed in `ui/dist/crossplane-assistant-ui/` with an `index.html` at the root of that directory.
