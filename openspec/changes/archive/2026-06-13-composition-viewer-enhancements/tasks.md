## 1. Backend: Upgraded Pipeline Dependency Analyser

- [x] 1.1 Update `internal/crossplane/innervision/composition/dependency/analyser.go` to scan `spec.pipeline` when `spec.resources` is empty.
- [x] 1.2 Implement a robust helper function to unmarshal raw step inputs and extract `ComposedTemplates` from `function-patch-and-transform` step configurations.
- [x] 1.3 Write/extend unit tests in `internal/crossplane/innervision/composition/dependency/analyser_test.go` to verify dependency calculation for pipeline compositions.

## 2. Frontend: Composition Pipeline Visualizations

- [x] 2.1 Update `ui/src/components/CompositionViewer.tsx` to parse and detect pipeline steps referencing `function-patch-and-transform`.
- [x] 2.2 Extract `resources` from step inputs in `CompositionViewer.tsx` and dynamically render them as nested panels using `<DynamicResourceViewer>`.

## 3. Frontend: Composed Resource "Data Flow" Tab

- [x] 3.1 Implement a structured "Data Flow" tab inside `<GenericResourceViewer.tsx>`, `<KubernetesResourceViewer.tsx>`, and `<TerraformResourceViewer.tsx>`.
- [x] 3.2 Categorize patches in the "Data Flow" tab into inputs (Incoming) and outputs (Outgoing) with clean arrow mappings showing source and target field paths.

## 4. Frontend: Composition Relations Tab Enhancements

- [x] 4.1 Update `ui/src/components/ResourceRelations.tsx` to support the "Composition" resource kind.
- [x] 4.2 Fetch active Claims in the Relations tab using `useClaims()`, filter them by the GVK specified in the Composition's `spec.compositeTypeRef`, and display them.
- [x] 4.3 Add visual links and buttons to navigate directly from the matching Claims in the list to their live interactive dependency graphs.

## 5. Verification & Testing

- [x] 5.1 Verify both backend Go compilation and frontend React Vite compilation are warning-free.
- [x] 5.2 Test the interactive flow in-browser to verify that pipeline resources, patches, and claim graphs interlink seamlessly.
