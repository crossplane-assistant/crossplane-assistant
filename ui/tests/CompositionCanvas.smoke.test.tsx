import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { CompositionCanvas } from '../src/components/CompositionCanvas';

const sampleCompositionYaml = `
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
        - type: ToCompositeFieldPath
          fromFieldPath: status.atProvider.podPhase
          toFieldPath: status.phase
`;

describe('CompositionCanvas smoke test', () => {
  test('mounts without throwing and renders the composite input, resource, and output nodes', () => {
    expect(() =>
      render(
        <ReactFlowProvider>
          <CompositionCanvas yamlString={sampleCompositionYaml} />
        </ReactFlowProvider>
      )
    ).not.toThrow();

    // Composite input/output nodes both show the composite kind
    expect(screen.getAllByText('XSample').length).toBeGreaterThan(0);

    // Managed resource node for the single mapped resource
    expect(screen.getByText('SamplePod')).toBeInTheDocument();

    // Mapped input/output fields flow through to the node content
    expect(screen.getByText('spec.bucketName')).toBeInTheDocument();
    expect(screen.getByText('status.phase')).toBeInTheDocument();
  });
});
