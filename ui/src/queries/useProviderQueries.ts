import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = '/crossplane/providers';

export function useProviders() {
  return useQuery<any[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Providers fetch failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: 5000,
  });
}

export function useDeleteProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API_BASE}/${name}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Provider delete failed: ${res.statusText}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });
}
