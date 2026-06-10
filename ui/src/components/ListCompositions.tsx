import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import MonacoEditor from '@monaco-editor/react';
import { stringify } from 'yaml';
import { Link2, Plus, Trash2, BookOpen, Layers, Clock, X } from 'lucide-react';
import { useCompositions, useDeleteComposition } from '../queries/useCompositionQueries';
import { CompositionViewer } from './CompositionViewer';

export const ListCompositions: React.FC = () => {
  const { data: compositions = [], isLoading, error } = useCompositions();
  const deleteMutation = useDeleteComposition();
  const [selectedComposition, setSelectedComposition] = useState<any | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<string>('view');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete composition ${name}?`)) {
      deleteMutation.mutate(name, {
        onSuccess: () => {
          setSelectedComposition(null);
        },
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse font-semibold">Loading Compositions...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 border border-red-200 rounded-xl max-w-2xl mx-auto mt-10">
        <h3 className="font-bold text-lg">Error Loading Compositions</h3>
        <p className="mt-1 text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 relative">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-900">
            <Link2 className="w-8 h-8 text-blue-500" /> Compositions
          </h1>
          <p className="text-sm text-slate-500 max-w-3xl">
            List of compositions installed on the cluster. You can find more information about compositions on the official{' '}
            <a
              href="https://docs.crossplane.io/latest/concepts/compositions/"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline inline-flex items-center gap-1 font-medium"
            >
              documentation <BookOpen className="w-3.5 h-3.5" />
            </a>.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" /> Create Composite
        </button>
      </div>

      {/* Compositions Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <th className="p-4">Name</th>
              <th className="p-4">Kind</th>
              <th className="p-4">Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {compositions.map((comp, idx) => {
              const name = comp.metadata?.name || '';
              const kind = comp.spec?.compositeTypeRef?.kind || 'Composite';
              const created = comp.metadata?.creationTimestamp
                ? new Date(comp.metadata.creationTimestamp).toLocaleDateString()
                : 'Unknown';

              return (
                <tr
                  key={name || idx}
                  onClick={() => {
                    setSelectedComposition(comp);
                    setActiveDetailTab('view');
                  }}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    selectedComposition?.metadata?.name === name ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <td className="p-4 font-semibold text-blue-600 font-mono">{name}</td>
                  <td className="p-4 font-medium text-slate-500">{kind}</td>
                  <td className="p-4 text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {created}
                  </td>
                </tr>
              );
            })}
            {compositions.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-400 italic bg-slate-50/50">
                  No compositions found in the cluster.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-out Sliding Panel for Composition Detail */}
      {selectedComposition && (
        <div className="fixed inset-y-0 right-0 w-[650px] bg-white shadow-2xl border-l border-slate-200 flex flex-col z-50 animate-slideIn">
          {/* Panel Header */}
          <div className="p-6 border-b border-slate-150 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link2 className="w-6 h-6 text-blue-500" />
              <span className="font-extrabold text-slate-800 text-lg font-mono">
                {selectedComposition.metadata?.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDelete(selectedComposition.metadata?.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button
                onClick={() => setSelectedComposition(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Panel Tabs & Content */}
          <Tabs.Root
            value={activeDetailTab}
            onValueChange={setActiveDetailTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <Tabs.List className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-6">
              <Tabs.Trigger
                value="view"
                className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 focus:outline-none cursor-pointer transition-colors"
              >
                View
              </Tabs.Trigger>
              <Tabs.Trigger
                value="manifest"
                className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 focus:outline-none cursor-pointer transition-colors"
              >
                Manifest
              </Tabs.Trigger>
              <Tabs.Trigger
                value="event"
                className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 focus:outline-none cursor-pointer transition-colors"
              >
                Event
              </Tabs.Trigger>
            </Tabs.List>

            <div className="flex-1 overflow-y-auto p-6">
              <Tabs.Content value="view" className="animate-fadeIn">
                <CompositionViewer manifest={selectedComposition} />
              </Tabs.Content>

              <Tabs.Content value="manifest" className="h-[450px] border border-slate-200 rounded-lg overflow-hidden shadow-inner">
                <MonacoEditor
                  height="100%"
                  language="yaml"
                  theme="vs-light"
                  value={stringify(selectedComposition)}
                  options={{ readOnly: true, minimap: { enabled: false } }}
                />
              </Tabs.Content>

              <Tabs.Content value="event" className="animate-fadeIn space-y-4">
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Resource Events</div>
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 italic text-center text-xs">
                  No recent events for this composition.
                </div>
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>
      )}

      {/* Simple Mock Create Composition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 border border-slate-100 relative">
            <div className="flex justify-between items-center border-b border-slate-150 pb-4 mb-4">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" /> Create Composite Composition
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                You can specify raw Kubernetes/Crossplane JSON or YAML definition below to create a Composition.
              </p>
              <div className="h-[250px] border border-slate-200 rounded-lg overflow-hidden shadow-inner">
                <MonacoEditor
                  height="100%"
                  language="yaml"
                  theme="vs-light"
                  defaultValue={`apiVersion: apiextensions.crossplane.io/v1\nkind: Composition\nmetadata:\n  name: xpostgres-custom\nspec:\n  compositeTypeRef:\n    apiVersion: database.example.org/v1alpha1\n    kind: XPostgreSQLInstance\n  resources:\n    - name: postgres-db\n      base:\n        apiVersion: kubernetes.crossplane.io/v1alpha1\n        kind: Object\n        spec:\n          forProvider:\n            manifest:\n              apiVersion: v1\n              kind: ConfigMap\n              metadata:\n                name: custom-db-config\n`}
                  options={{ minimap: { enabled: false } }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-150">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 text-sm font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Created composition successfully (Mocked)!');
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm cursor-pointer transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
