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
    mutationFn: async (composition: any) => {
      return fetchJson<Composition>(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composition),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compositions'] });
    },
  });
}
