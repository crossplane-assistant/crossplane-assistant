import React from 'react';
import { useCompositionDependencies } from '../queries/useCompositionQueries';
import { DynamicResourceViewer } from './DynamicResourceViewer';

interface CompositionViewerProps {
  manifest: any;
}

export const CompositionViewer: React.FC<CompositionViewerProps> = ({ manifest }) => {
  const name = manifest?.metadata?.name;
  const { data: graph, isLoading, error } = useCompositionDependencies(name);

  if (isLoading) {
    return <div className="p-4 text-center text-slate-500 animate-pulse font-medium">Loading dependencies graph...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center border border-red-200 bg-red-50 rounded-lg">Error loading graph: {(error as Error).message}</div>;
  }

  if (!manifest?.spec?.resources) {
    return <div className="text-slate-500 italic p-4 bg-slate-50 border border-slate-150 rounded-lg">No resources found in composition spec.</div>;
  }

  return (
    <div className="space-y-4">
      {manifest.spec.resources.map((resource: any, idx: number) => (
        <DynamicResourceViewer
          key={resource.name || idx}
          context={{
            graph,
            resource,
            resourceIndex: idx,
            composition: manifest,
          }}
        />
      ))}
    </div>
  );
};
