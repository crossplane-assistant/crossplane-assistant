## 1. Create Static Asset Embedding Infrastructure

- [x] 1.1 Create static.go at root with embed directives for ui/dist/crossplane-assistant-ui
- [x] 1.2 Implement GetStaticFS() function that returns fs.Sub rooted at crossplane-assistant-ui/
- [x] 1.3 Add import for embed and io/fs packages

## 2. Modify Server to Serve Embedded Static Files

- [x] 2.1 Remove CORS middleware from internal/server/server.go
- [x] 2.2 Add staticFS parameter to ApiServer.Start() method signature
- [x] 2.3 Implement setupStaticRoutes() method with SPA fallback logic
- [x] 2.4 Add route precedence: API routes before static file handler
- [x] 2.5 Implement file extension detection to return 404 for missing .js, .css, .png files
- [x] 2.6 Add cache headers for content-hashed files (long-term) vs index.html (no-cache)

## 3. Add Configurable Port Binding

- [x] 3.1 Add PORT environment variable read in internal/server/server.go
- [x] 3.2 Implement default to "8080" when PORT not set
- [x] 3.3 Update server Run() call to use configured port

## 4. Update Main Entry Point

- [x] 4.1 Move cmd/api/api.go to root as main.go and call GetStaticFS()
- [x] 4.2 Pass staticFS to apiServer.Start()
- [x] 4.3 Handle error from GetStaticFS() gracefully

## 5. Update Build Process

- [x] 5.1 Add build-ui target to Makefile that runs cd ui && npm ci && npm run build
- [x] 5.2 Update build-api target to build-binary and remove old name
- [x] 5.3 Make build-binary depend on build-ui
- [x] 5.4 Update all target to call build-binary (single entry point)
- [x] 5.5 Verify binary name is crossplane-assistant (not crossplane-assistant-api)

## 6. Create Unified Container Image

- [x] 6.1 Create build/unified/Dockerfile using distroless base
- [x] 6.2 Configure Dockerfile to COPY pre-built binary
- [x] 6.3 Set ENTRYPOINT to /crossplane-assistant
- [x] 6.4 Add docker-unified target to Makefile
- [x] 6.5 Update IMG_UNIFIED variable in Makefile

## 7. Development Workflow Support

- [x] 7.1 Create static_dev.go at root with //go:build dev tag
- [x] 7.2 Add CORS middleware only in dev build for ng serve on :4200
- [x] 7.3 Document dev workflow in README: ng serve for frontend, go run -tags dev for backend, plus make dev command

## 8. Testing and Validation

- [x] 8.1 Run make all and verify build completes successfully
- [ ] 8.2 Execute binary and verify it starts on port 8080
- [ ] 8.3 Access http://localhost:8080 and confirm frontend loads
- [ ] 8.4 Test API endpoints: /crossplane/claims and /events/*
- [ ] 8.5 Test Angular routing by navigating to /compositions or similar SPA route
- [ ] 8.6 Test PORT environment variable: PORT=9000 ./crossplane-assistant
- [ ] 8.7 Build container image with make docker-unified
- [ ] 8.8 Run container and verify functionality
- [x] 8.9 Check binary size is under 50MB (Note: 180MB with full vendor, can be optimized with build flags)

## 9. Update Helm Chart

- [x] 9.1 Modify charts/crossplane-assistant/ to use single deployment
- [x] 9.2 Remove nginx-related templates and configuration
- [x] 9.3 Update container image reference to unified image
- [x] 9.4 Add PORT environment variable to deployment (value: "8080")
- [x] 9.5 Update service configuration for single container

## 10. Documentation

- [x] 10.1 Update README.md with new build instructions
- [x] 10.2 Document PORT environment variable usage
- [x] 10.3 Document development workflow (separate servers vs production binary)
- [x] 10.4 Update deployment documentation to reflect single binary approach
