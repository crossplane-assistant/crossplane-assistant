import { parseYAMLToIR, updateYAMLPath } from '../src/utils/compositionParser';

describe('Composition Parser & AST Updater', () => {
  const legacyCompositionYaml = `
kind: Composition
apiVersion: apiextensions.crossplane.io/v1
metadata:
  name: xsamples.demo.crossplane-assistant.io
spec:
  compositeTypeRef:
    apiVersion: demo.crossplane-assistant.io/v1alpha1
    kind: XSample
  mode: Resources
  resources:
    - name: SamplePod
      base:
        apiVersion: kubernetes.crossplane.io/v1alpha1
        kind: Object
        spec:
          forProvider:
            manifest:
              apiVersion: v1
              kind: Pod
      patches:
        - type: FromCompositeFieldPath
          fromFieldPath: spec.bucketName
          toFieldPath: spec.forProvider.manifest.metadata.name
`;

  const pipelineCompositionYaml = `
kind: Composition
apiVersion: apiextensions.crossplane.io/v1
metadata:
  name: xpostgres-pipeline.demo.crossplane-assistant.io
spec:
  compositeTypeRef:
    apiVersion: demo.crossplane-assistant.io/v1alpha1
    kind: XPostgreSQLInstance
  mode: Pipeline
  pipeline:
    - step: patch-and-transform
      functionRef:
        name: crossplane-contrib-function-patch-and-transform
      input:
        apiVersion: pt.fn.crossplane.io/v1beta1
        kind: Resources
        resources:
          - name: DbSubnetGroup
            base:
              apiVersion: database.aws.upbound.io/v1beta1
              kind: DBSubnetGroup
            patches:
              - type: ToCompositeFieldPath
                fromFieldPath: status.atProvider.id
                toFieldPath: status.atProvider.dbSubnetGroupId
`;

  test('parseYAMLToIR correctly parses legacy resources composition', () => {
    const ir = parseYAMLToIR(legacyCompositionYaml);
    expect(ir.name).toBe('xsamples.demo.crossplane-assistant.io');
    expect(ir.mode).toBe('Resources');
    expect(ir.composite.kind).toBe('XSample');
    expect(ir.composite.apiVersion).toBe('demo.crossplane-assistant.io/v1alpha1');
    expect(ir.resources.length).toBe(1);

    const res = ir.resources[0];
    expect(res.id).toBe('SamplePod');
    expect(res.kind).toBe('Object');
    expect(res.apiVersion).toBe('kubernetes.crossplane.io/v1alpha1');
    expect(res.patches.length).toBe(1);

    const patch = res.patches[0];
    expect(patch.type).toBe('FromCompositeFieldPath');
    expect(patch.fromFieldPath).toBe('spec.bucketName');
    expect(patch.toFieldPath).toBe('spec.forProvider.manifest.metadata.name');
    expect(patch.astPath).toEqual(['spec', 'resources', 0, 'patches', 0]);
  });

  test('parseYAMLToIR correctly parses pipeline composition', () => {
    const ir = parseYAMLToIR(pipelineCompositionYaml);
    expect(ir.name).toBe('xpostgres-pipeline.demo.crossplane-assistant.io');
    expect(ir.mode).toBe('Pipeline');
    expect(ir.composite.kind).toBe('XPostgreSQLInstance');
    expect(ir.resources.length).toBe(1);

    const res = ir.resources[0];
    expect(res.id).toBe('DbSubnetGroup');
    expect(res.kind).toBe('DBSubnetGroup');
    expect(res.patches.length).toBe(1);

    const patch = res.patches[0];
    expect(patch.type).toBe('ToCompositeFieldPath');
    expect(patch.fromFieldPath).toBe('status.atProvider.id');
    expect(patch.toFieldPath).toBe('status.atProvider.dbSubnetGroupId');
  });

  test('updateYAMLPath updates AST and preserves formatting and comments', () => {
    const yamlWithComment = `
# This is a sample legacy composition
kind: Composition
apiVersion: apiextensions.crossplane.io/v1
metadata:
  name: xsamples
spec:
  resources:
    - name: SamplePod
      patches: []
`;
    // Update patches
    const updated = updateYAMLPath(yamlWithComment, ['spec', 'resources', 0, 'patches'], [
      { type: 'FromCompositeFieldPath', fromFieldPath: 'spec.name', toFieldPath: 'metadata.name' }
    ]);

    expect(updated).toContain('# This is a sample legacy composition');
    expect(updated).toContain('fromFieldPath: spec.name');
    expect(updated).toContain('toFieldPath: metadata.name');

    // Parse it back to make sure it's valid
    const finalIR = parseYAMLToIR(updated);
    expect(finalIR.resources[0].patches[0].fromFieldPath).toBe('spec.name');
  });
});
