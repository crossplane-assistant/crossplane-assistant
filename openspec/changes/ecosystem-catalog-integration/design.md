## Context

The Crossplane Assistant has explorer pages for **Providers** and **Functions**. Currently, installing these components is done through a standard "+ Create" button that launches a YAML modal pre-filled with a single hardcoded template. 

There is no way to discover other available Providers (like Helm, SQL, Vault) or Functions (like Go Templating, CEL, KCL) from the public community (`crossplane-contrib` and Upbound registries) directly in the UI.

This design introduces a client-side Ecosystem Hub utilizing a **Hybrid Local-Hub with Fallback** strategy. It fetches public repositories on-the-fly and merges them with robust offline presets, elevating user discovery and educational utility without impacting backend stability.

## Goals / Non-Goals

**Goals:**
- **Tabbed List View**: Seamless integration of an "Ecosystem Hub" tab into `ListProviders.tsx` and `ListFunctions.tsx`.
- **Dual-mode Loading**: Fetch live GitHub metadata and fallback gracefully to local presets if offline or rate-limited.
- **Documentation Access**: Provide direct clickable deep-links to documentation/repositories on each component card.
- **Presets & Editor Integration**: Allow clicking "Use Preset" or "Configure" to open the existing Monaco Editor modal populated with the corresponding YAML.

**Non-Goals:**
- **Backend Refactoring**: The Go backend will remain a pure, lightweight proxy. It will not fetch external catalogs or require outbound internet access.
- **Bypassing Review**: Installing a component will never bypass the Monaco Editor; the user must always review and have the opportunity to modify the YAML before applying it.

## Decisions

### Decision 1: Client-Side GitHub API Queries
- **Option A (Backend Proxy)**: Add a Go endpoint that queries GitHub/Upbound APIs.
- **Option B (Client-Side Direct Fetching)**: Query `https://api.github.com/orgs/crossplane-contrib/repos?per_page=100` directly from the React frontend.
- **Chosen Approach**: **Option B**.
- **Rationale**: Keeps the Go backend extremely simple and secure. Many production Kubernetes clusters run the Crossplane Assistant in isolated networks with no outbound internet access. Offloading ecosystem fetching to the user's browser ensures that the backend never fails or blocks due to network policies.

### Decision 2: Curated Offline Presets File
- **Design Choice**: Store local curated metadata in `ui/src/utils/ecosystemCatalog.ts`.
- **Rationale**: By maintaining a static TypeScript registry of the most popular providers and functions, we can provide meticulously refined descriptions, exact recommended stable versions, and fully functional YAML templates that include sensible defaults (such as service configurations). This ensures a high-quality experience even when offline.

### Decision 3: Merge and Enrichment Algorithm
- **Design Choice**: Merge online and offline registries.
- **Rationale**:
  - If **online**: Fetch repos. For each repo matching `function-` or `provider-` prefixes, check if we have a local curated preset. If we do, enrich the curated preset with live star counts and description updates. If we don't, dynamically generate a card as a "Community" component with an automatically generated, valid Kubernetes manifest.
  - If **offline / rate-limited**: Swallow the error gracefully (no alerts, no console errors) and render the local curated list only.

## Risks / Trade-offs

- **[Risk] GitHub API Rate Limiting**: Unauthenticated requests to GitHub are limited to 60 requests per hour per IP.
  - *Mitigation*: We execute exactly one query to `/orgs/crossplane-contrib/repos` per page session (with React Query caching). If rate limits are exceeded, the fetch fails silently, and the catalog displays the offline curated presets list.
- **[Risk] Broken community links**: External repositories may be renamed or deleted.
  - *Mitigation*: Curated items point to active repositories. Community items use live GitHub API attributes (`html_url`, `description`), making them self-healing.
- **[Risk] Outdated default versions**: The hardcoded local versions in our registry may fall behind.
  - *Mitigation*: The user can edit the version tag in the Monaco YAML editor before submitting the installation request.
