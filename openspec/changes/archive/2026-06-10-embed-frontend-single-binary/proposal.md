## Why

Currently the application requires two separate deployments: an nginx container serving the Angular frontend and a Go API container. This complicates distribution, increases deployment complexity, and creates operational overhead. Consolidating to a single binary simplifies deployment for both Kubernetes and local/VM environments, reduces the attack surface, and provides a single artifact for versioning and distribution.

## What Changes

- Embed Angular build output into Go binary using `embed.FS`
- Modify API server to serve static assets from embedded filesystem with SPA fallback routing
- Remove nginx dependency and CORS middleware (no longer needed for same-origin requests)
- Add configurable port binding via environment variable
- Create unified build process with single `make all` command
- Maintain dual artifact strategy: standalone binary for local/VM + container image for K8s
- Keep separate development workflow (Angular dev server + Go API) unchanged

## Capabilities

### New Capabilities

- `embedded-static-serving`: Binary serves Angular frontend assets from embedded filesystem, eliminating need for separate web server
- `unified-binary-deployment`: Single self-contained binary artifact deployable to both Kubernetes and local/VM environments
- `spa-fallback-routing`: Server handles Angular client-side routing by serving index.html for non-API routes

### Modified Capabilities

<!-- No existing capabilities being modified -->

## Impact

**Code Changes:**
- `cmd/api/` - Add static.go with embed directives
- `internal/server/server.go` - Remove CORS, add static file serving with SPA fallback, add port configuration
- `Makefile` - Consolidate build targets into unified flow
- `build/unified/Dockerfile` - New minimal container with embedded binary

**Dependencies:**
- Remove nginx and related configuration
- Angular build becomes embedded build-time dependency (not runtime)

**APIs:**
- No API contract changes
- Same `/crossplane/*` and `/events/*` endpoints
- Frontend now served from same origin (removes CORS requirement)

**Deployment:**
- Single binary replaces two-container setup
- Helm chart simplified to single deployment
- Port configuration via `PORT` environment variable (defaults to 8080)
