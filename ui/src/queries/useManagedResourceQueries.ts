import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ManagedResourceKind } from '../types';

const API_BASE = '/crossplane/managedresources';

export function useManagedResourceKinds() {
  return useQuery<ManagedResourceKind[]>({
    queryKey: ['mr-kinds'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/kinds`);
      if (!res.ok) throw new Error(`Managed resource kinds fetch failed: ${res.statusText}`);
      return res.json();
    },
    refetchInterval: 10000,
  });
}

export function useManagedResources(kindObj: ManagedResourceKind | undefined) {
  const group = kindObj?.group || '';
  const version = kindObj?.version || '';
  const kind = kindObj?.kind || '';
  const ref = encodeURIComponent(`${group}/${version}:${kind}`);

  return useQuery<any[]>({
    queryKey: ['managed-resources', group, version, kind],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${ref}`);
      if (!res.ok) throw new Error(`Managed resources fetch failed: ${res.statusText}`);
      return res.json();
    },
    enabled: !!group && !!version && !!kind,
    refetchInterval: 5000,
  });
}

export function useDeleteManagedResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ kindObj, name }: { kindObj: ManagedResourceKind; name: string }) => {
      const ref = encodeURIComponent(`${kindObj.group}/${kindObj.version}:${kindObj.kind}`);
      const res = await fetch(`${API_BASE}/${ref}/${name}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Managed resource delete failed: ${res.statusText}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['managed-resources', variables.kindObj.group, variables.kindObj.version, variables.kindObj.kind],
      });
    },
  });
}
