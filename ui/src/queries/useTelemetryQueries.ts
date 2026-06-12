import { useQuery } from '@tanstack/react-query';
import { TelemetryAverageResponse } from '../types';

export function useTelemetryAverage(apiVersion: string, kind: string, enabled: boolean = true) {
  return useQuery<TelemetryAverageResponse>({
    queryKey: ['telemetry-average', apiVersion, kind],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/telemetry/average?apiVersion=${encodeURIComponent(apiVersion)}&kind=${encodeURIComponent(kind)}`
      );
      if (!res.ok) {
        throw new Error(`Telemetry fetch failed: ${res.statusText}`);
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache TTL
    gcTime: 10 * 60 * 1000,   // Keep cache alive for 10 minutes
    enabled: enabled && !!apiVersion && !!kind,
    retry: 1,                 // Be gentle with retries for background telemetry
  });
}
