import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = '/crossplane/xrds';

export function useXrds() {
  return useQuery<any[]>({
    queryKey: ['xrds'],
    queryFn: async () => {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`XRDs fetch failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: 5000,
  });
}

export function useDeleteXrd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API_BASE}/${name}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`XRD delete failed: ${res.statusText}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xrds'] });
    },
  });
}

export function useCreateXrd() {
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
      queryClient.invalidateQueries({ queryKey: ['xrds'] });
    },
  });
}
