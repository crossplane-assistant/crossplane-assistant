import React from 'react';
import { Clock, Layers, Sparkles } from 'lucide-react';
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
    {
      header: 'Workspace Access',
      render: (comp: any) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/explore/compositions/${comp.metadata?.name}`}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all hover:scale-[1.02]"
            title="Standard Tree View"
          >
            <Layers className="w-3.5 h-3.5" /> Workspace
          </Link>
          <Link
            to={`/explore/compositions/${comp.metadata?.name}?view=canvas`}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all hover:scale-[1.02]"
            title="Visual Composition Builder"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Visual
          </Link>
          <Link
            to={`/explore/compositions/${comp.metadata?.name}?selected=sandbox`}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all hover:scale-[1.02]"
            title="Dry-Run Sandbox"
          >
            <span className="text-xs">🧪</span> Sandbox
          </Link>
        </div>
      ),
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
          <div className="flex items-center justify-between px-4 pt-2 border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workspace Quick Links</span>
            <div className="flex items-center gap-2">
              <Link
                to={`/explore/compositions/${comp.metadata?.name}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all hover:shadow-md cursor-pointer border border-blue-500 hover:border-blue-600"
              >
                <Layers className="w-3.5 h-3.5" /> Tree Workspace
              </Link>
              <Link
                to={`/explore/compositions/${comp.metadata?.name}?view=canvas`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all hover:shadow-md cursor-pointer border border-indigo-500 hover:border-indigo-600"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Visual Builder
              </Link>
              <Link
                to={`/explore/compositions/${comp.metadata?.name}?selected=sandbox`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all hover:shadow-md cursor-pointer border border-amber-500 hover:border-amber-600"
              >
                🧪 Dry-Run Sandbox
              </Link>
            </div>
          </div>
          <CompositionViewer manifest={comp} />
        </div>
      )}
      createModalTemplate={COMPOSITION_TEMPLATE}
    />
  );
};
