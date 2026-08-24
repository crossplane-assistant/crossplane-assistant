import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompositionWorkspace } from '../src/components/CompositionWorkspace';

vi.mock('@monaco-editor/react', () => ({
  default: () => null,
}));

vi.mock('../src/queries/useCompositionQueries', () => ({
  useComposition: vi.fn(),
  useCompositionDependencies: vi.fn(),
}));

vi.mock('../src/queries/useClaimQueries', () => ({
  useClaims: vi.fn(),
}));

import { useComposition, useCompositionDependencies } from '../src/queries/useCompositionQueries';
import { useClaims } from '../src/queries/useClaimQueries';

describe('CompositionWorkspace smoke test', () => {
  test('mounts without throwing and without issuing a real network request, given mocked data dependencies', () => {
    const mockComposition = {
      metadata: { name: 'xpostgres-pipeline', creationTimestamp: '2026-06-13T12:00:00Z' },
      spec: {
        compositeTypeRef: {
          apiVersion: 'demo.crossplane-assistant.io/v1alpha1',
          kind: 'XPostgreSQLInstance',
        },
        resources: [],
      },
    };

    vi.mocked(useComposition).mockReturnValue({
      data: mockComposition,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(useCompositionDependencies).mockReturnValue({
      data: { resources: [], edges: [] },
    } as any);

    vi.mocked(useClaims).mockReturnValue({
      data: [],
    } as any);

    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const queryClient = new QueryClient();

    expect(() =>
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/explore/compositions/xpostgres-pipeline']}>
            <CompositionWorkspace />
          </MemoryRouter>
        </QueryClientProvider>
      )
    ).not.toThrow();

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
