## 1. Implement React Query Creation Mutations

- [x] 1.1 Add `useCreateProvider` mutation in `ui/src/queries/useProviderQueries.ts`
- [x] 1.2 Add `useCreateFunction` mutation in `ui/src/queries/useFunctionQueries.ts`
- [x] 1.3 Add `useCreateClaim` mutation in `ui/src/queries/useClaimQueries.ts`
- [x] 1.4 Add `useCreateXrd` mutation in `ui/src/queries/useXrdQueries.ts`
- [x] 1.5 Add `useCreateManagedResource` mutation in `ui/src/queries/useManagedResourceQueries.ts`

## 2. Refactor ResourceListView Creation Modal

- [x] 2.1 Update `onCreateSuccess` signature in `ResourceListView` to support an asynchronous function `(yaml: string) => Promise<void>`
- [x] 2.2 Add `isSubmitting` and `error` states to the creation modal inside `ResourceListView.tsx`
- [x] 2.3 Implement async `onClick` for the "Create" button with `try/catch` block, button disabling, loading feedback, and warning banner display on error
- [x] 2.4 Align existing mock fallback with the async flow and ensure the modal only closes on successful creation

## 3. Wire Explorer List Pages with Real Mutations

- [x] 3.1 Pass `useCreateProvider` mutation to `ResourceListView` in `ui/src/components/ListProviders.tsx`
- [x] 3.2 Pass `useCreateFunction` mutation to `ResourceListView` in `ui/src/components/ListFunctions.tsx`
- [x] 3.3 Pass `useCreateClaim` mutation to `ResourceListView` in `ui/src/components/ListClaims.tsx`
- [x] 3.4 Pass `useCreateXrd` mutation to `ResourceListView` in `ui/src/components/ListXrds.tsx`
- [x] 3.5 Pass `useCreateComposition` mutation to `ResourceListView` in `ui/src/components/ListCompositions.tsx`
- [x] 3.6 Pass `useCreateManagedResource` mutation to `ResourceListView` in `ui/src/components/ListManagedResources.tsx`

## 4. Verification and Automated Testing

- [x] 4.1 Create a new unit test suite or update existing tests in `ui/tests/` to verify asynchronous resource creation and error display within `ResourceListView`
- [x] 4.2 Validate the entire application flow in a local/mocked environment to ensure that installing presets from Ecosystem Catalog or "+ Create" works seamlessly
