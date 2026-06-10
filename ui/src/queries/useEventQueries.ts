import { useQuery } from '@tanstack/react-query';
import { Ref, encodeRef } from '../types';

export function useEvents(ref: Ref | undefined) {
  return useQuery<any[]>({
    queryKey: ['events', ref],
    queryFn: async () => {
      if (!ref) return [];
      const encoded = encodeRef(ref);
      const res = await fetch(`/events/${encoded}`);
      if (!res.ok) {
        throw new Error(`Events fetch failed: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: !!ref,
    refetchInterval: 10000, // background-refresh events every 10 seconds
  });
}
