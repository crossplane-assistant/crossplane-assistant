## Why

Currently, clicking "Create" in the Monaco YAML creation modal across all explorer list pages (Providers, Functions, Claims, XRDs, Compositions, Managed Resources) triggers a mocked "successfully (Mocked)!" browser alert instead of invoking the real backend endpoints. This occurs because the list components render `ResourceListView` without passing the `onCreateSuccess` callback, and `ResourceListView` does not hook into real React Query mutations. 

Now that the backend API has fully functional POST endpoints capable of receiving and parsing raw YAML payloads, we want to transition from a mocked prototype to real, live resource creation.

## What Changes

- **React Query Mutations**: Introduce new creation mutations (`useCreateProvider`, `useCreateFunction`, `useCreateClaim`, `useCreateXrd`, `useCreateManagedResource`) inside the frontend queries to send POST requests with raw YAML payload to the backend.
- **ResourceListView Integration**: Update `ResourceListView`'s Create modal to asynchronously invoke the `onCreateSuccess` callback, managing loading states (disabling the button, showing a loading indicator) and catching errors (keeping the modal open and displaying real API errors so the user can fix their YAML).
- **Wiring Explorer Pages**: Pass the appropriate creation mutations from all parent explorer list components (`ListProviders`, `ListFunctions`, `ListClaims`, `ListXrds`, `ListCompositions`, `ListManagedResources`) into `ResourceListView`'s `onCreateSuccess` prop.
- **Cache Invalidation**: Automatically refresh the respective React Query cached lists upon successful creation so the user immediately sees their newly created resource in the tables.

## Capabilities

### New Capabilities
- None (this change is fully focused on replacing prototype mocks with real backend integration).

### Modified Capabilities
- `unified-resource-creation`: Replace the "Unified Mock Resource Creation Alert" requirement with a "Real Resource Creation Integration" requirement that integrates with live backend REST endpoints, handles network loading, catches validation/creation errors, and invalidates list queries upon success.

## Impact

- **Frontend**:
  - `ui/src/components/ResourceListView.tsx`: Modal creation logic and button interactions.
  - `ui/src/components/ListProviders.tsx`, `ListFunctions.tsx`, `ListClaims.tsx`, `ListXrds.tsx`, `ListCompositions.tsx`, `ListManagedResources.tsx`: Wiring mutations.
  - `ui/src/queries/`: Add `useCreate...` mutations to `useProviderQueries.ts`, `useFunctionQueries.ts`, `useClaimQueries.ts`, `useXrdQueries.ts`, `useManagedResourceQueries.ts` (Note: `useCompositionQueries.ts` already has `useCreateComposition`, but we will make sure it is updated to send raw YAML if needed).
- **API Backend**: No direct API changes needed, as the Gin-gonic handlers for `POST` on `/crossplane/*` already accept raw YAML bodies and are fully implemented.
- **Tests**: Update or add tests in `ui/tests/` to verify real creation triggers and error-handling paths.
