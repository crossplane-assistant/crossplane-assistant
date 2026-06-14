## 1. Update Dependency Declarations in package.json

- [x] 1.1 Update `react` and `react-dom` to stable React 19 version (`^19.0.0`) in `ui/package.json`
- [x] 1.2 Update `@types/react` and `@types/react-dom` to matching stable version (`^19.0.0`) in `ui/package.json`
- [x] 1.3 Update `lucide-react` to compatible version (`^1.18.0`) in `ui/package.json`

## 2. Perform Clean Package Installation

- [x] 2.1 Remove the existing `ui/node_modules/` folder and `ui/package-lock.json` file to guarantee a clean state
- [x] 2.2 Execute standard `npm install` in the `ui` directory without `--legacy-peer-deps` or `--force` flags
- [x] 2.3 Verify that the dependency tree resolves successfully with zero `ERESOLVE` errors
- [x] 2.4 Remove `--legacy-peer-deps` from the `dev` target in the root `Makefile` to align it with standard installation procedures

## 3. Compile and Fix TypeScript/Lint Errors

- [x] 3.1 Execute TypeScript compilation (`tsc`) by running `npm run build` to verify full type safety
- [x] 3.2 Audit and surgically fix any deprecated or renamed Lucide icons if highlighted by the compiler
- [x] 3.3 Execute the linter using `npm run lint` and ensure there are no static analysis warnings or errors (N/A - eslint not configured/present in dependencies)

## 4. Run Tests and Finalize

- [x] 4.1 Execute the unit and integration tests using `npm run test` or `vitest run` to verify no regressions in functionality
- [x] 4.2 Verify that the application starts locally and works flawlessly
