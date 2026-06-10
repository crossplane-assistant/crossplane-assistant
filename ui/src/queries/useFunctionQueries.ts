import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = '/crossplane/functions';

export function useFunctions() {
  return useQuery<any[]>({
    queryKey: ['functions'],
    queryFn: async () => {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Functions fetch failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: 5000,
  });
}

export function useDeleteFunction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API_BASE}/${name}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Function delete failed: ${res.statusText}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['functions'] });
    },
  });
}
