## 1. Backend Implementation

- [ ] 1.1 Create Go package at `internal/crossplane/innervision/telemetry/` with calculations for time-to-ready averages.
- [ ] 1.2 Register Telemetry router and handler in `internal/server/server.go` exposing `GET /api/v1/telemetry/average`.
- [ ] 1.3 Add backend unit testing for the telemetry service with mock unstructured resources.

## 2. Frontend Infrastructure

- [ ] 2.1 Add type definitions for Telemetry API response inside `ui/src/types.ts`.
- [ ] 2.2 Create API query hooks and cache manager with a 5-minute TTL to fetch averages.

## 3. Frontend UI Components

- [ ] 3.1 Implement the `ClaimGanttTimeline` view with vertical timeline ticks and interactive vertical playhead.
- [ ] 3.2 Implement the `TimelineRow` component featuring separate Wait (hachured, animated) and Provisioning (color-graded) segments.
- [ ] 3.3 Create interactive glassmorphism tooltips for cluster average markers on the row.
- [ ] 3.4 Integrate tabbed navigation (Graph vs. Timeline switcher) in `ui/src/components/ClaimDetailsView.tsx`.

## 4. Verification & Testing

- [ ] 4.1 Create a frontend unit test to verify timeline percentage and offset math calculations on mock tree trees.
- [ ] 4.2 Run workspace Go tests, frontend builds, and linter checks (`npm run lint` and `npm run build`) to ensure zero regressions.
