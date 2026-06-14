## 1. Package Utility and Tests

- [x] 1.1 Create `ui/src/utils/package.ts` and implement `getPackageVersion` to extract the package tag/version from image strings.
- [x] 1.2 Create a comprehensive unit test file `ui/tests/package.test.ts` covering edge cases like digests, no tags, and empty inputs.
- [x] 1.3 Run unit tests using Vitest/Jest to ensure the extraction utility passes validation.

## 2. Providers List Integration

- [x] 2.1 Import `getPackageVersion` in `ui/src/components/ListProviders.tsx`.
- [x] 2.2 Add a new "Version" column to the `columns` definition array in `ListProviders.tsx`, styled as a monospace badge and positioned after the "Name" column.

## 3. Functions List Integration

- [x] 3.1 Import `getPackageVersion` in `ui/src/components/ListFunctions.tsx`.
- [x] 3.2 Add a new "Version" column to the `columns` definition array in `ListFunctions.tsx`, styled as a monospace badge and positioned after the "Name" column.

## 4. Verification and Validation

- [x] 4.1 Run frontend code validation tasks (linting, type checking, and tests) to ensure zero regressions or compilation issues.
