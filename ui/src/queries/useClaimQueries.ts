import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ref, encodeRef } from '../types';

const API_BASE = '/crossplane/claims';

export function useClaims() {
  return useQuery<any[]>({
    queryKey: ['claims'],
    queryFn: async () => {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Claims fetch failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: 5000,
  });
}

export function useDeleteClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ref: Ref) => {
      const encoded = encodeRef(ref);
      const res = await fetch(`${API_BASE}/${encoded}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Claim delete failed: ${res.statusText}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}

export function useClaim(ref: Ref | undefined) {
  return useQuery<any>({
    queryKey: ['claim', ref],
    queryFn: async () => {
      if (!ref) throw new Error('Ref is required');
      const encoded = encodeRef(ref);
      const res = await fetch(`${API_BASE}/${encoded}`);
      if (!res.ok) throw new Error(`Claim fetch failed: ${res.statusText}`);
      return res.json();
    },
    enabled: !!ref,
    refetchInterval: 15000,
  });
}

export function useClaimTree(ref: Ref | undefined) {
  return useQuery<any>({
    queryKey: ['claim-tree', ref],
    queryFn: async () => {
      if (!ref) throw new Error('Ref is required');
      const encoded = encodeRef(ref);
      const res = await fetch(`${API_BASE}/${encoded}/tree`);
      if (!res.ok) throw new Error(`Claim tree fetch failed: ${res.statusText}`);
      return res.json();
    },
    enabled: !!ref,
    refetchInterval: 15000,
  });
}
