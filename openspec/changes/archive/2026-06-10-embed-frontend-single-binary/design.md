## Context

The crossplane-assistant currently uses a two-container architecture: nginx serving the Angular frontend and a Go API server. This requires container orchestration, complicates local development setup, and increases deployment overhead. 

Go 1.16+ provides embed.FS for embedding static assets at compile time. The Gin framework already handles HTTP routing and can serve embedded files. We can consolidate to a single binary that serves both API and static assets, simplifying deployment for Kubernetes clusters and local/VM installations.

Current constraints:
- Go 1.22.5
- Angular 17 SPA with client-side routing
- Gin web framework for API
- Kubernetes and local/VM deployment targets
- Development workflow should remain fast (no rebuilds on frontend changes)

## Goals / Non-Goals

**Goals:**
- Single binary artifact containing API server and frontend assets
- Support both Kubernetes and local/VM deployment with same binary
- Maintain existing API routes unchanged
- Support Angular SPA client-side routing
- Configurable port binding
- Keep development workflow efficient (separate Angular dev server)

**Non-Goals:**
- Changing API contracts or endpoints
- Supporting external web servers (nginx/Apache)
- Adding CORS middleware (not needed for same-origin)
- Hot reloading of embedded assets in production
- Multi-architecture support in this change (can be added later via CI)

## Decisions

### Decision 1: Use Go embed.FS with fs.Sub

**Choice:** Embed Angular build output using `//go:embed all:../../ui/dist/crossplane-assistant-ui/browser` and serve via fs.Sub to strip the path prefix.

**Why:** 
- Go's embed is compile-time, zero runtime overhead
- fs.Sub creates clean root at browser/ level
- Standard library, no external dependencies

**Alternatives considered:**
- go-bindata: Third-party, deprecated
- Embedding at wrong level (ui/dist/): Would require /ui/dist/ URL prefix

### Decision 2: Custom static file handler with SPA fallback

**Choice:** Implement custom Gin handler that:
1. Checks API route prefixes first (/crossplane/, /events/)
2. Attempts to serve file from embed.FS
3. Falls back to index.html for non-API, non-file routes
4. Returns 404 only for explicit file extensions that don't exist

**Why:**
- Gin's StaticFS doesn't provide SPA fallback logic
- Need explicit control over API precedence
- Angular routing requires serving index.html for unknown paths
- File extension check prevents index.html for missing.js

**Alternatives considered:**
- Gin NoRoute + StaticFS: Can't distinguish between SPA routes and missing files
- Middleware approach: More complex, harder to debug routing order

### Decision 3: Remove CORS middleware entirely

**Choice:** Remove cors.New() middleware from server.

**Why:**
- Same-origin requests don't need CORS
- Frontend served from same host:port as API
- Simplifies security surface
- Reduces response headers

**Alternatives considered:**
- Keep CORS for flexibility: Unnecessary overhead, adds confusion
- Conditional CORS: Over-engineering for no use case

### Decision 4: PORT environment variable for configuration

**Choice:** Read PORT from environment, default to "8080".

**Why:**
- Standard pattern (used by Heroku, Cloud Run, etc.)
- Kubernetes-friendly (easy to set in deployment)
- Simple to test locally: `PORT=9000 ./crossplane-assistant`

**Alternatives considered:**
- Command-line flag: Less K8s-friendly
- Config file: Over-engineering for single value
- Multiple env vars (HOST, PORT): Unnecessary complexity

### Decision 5: Build UI before embedding

**Choice:** Makefile dependency chain: `build-ui` → `build-binary` → `all`

**Why:**
- Ensures fresh build
- Single entry point: `make all`
- Clear dependency ordering
- Fails fast if Angular build fails

**Alternatives considered:**
- Manual build steps: Error-prone
- Check for dist/ presence: Can serve stale builds

### Decision 6: Development mode with separate servers

**Choice:** Keep `ng serve` on :4200 for development, add CORS back via build tag for dev mode.

**Why:**
- Fast feedback loop (Angular live reload)
- No Go rebuild on frontend changes
- Standard Angular development workflow

**Implementation:** Use build tag `//go:build dev` to include CORS middleware only in dev builds.

### Decision 7: Container strategy - binary-only image

**Choice:** Create minimal container (distroless) that copies the pre-built binary, no multi-stage build for Go.

**Why:**
- Binary already compiled with embedded assets
- Smaller image (no Go toolchain)
- Faster builds (no Go compile in Docker)
- Same binary for local and container use

**Alternatives considered:**
- Multi-stage build: Unnecessary since we build binary outside Docker
- Include both build processes: Slower, duplicates build logic

## Risks / Trade-offs

**Risk:** Binary size grows with large Angular builds  
**Mitigation:** Set budget in angular.json (currently 1MB initial), monitor in CI. Embed is still more efficient than running two containers.

**Risk:** Embed requires rebuild for frontend changes  
**Mitigation:** Development workflow uses separate servers. Production rebuilds are intentional (versioned artifacts).

**Risk:** Routing logic complexity increases  
**Mitigation:** Clear precedence rules documented. Add integration tests for routing scenarios.

**Risk:** SPA fallback could mask missing file issues  
**Mitigation:** Explicit file extension check returns 404 for .js, .css, .png, etc. that don't exist.

**Trade-off:** Loss of nginx-level caching and optimization  
**Accepted:** Go http.FileServer handles caching headers. Browser caching via content hashes in filenames (Angular default). For high traffic, add CDN or reverse proxy if needed.

**Trade-off:** Single process for both concerns  
**Accepted:** Simplifies deployment significantly. API is already serving HTTP, static file serving has minimal overhead. Can scale horizontally in K8s.

## Migration Plan

**Build process:**
1. Add cmd/api/static.go with embed directives
2. Modify internal/server/server.go to remove CORS, add static handler
3. Update Makefile with build-ui and unified build targets
4. Create build/unified/Dockerfile

**Testing:**
1. Run `make all` to verify build completes
2. Test binary locally: `./crossplane-assistant`
3. Verify frontend loads at http://localhost:8080
4. Verify API endpoints still work at /crossplane/*, /events/*
5. Test Angular routing (navigate to /compositions)

**Deployment:**
1. Build and push new container image
2. Update Helm chart to use single deployment (remove nginx)
3. Deploy to dev cluster
4. Validate functionality
5. Roll out to other environments

**Rollback:**
- Keep old Helm chart version
- Revert to two-container deployment if issues arise
- No database or data migration needed

## Open Questions

- None at this time (resolved during exploration phase)
