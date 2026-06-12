## 1. Synced vs Ready Phase Separation

- [ ] 1.1 Extract `Synced` and `Ready` transition times from resource manifests in the timeline.
- [ ] 1.2 Refactor `TimelineRow` rendering to segment the active provisioning bar into distinct Synced (Crossplane) and Ready (Cloud) visual segments.

## 2. Interactive Event Pins

- [ ] 2.1 Set up background loading for resource events within `ClaimGanttTimeline`.
- [ ] 2.2 Calculate event position offsets and overlay interactive Warning and Normal dot pins on the timeline bar.
- [ ] 2.3 Implement glassmorphic event tooltips showing detailed reasons and messages upon hover.

## 3. Interactive Dependency Highlighting

- [ ] 3.1 Implement shared hover state tracking (`hoveredNodeId`) in `ClaimGanttTimeline`.
- [ ] 3.2 Add parent-child detection logic to highlight upstream and downstream dependency rows on hover.

## 4. Defensive Clamping & Caching (Friction Protection)

- [ ] 4.1 Apply clock-skew correction and clamp all relative math calculations using `Math.max(0, val)`.
- [ ] 4.2 Add debounce/fallback guards to handle condition flickering and missing transition fields on non-standard CRDs.

## 5. Verification & Testing

- [ ] 5.1 Run static type compilation checks (`npm run build`) and Go build validations to confirm complete stability.
