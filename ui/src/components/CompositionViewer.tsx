import React, { useState } from 'react';
import { useCompositionDependencies } from '../queries/useCompositionQueries';
import { DynamicResourceViewer } from './DynamicResourceViewer';
import { ResourcePanel } from './ResourcePanel';
import MonacoEditor from '@monaco-editor/react';
import { stringify } from 'yaml';
import { Cpu, Layers } from 'lucide-react';

interface CompositionViewerProps {
  manifest: any;
}

export const CompositionViewer: React.FC<CompositionViewerProps> = ({ manifest }) => {
  const name = manifest?.metadata?.name;
  const { data: graph, isLoading, error } = useCompositionDependencies(name);

  const pipeline = manifest?.spec?.pipeline || [];
  const resources = manifest?.spec?.resources || [];
  const compositeType = manifest?.spec?.compositeTypeRef;

  const totalItems = pipeline.length > 0 ? pipeline.length : resources.length;
  
  // State for expand all / collapse all versions
  const [expandVersion, setExpandKey] = useState(0);
  const [defaultExpanded, setDefaultExpanded] = useState(totalItems <= 3);

  // Precompute global indices for pipeline resources
  let globalResourceCounter = 0;
  const pipelineStepsWithResources = pipeline.map((step: any) => {
    const isPatchAndTransform = step.functionRef?.name?.toLowerCase().includes('patch-and-transform') || false;
    const stepResources = isPatchAndTransform ? (step.input?.resources || []) : [];
    
    const resourcesWithGlobalIndices = stepResources.map((resource: any) => {
      const globalIndex = globalResourceCounter;
      globalResourceCounter++;
      return {
        resource,
        globalIndex,
      };
    });
    
    return {
      ...step,
      resourcesWithGlobalIndices,
    };
  });

  if (isLoading) {
    return <div className="p-4 text-center text-slate-500 animate-pulse font-medium">Loading dependencies graph...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center border border-red-200 bg-red-50 rounded-lg">Error loading graph: {(error as Error).message}</div>;
  }

  if (resources.length === 0 && pipeline.length === 0) {
    return <div className="text-slate-500 italic p-4 bg-slate-50 border border-slate-150 rounded-lg">No resources or pipeline steps found in composition spec.</div>;
  }

  const handleExpandAll = () => {
    setDefaultExpanded(true);
    setExpandKey((prev) => prev + 1);
  };

  const handleCollapseAll = () => {
    setDefaultExpanded(false);
    setExpandKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* XRD Interface Banner */}
      {compositeType && (
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-700">Implements XRD Signature:</span>
          </div>
          <span className="font-mono bg-blue-100/55 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200/50">
            {compositeType.kind} ({compositeType.apiVersion})
          </span>
        </div>
      )}

      {/* Global Expand/Collapse controls */}
      <div className="flex justify-end gap-2 text-xs">
        <button
          onClick={handleExpandAll}
          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-md font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer shadow-xs"
        >
          Expand All
        </button>
        <button
          onClick={handleCollapseAll}
          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-md font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer shadow-xs"
        >
          Collapse All
        </button>
      </div>

      {/* Content Rendering */}
      {pipeline.length > 0 ? (
        <div className="space-y-4">
          {pipelineStepsWithResources.map((step: any, idx: number) => {
            const stepName = step.step || `step-${idx}`;
            const functionName = step.functionRef?.name || 'unknown-function';
            const yamlInput = step.input ? stringify(step.input) : '';

            // Construct virtual resource structure for ResourcePanel header compatibility
            const virtualResource = {
              name: stepName,
              base: {
                apiVersion: `Function: ${functionName}`,
                kind: 'Pipeline Step',
              },
            };

            return (
              <ResourcePanel
                key={`${stepName}-${expandVersion}`}
                resourceType="function"
                resource={virtualResource}
                defaultOpen={defaultExpanded}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium pb-2 border-b border-slate-100">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-slate-400" /> Function Reference:
                      </span>
                      <span className="font-mono font-bold text-slate-600 bg-slate-50 px-1 py-0.5 border border-slate-100 rounded">
                        {functionName}
                      </span>
                    </div>
                    {step.input ? (
                      <div className="h-[250px] border border-slate-200 rounded-lg overflow-hidden shadow-inner bg-white mt-2">
                        <MonacoEditor
                          height="100%"
                          language="yaml"
                          theme="vs-light"
                          value={yamlInput}
                          options={{ readOnly: true, minimap: { enabled: false } }}
                        />
                      </div>
                    ) : (
                      <div className="text-center italic text-slate-400 text-xs py-4">
                        No configuration input parameters defined for this step.
                      </div>
                    )}
                  </div>

                  {/* Render extracted resources if any */}
                  {step.resourcesWithGlobalIndices && step.resourcesWithGlobalIndices.length > 0 && (
                    <div className="mt-4 border-t border-slate-150 pt-4 space-y-4 bg-slate-50/40 p-4 rounded-xl border">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-500" /> Composed Resources ({step.resourcesWithGlobalIndices.length})
                      </h4>
                      <div className="space-y-4">
                        {step.resourcesWithGlobalIndices.map(({ resource, globalIndex }: any) => (
                          <div key={`${resource.name || globalIndex}-${expandVersion}`}>
                            <DynamicResourceViewer
                              context={{
                                graph,
                                resource,
                                resourceIndex: globalIndex,
                                composition: manifest,
                                defaultOpen: defaultExpanded,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ResourcePanel>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((resource: any, idx: number) => (
            <div key={`${resource.name || idx}-${expandVersion}`}>
              <DynamicResourceViewer
                context={{
                  graph,
                  resource,
                  resourceIndex: idx,
                  composition: manifest,
                  // We inject defaultOpen directly into resource contexts
                  defaultOpen: defaultExpanded,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
