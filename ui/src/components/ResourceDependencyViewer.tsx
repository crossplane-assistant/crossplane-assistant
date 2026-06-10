import React, { useState } from 'react';
import { ResourceContext } from '../types';
import { InOutBuilder } from '../utils/resource-graph-builder';
import { LogoViewer } from './LogoViewer';

interface ResourceDependencyViewerProps {
  context: ResourceContext;
}

export const ResourceDependencyViewer: React.FC<ResourceDependencyViewerProps> = ({ context }) => {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  if (!context.graph) {
    return <div className="text-slate-400 text-sm italic">No dependency graph available</div>;
  }

  const builder = new InOutBuilder(context.graph);
  const resourceDeps = builder.build(context.resourceIndex);

  if (!resourceDeps || (resourceDeps.in.length === 0 && resourceDeps.out.length === 0)) {
    return <div className="text-slate-400 text-sm italic">No dependencies found</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 bg-slate-50 border border-slate-150 rounded-lg">
      <div className="flex items-stretch justify-center gap-10">
        {/* INCOMING DEPENDENCIES */}
        <div className="flex flex-col justify-center items-end gap-2 min-w-[200px]">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 self-center">Depends On</div>
          {resourceDeps.in.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedItem(item)}
              className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 text-left border border-slate-200 rounded-lg shadow-sm w-full transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 flex-shrink-0">
                <LogoViewer apiVersion={item.apiVersion} kind={item.kind} />
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-xs text-slate-800 truncate">{item.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{item.kind}</div>
              </div>
            </button>
          ))}
          {resourceDeps.in.length === 0 && (
            <div className="text-xs text-slate-400 italic text-center w-full">None</div>
          )}
        </div>

        {/* ACTIVE RESOURCE */}
        <div className="flex flex-col justify-center items-center gap-2 min-w-[200px]">
          <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Current Resource</div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 border-2 border-blue-400 rounded-lg shadow-md w-full">
            <div className="w-8 h-8 flex-shrink-0">
              <LogoViewer
                apiVersion={resourceDeps.resource?.base?.apiVersion}
                kind={resourceDeps.resource?.base?.kind}
              />
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs text-blue-800 truncate">{resourceDeps.resource?.name}</div>
              <div className="text-[10px] text-blue-600 truncate">{resourceDeps.resource?.base?.kind}</div>
            </div>
          </div>
        </div>

        {/* OUTGOING DEPENDENCIES */}
        <div className="flex flex-col justify-center items-start gap-2 min-w-[200px]">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 self-center">Triggers</div>
          {resourceDeps.out.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedItem(item)}
              className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 text-left border border-slate-200 rounded-lg shadow-sm w-full transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 flex-shrink-0">
                <LogoViewer apiVersion={item.apiVersion} kind={item.kind} />
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-xs text-slate-800 truncate">{item.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{item.kind}</div>
              </div>
            </button>
          ))}
          {resourceDeps.out.length === 0 && (
            <div className="text-xs text-slate-400 italic text-center w-full">None</div>
          )}
        </div>
      </div>

      {/* Dependency detail drawer/card */}
      {selectedItem && (
        <div className="mt-4 p-4 border-t border-slate-200 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dependency Details</h4>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded border border-slate-200 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="font-semibold text-slate-500">Name:</span> <span className="text-slate-800 font-mono">{selectedItem.name}</span></div>
            <div><span className="font-semibold text-slate-500">Kind:</span> <span className="text-slate-800 font-mono">{selectedItem.kind}</span></div>
            <div className="col-span-2"><span className="font-semibold text-slate-500">ApiVersion:</span> <span className="text-slate-800 font-mono">{selectedItem.apiVersion}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
