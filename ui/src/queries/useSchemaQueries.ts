import { useQuery } from '@tanstack/react-query';

const API_BASE = '/crossplane/schemas';

interface SchemaParseResult {
  group: string;
  version: string;
}

export function parseApiVersion(apiVersion: string = ''): SchemaParseResult {
  if (apiVersion.includes('/')) {
    const [group, version] = apiVersion.split('/');
    return { group, version };
  }
  return { group: '', version: apiVersion };
}

export function useSchema(apiVersion: string = '', kind: string = '') {
  const { group, version } = parseApiVersion(apiVersion);

  return useQuery<any>({
    queryKey: ['schema', group, version, kind],
    queryFn: async () => {
      if (!version || !kind) {
        throw new Error('version and kind are required to fetch schema');
      }
      const params = new URLSearchParams({ group, version, kind });
      const res = await fetch(`${API_BASE}?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Schema fetch failed: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: !!version && !!kind,
    staleTime: 1000 * 60 * 30, // Schemas are highly static, keep cached for 30 minutes
  });
}
