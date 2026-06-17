import { describe, test, expect } from 'vitest';
import { getProviderLabel } from '../src/components/ListManagedResources';
import { ManagedResourceKind } from '../src/types';

describe('Managed Resources Provider Utilities', () => {
  test('should extract provider label from provider field correctly', () => {
    const kind: ManagedResourceKind = {
      provider: 'provider-aws',
      group: 's3.aws.upbound.io',
      version: 'v1beta1',
      kind: 'Bucket',
      resource: 'buckets',
    };
    expect(getProviderLabel(kind)).toBe('AWS');
  });

  test('should fallback to parsing group field if provider is empty', () => {
    const kind: ManagedResourceKind = {
      provider: '',
      group: 'database.gcp.upbound.io',
      version: 'v1beta1',
      kind: 'Instance',
      resource: 'instances',
    };
    expect(getProviderLabel(kind)).toBe('GCP');
  });

  test('should handle kubernetes groups correctly', () => {
    const kind: ManagedResourceKind = {
      provider: '',
      group: 'core.kubernetes.crossplane.io',
      version: 'v1alpha1',
      kind: 'Object',
      resource: 'objects',
    };
    expect(getProviderLabel(kind)).toBe('KUBERNETES');
  });

  test('should fallback to other domains and return uppercase', () => {
    const kind: ManagedResourceKind = {
      provider: '',
      group: 'myapi.customhost.org',
      version: 'v1',
      kind: 'CustomResource',
      resource: 'customresources',
    };
    expect(getProviderLabel(kind)).toBe('MYAPI');
  });
});
