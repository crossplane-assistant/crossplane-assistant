import React from 'react';
import { useXrds, useDeleteXrd } from '../queries/useXrdQueries';
import { ResourceListView } from './ResourceListView';

const XRD_TEMPLATE = `apiVersion: apiextensions.crossplane.io/v1
kind: CompositeResourceDefinition
metadata:
  name: xpostgresqlinstances.database.example.org
spec:
  group: database.example.org
  names:
    kind: XPostgreSQLInstance
    plural: xpostgresqlinstances
  claimNames:
    kind: PostgreSQLInstance
    plural: postgresqlinstances
  versions:
    - name: v1alpha1
      served: true
      referenceable: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                parameters:
                  type: object
                  properties:
                    storageGB:
                      type: integer
`;

export const ListXrds: React.FC = () => {
  const { data: xrds = [], isLoading, error } = useXrds();
  const deleteMutation = useDeleteXrd();

  const getConditions = (xrd: any) => xrd.status?.conditions || [];
  const getStatus = (xrd: any, type: string) => {
    const conditions = getConditions(xrd);
    return conditions.find((c: any) => c.type === type)?.status || 'Unknown';
  };

  const columns = [
    {
      header: 'Name',
      render: (x: any) => <span className="font-semibold text-blue-600 font-mono">{x.metadata?.name}</span>,
    },
    {
      header: 'Established',
      render: (x: any) => {
        const status = getStatus(x, 'Established');
        const color = status === 'True' ? 'bg-green-500' : 'bg-red-500';
        return (
          <span className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-600">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} /> {status}
          </span>
        );
      },
    },
    {
      header: 'Offered',
      render: (x: any) => {
        const status = getStatus(x, 'Offered');
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
      title="Composite Resource Definitions (XRDs)"
      description="List of Composite Resource Definitions installed on the cluster."
      docLink={{ label: 'official documentation', url: 'https://docs.crossplane.io/latest/concepts/composite-resource-definitions/' }}
      data={xrds}
      isLoading={isLoading}
      error={error}
      columns={columns}
      getRowName={(x) => x.metadata?.name || ''}
      onDelete={async (x) => {
        await deleteMutation.mutateAsync(x.metadata?.name);
      }}
      createModalTemplate={XRD_TEMPLATE}
    />
  );
};
