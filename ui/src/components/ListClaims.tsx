import React from 'react';
import { useClaims, useDeleteClaim } from '../queries/useClaimQueries';
import { ResourceListView } from './ResourceListView';
import { Ref } from '../types';

export const ListClaims: React.FC = () => {
  const { data: claims = [], isLoading, error } = useClaims();
  const deleteMutation = useDeleteClaim();

  const getConditions = (claim: any) => claim.status?.conditions || [];
  const getStatus = (claim: any, type: string) => {
    const conditions = getConditions(claim);
    return conditions.find((c: any) => c.type === type)?.status || 'Unknown';
  };

  const getRowRef = (claim: any): Ref => ({
    apiVersion: claim.apiVersion,
    kind: claim.kind,
    name: claim.metadata?.name,
    namespace: claim.metadata?.namespace,
  });

  const columns = [
    {
      header: 'Name',
      render: (c: any) => (
        <span className="font-semibold text-blue-600 font-mono">
          {c.metadata?.namespace ? `${c.metadata.namespace}/${c.metadata.name}` : c.metadata?.name}
        </span>
      ),
    },
    {
      header: 'Synced',
      render: (c: any) => {
        const status = getStatus(c, 'Synced');
        const color = status === 'True' ? 'bg-green-500' : 'bg-red-500';
        return (
          <span className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-600">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} /> {status}
          </span>
        );
      },
    },
    {
      header: 'Ready',
      render: (c: any) => {
        const status = getStatus(c, 'Ready');
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
      title="Claims"
      description="List of claims (Composite Resource instances) active in namespaces."
      data={claims}
      isLoading={isLoading}
      error={error}
      columns={columns}
      getRowName={(c) => c.metadata?.name || ''}
      onDelete={async (c) => {
        await deleteMutation.mutateAsync(getRowRef(c));
      }}
    />
  );
};
