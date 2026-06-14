## Why

The `ui` project currently relies on the `--legacy-peer-deps` flag during `npm install` because of a strict peer dependency conflict in the Node/npm ecosystem. Specifically, the workspace uses React 19 Release Candidate (`^19.0.0-rc.0`), which clashes with older dependencies like `lucide-react@0.395.0` (which only supports React up to version 18 in its metadata).

Using `--legacy-peer-deps` completely disables npm's built-in dependency safety checks. This increases the risk of runtime errors due to API mismatches, leads to potentially duplicate package instances, and reduces build determinism. Moving back to standard npm installation practices aligns the codebase with modern engineering norms and ensures long-term maintainability.

## What Changes

- **Stable React 19 Upgrade**: Upgrade `react` and `react-dom` (and their respective `@types`) from React 19 Release Candidate (`^19.0.0-rc.0`) to the official stable version of React 19 (`^19.0.0`).
- **Standard Dependency Alignment**: Upgrade `lucide-react` to its latest stable version (`^1.18.0`) which declares official compatibility with React 19.
- **Strict Dependency Resolution**: Ensure that `npm install` executes successfully without flags, ensuring a clean and warning-free resolution tree.
- **Build and Test Validation**: Validate that the UI codebase continues to compile and all tests pass with the updated dependencies.

## Capabilities

### Modified Capabilities
- `embedded-static-serving`: Standardizes package-lock structures which ensures clean builds during embedded server production steps.
- `stability-fixes`: Enhances overall dependency tree stability.

## Impact

- **UI Dependencies**: Modifies `ui/package.json` and updates `ui/package-lock.json`.
- **No Functional Logic Changes**: This change is purely structural and dependency-focused. It guarantees that the visual application components remain unaffected while utilizing standard dependencies.
