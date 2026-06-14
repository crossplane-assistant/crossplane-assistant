## 1. Update Dependency Declarations in package.json

- [ ] 1.1 Update `react` and `react-dom` to stable React 19 version (`^19.0.0`) in `ui/package.json`
- [ ] 1.2 Update `@types/react` and `@types/react-dom` to matching stable version (`^19.0.0`) in `ui/package.json`
- [ ] 1.3 Update `lucide-react` to compatible version (`^1.18.0`) in `ui/package.json`

## 2. Perform Clean Package Installation

- [ ] 2.1 Remove the existing `ui/node_modules/` folder and `ui/package-lock.json` file to guarantee a clean state
- [ ] 2.2 Execute standard `npm install` in the `ui` directory without `--legacy-peer-deps` or `--force` flags
- [ ] 2.3 Verify that the dependency tree resolves successfully with zero `ERESOLVE` errors

## 3. Compile and Fix TypeScript/Lint Errors

- [ ] 3.1 Execute TypeScript compilation (`tsc`) by running `npm run build` to verify full type safety
- [ ] 3.2 Audit and surgically fix any deprecated or renamed Lucide icons if highlighted by the compiler
- [ ] 3.3 Execute the linter using `npm run lint` and ensure there are no static analysis warnings or errors

## 4. Run Tests and Finalize

- [ ] 4.1 Execute the unit and integration tests using `npm run test` or `vitest run` to verify no regressions in functionality
- [ ] 4.2 Verify that the application starts locally and works flawlessly
