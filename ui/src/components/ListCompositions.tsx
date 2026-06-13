import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompositions, useDeleteComposition } from '../queries/useCompositionQueries';
import { CompositionViewer } from './CompositionViewer';
import { ResourceListView } from './ResourceListView';

const COMPOSITION_TEMPLATE = `apiVersion: apiextensions.crossplane.io/v1
kind: Composition
metadata:
  name: xpostgres-custom
spec:
  compositeTypeRef:
    apiVersion: database.example.org/v1alpha1
    kind: XPostgreSQLInstance
  resources:
    - name: postgres-db
      base:
        apiVersion: kubernetes.crossplane.io/v1alpha1
        kind: Object
        spec:
          forProvider:
            manifest:
              apiVersion: v1
              kind: ConfigMap
              metadata:
                name: custom-db-config
`;

export const ListCompositions: React.FC = () => {
  const { data: compositions = [], isLoading, error } = useCompositions();
  const deleteMutation = useDeleteComposition();

  const columns = [
    {
      header: 'Name',
      render: (comp: any) => (
        <span className="font-semibold text-blue-600 font-mono">
          {comp.metadata?.name}
        </span>
      ),
    },
    {
      header: 'Kind',
      render: (comp: any) => (
        <span className="font-medium text-slate-500">
          {comp.spec?.compositeTypeRef?.kind || 'Composite'}
        </span>
      ),
    },
    {
      header: 'Age',
      render: (comp: any) => {
        const created = comp.metadata?.creationTimestamp
          ? new Date(comp.metadata.creationTimestamp).toLocaleDateString()
          : 'Unknown';
        return (
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> {created}
          </span>
        );
      },
    },
  ];

  return (
    <ResourceListView
      title="Compositions"
      description="List of compositions installed on the cluster."
      docLink={{
        label: 'documentation',
        url: 'https://docs.crossplane.io/latest/concepts/compositions/',
      }}
      data={compositions}
      isLoading={isLoading}
      error={error as Error}
      columns={columns}
      getRowName={(comp) => comp.metadata?.name || ''}
      onDelete={async (comp) => {
        await deleteMutation.mutateAsync(comp.metadata?.name);
      }}
      renderDetailView={(comp) => (
        <div className="space-y-4">
          <div className="flex justify-end px-4 pt-2">
            <Link
              to={`/explore/compositions/${comp.metadata?.name}`}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer border border-blue-500 hover:border-blue-600"
            >
              Open Workspace <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <CompositionViewer manifest={comp} />
        </div>
      )}
      createModalTemplate={COMPOSITION_TEMPLATE}
    />
  );
};
