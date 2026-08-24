import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ListManagedResources } from '../src/components/ListManagedResources';
import { ManagedResourceKind } from '../src/types';

vi.mock('../src/queries/useManagedResourceQueries', () => ({
  useManagedResourceKinds: vi.fn(),
  useManagedResources: vi.fn(),
  useDeleteManagedResource: vi.fn(),
  useCreateManagedResource: vi.fn(),
}));

import {
  useManagedResourceKinds,
  useManagedResources,
  useDeleteManagedResource,
  useCreateManagedResource,
} from '../src/queries/useManagedResourceQueries';

describe('ListManagedResources', () => {
  test('renders each mocked managed resource in the resource list', () => {
    const mockKind: ManagedResourceKind = {
      provider: 'provider-aws',
      group: 's3.aws.upbound.io',
      version: 'v1beta1',
      kind: 'Bucket',
      resource: 'buckets',
      totalItems: 2,
      readyItems: 2,
    };

    const mockResources = [
      { metadata: { name: 'my-bucket-one' }, status: { conditions: [] } },
      { metadata: { name: 'my-bucket-two' }, status: { conditions: [] } },
    ];

    vi.mocked(useManagedResourceKinds).mockReturnValue({
      data: [mockKind],
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useManagedResources).mockReturnValue({
      data: mockResources,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useDeleteManagedResource).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(useCreateManagedResource).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    render(
      <MemoryRouter>
        <ListManagedResources />
      </MemoryRouter>
    );

    for (const resource of mockResources) {
      expect(screen.getByText(resource.metadata.name)).toBeInTheDocument();
    }
  });
});
