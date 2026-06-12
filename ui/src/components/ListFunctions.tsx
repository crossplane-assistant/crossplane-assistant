import React from 'react';
import { useFunctions, useDeleteFunction } from '../queries/useFunctionQueries';
import { ResourceListView } from './ResourceListView';

const FUNCTION_TEMPLATE = `apiVersion: pkg.crossplane.io/v1
kind: Function
metadata:
  name: function-patch-and-transform
spec:
  package: xpkg.upbound.io/crossplane/function-patch-and-transform:v0.2.0
`;

export const ListFunctions: React.FC = () => {
  const { data: functions = [], isLoading, error } = useFunctions();
  const deleteMutation = useDeleteFunction();

  const getConditions = (f: any) => f.status?.conditions || [];
  const getStatus = (f: any, type: string) => {
    const conditions = getConditions(f);
    return conditions.find((c: any) => c.type === type)?.status || 'Unknown';
  };

  const columns = [
    {
      header: 'Name',
      render: (f: any) => <span className="font-semibold text-blue-600 font-mono">{f.metadata?.name}</span>,
    },
    {
      header: 'Healthy',
      render: (f: any) => {
        const status = getStatus(f, 'Healthy');
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
      render: (f: any) => {
        const status = getStatus(f, 'Installed');
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
      title="Composition Functions"
      description="List of Composition Functions installed on the cluster."
      docLink={{ label: 'official documentation', url: 'https://docs.crossplane.io/latest/concepts/composition-functions/' }}
      data={functions}
      isLoading={isLoading}
      error={error}
      columns={columns}
      getRowName={(f) => f.metadata?.name || ''}
      onDelete={async (f) => {
        await deleteMutation.mutateAsync(f.metadata?.name);
      }}
      createModalTemplate={FUNCTION_TEMPLATE}
    />
  );
};
