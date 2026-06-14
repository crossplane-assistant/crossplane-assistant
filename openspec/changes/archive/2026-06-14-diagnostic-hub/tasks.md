## 1. Backend Diagnostics Engine (`internal/crossplane/innervision/diagnostic/`)

- [x] 1.1 Create new package structures and models for `diagnostic` (`internal/crossplane/innervision/diagnostic/model.go`)
- [x] 1.2 Implement dynamic GVK-to-ProviderRevision mapping using `crdRegistry` and `prRegistry` in `service.go`
- [x] 1.3 Implement Kubernetes pod log extraction with tail limits and multi-keyword name/UID filtering in `service.go`
- [x] 1.4 Integrate resource tree traversal to fetch aggregated events across Claims, XRs, and MRs in `service.go`
- [x] 1.5 Write unit tests for GVK-to-Provider mapping and log filtering helper functions (`service_test.go`)

## 2. Backend Router & API Integration

- [x] 2.1 Implement `GetClaimDiagnostics` HTTP handler inside `internal/crossplane/innervision/diagnostic/handler.go`
- [x] 2.2 Register the `GET /crossplane/claims/:ref/diagnostics` API endpoint inside `internal/server/server.go`
- [x] 2.3 Verify the API endpoint compiles and responds correctly with test payloads

## 3. Frontend Diagnostic Hub View

- [x] 3.1 Create React Query hook `useClaimDiagnostics(ref)` inside `ui/src/queries/useClaimQueries.ts`
- [x] 3.2 Create new React component `ClaimDiagnosticsHub.tsx` to serve as the unified diagnostics dashboard
- [x] 3.3 Style and build a custom high-contrast log terminal viewer component featuring copy-to-clipboard functionality
- [x] 3.4 Integrate `ClaimDiagnosticsHub` as a third `viewMode` tab alongside Graph and Timeline views in `ui/src/components/ClaimDetailsView.tsx`

## 4. Sliding Drawer Integration & Validation

- [x] 4.1 Integrate the live provider log terminal inside the sliding details drawer under a new "Diagnostic Logs" tab
- [x] 4.2 Run end-to-end frontend type checks (`npm run build` or `tsc`) and ensure there are no compilation or linter warnings
