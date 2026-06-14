import React from 'react';
import { useProviders, useDeleteProvider } from '../queries/useProviderQueries';
import { ResourceListView } from './ResourceListView';
import { getPackageVersion } from '../utils/package';

const PROVIDER_TEMPLATE = `apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-s3
spec:
  package: xpkg.upbound.io/crossplane/provider-aws-s3:v1.0.0
`;

export const ListProviders: React.FC = () => {
  const { data: providers = [], isLoading, error } = useProviders();
  const deleteMutation = useDeleteProvider();

  const getConditions = (p: any) => p.status?.conditions || [];
  const getStatus = (p: any, type: string) => {
    const conditions = getConditions(p);
    return conditions.find((c: any) => c.type === type)?.status || 'Unknown';
  };

  const columns = [
    {
      header: 'Name',
      render: (p: any) => <span className="font-semibold text-blue-600 font-mono">{p.metadata?.name}</span>,
    },
    {
      header: 'Version',
      render: (p: any) => {
        const version = getPackageVersion(p.spec?.package);
        return (
          <span className="font-mono text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
            {version}
          </span>
        );
      },
    },
    {
      header: 'Healthy',
      render: (p: any) => {
        const status = getStatus(p, 'Healthy');
        const color = status === 'True' ? 'bg-green-500' : 'bg-red-500';
        return (
          <span className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-600">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} /> {status}
          </span>
        );
      },
    },
    {
      header: 'Installed',
      render: (p: any) => {
        const status = getStatus(p, 'Installed');
        const color = status === 'True' ? 'bg-green-500' : 'bg-red-500';
        return (
          <span className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-600">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} /> {status}
          </span>
        );
      },
    },
  ];

  return (
    <ResourceListView
      title="Providers"
      description="List of Crossplane Providers installed in the cluster."
      docLink={{ label: 'official documentation', url: 'https://docs.crossplane.io/latest/concepts/providers/' }}
      data={providers}
      isLoading={isLoading}
      error={error}
      columns={columns}
      getRowName={(p) => p.metadata?.name || ''}
      onDelete={async (p) => {
        await deleteMutation.mutateAsync(p.metadata?.name);
      }}
      createModalTemplate={PROVIDER_TEMPLATE}
      ecosystemCategory="provider"
    />
  );
};
