import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Composition, ResourcesGraph } from '../types';

const API_BASE = '/crossplane/compositions';

// Generic fetcher
const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText} (${res.status})`);
  }
  return res.json();
};

export function useCompositions() {
  return useQuery<Composition[]>({
    queryKey: ['compositions'],
    queryFn: () => fetchJson<Composition[]>(API_BASE),
  });
}

export function useComposition(name: string | undefined) {
  return useQuery<Composition>({
    queryKey: ['composition', name],
    queryFn: () => fetchJson<Composition>(`${API_BASE}/${name}`),
    enabled: !!name,
  });
}

export function useCompositionDependencies(name: string | undefined) {
  return useQuery<ResourcesGraph>({
    queryKey: ['composition-dependencies', name],
    queryFn: () => fetchJson<ResourcesGraph>(`${API_BASE}/${name}/dependencies`),
    enabled: !!name,
  });
}

export function useDeleteComposition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API_BASE}/${name}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(`Delete failed: ${res.statusText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compositions'] });
    },
  });
}

export function useCreateComposition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (yaml: string) => {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/yaml' },
        body: yaml,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compositions'] });
    },
  });
}

export function useCompositionRevision(name: string | undefined) {
  return useQuery<any>({
    queryKey: ['composition-revision', name],
    queryFn: () => fetchJson<any>(`/crossplane/compositionrevisions/${name}`),
    enabled: !!name,
  });
}
