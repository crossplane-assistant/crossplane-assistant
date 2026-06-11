## Context

The current user interface has an empty landing page on startup, lacks robust dismissal mechanics for sliding drawers, and crashes completely with a blank white screen if the Kubernetes cluster contains no Claims (as the API returns `null` for a nil slice in Go, which crashes React's `.filter(...)` call).

## Goals / Non-Goals

**Goals:**
- Design a beautiful, dynamic dashboard landing page on the `/` route featuring live statistics and conceptual education.
- Add frictionless sliding drawer dismissal via semi-transparent backdrop overlays and keyboard `Escape` key event listeners.
- Harden the UI to gracefully handle `null` arrays of data without throwing rendering errors.

**Non-Goals:**
- Creating new backend API endpoints or altering Go service layers.
- Bypassing the existing design system or introducing heavy third-party modal libraries.

## Decisions

### 1. Reusing React Query Hooks on the Dashboard
We will import and invoke `useClaims`, `useCompositions`, `useXrds`, `useProviders`, and `useFunctions` directly on the Landing Page. React Query automatically caches and de-duplicates these requests, which prevents API overload and ensures that navigating back to the dashboard instantly pulls cached metrics.

### 2. Lightweight Backdrop & Keyboard Dismissal
Instead of installing complex third-party sheet/modal libraries, we will implement standard overlay divs and native React `useEffect` listeners:
- **Backdrop Overlay**: A simple `<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 animate-fadeIn" onClick={closeDrawer} />` positioned underneath the drawer (`z-50`).
- **Escape Key Listener**: A window-level event listener inside a standard `useEffect` hook that handles cleanup automatically upon component unmount.

### 3. Centralized Null Guarding in `ResourceListView`
Rather than patching individual view pages, we will introduce `const safeData = data || []` in `ResourceListView.tsx` and substitute all references to `data` with `safeData`. This instantly hardens all resource explorer listings and eliminates blank-screen crashes.

## Risks / Trade-offs

- **[Risk] Multiple simultaneous requests on landing page mount** → *Mitigation*: React Query de-duplicates identical requests and caches results. The backend is lightweight and can easily handle these read-only calls.
- **[Risk] Keydown event listener memory leak** → *Mitigation*: Ensure the `useEffect` returns `window.removeEventListener('keydown', ...)` to cleanly unsubscribe when the components are destroyed.
