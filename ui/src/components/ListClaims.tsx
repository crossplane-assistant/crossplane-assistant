import React from 'react';
import { Link } from 'react-router-dom';
import { GitFork } from 'lucide-react';
import { useClaims, useDeleteClaim, useCreateClaim } from '../queries/useClaimQueries';
import { ResourceListView } from './ResourceListView';
import { Ref, encodeRef } from '../types';

const CLAIM_TEMPLATE = `apiVersion: database.example.org/v1alpha1
kind: PostgreSQLInstance
metadata:
  name: my-postgresql-claim
  namespace: default
spec:
  parameters:
    storageGB: 20
`;

export const ListClaims: React.FC = () => {
  const { data: claims = [], isLoading, error } = useClaims();
  const deleteMutation = useDeleteClaim();
  const createMutation = useCreateClaim();

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
    {
      header: 'Graph',
      render: (c: any) => {
        const ref = getRowRef(c);
        const encoded = encodeRef(ref);
        return (
          <Link
            to={`/explore/claims/${encoded}`}
            onClick={(e) => e.stopPropagation()} // Prevent row selection details from triggering
            className="inline-flex items-center justify-center p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400 transition-all cursor-pointer"
            title="View Dependency Graph"
          >
            <GitFork className="w-4 h-4 transform rotate-90" />
          </Link>
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
      createModalTemplate={CLAIM_TEMPLATE}
      onCreateSuccess={async (yaml) => {
        await createMutation.mutateAsync(yaml);
      }}
    />
  );
};
