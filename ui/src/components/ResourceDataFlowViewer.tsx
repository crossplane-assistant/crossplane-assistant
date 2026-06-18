import React from 'react';
import { ResourceContext } from '../types';
import { ArrowRight, CornerDownRight, Zap, RefreshCw } from 'lucide-react';

interface ResourceDataFlowViewerProps {
  context: ResourceContext;
}

export const ResourceDataFlowViewer: React.FC<ResourceDataFlowViewerProps> = ({ context }) => {
  const { resource, composition } = context;
  const rawPatches = resource?.patches || [];

  // Helper to resolve patch sets
  const resolvePatches = (patchesList: any[]): any[] => {
    const resolved: any[] = [];
    const patchSets = composition?.spec?.patchSets || [];

    patchesList.forEach((p) => {
      if (p.type === 'PatchSet' && p.patchSetName) {
        const foundSet = patchSets.find((ps: any) => ps.name === p.patchSetName);
        if (foundSet && foundSet.patches) {
          // Resolve subpatches recursively
          resolved.push(...resolvePatches(foundSet.patches.map((sub: any) => ({
            ...sub,
            // Track source patch set for UI info
            sourcePatchSet: p.patchSetName,
          }))));
        }
      } else {
        resolved.push(p);
      }
    });
    return resolved;
  };

  const resolvedPatches = resolvePatches(rawPatches);

  // Categorize patches
  const incoming = resolvedPatches.filter(
    (p) => p.type === 'FromCompositeFieldPath' || p.type === 'CombineFromComposite' || !p.type
  );
  const outgoing = resolvedPatches.filter(
    (p) => p.type === 'ToCompositeFieldPath' || p.type === 'CombineToComposite'
  );

  const renderTransformations = (p: any) => {
    if (!p.transforms || p.transforms.length === 0) return null;
    return (
      <div className="mt-1.5 flex flex-wrap gap-1.5 items-center text-[10px] text-slate-500 font-mono">
        <span className="text-slate-400 flex items-center gap-0.5">
          <RefreshCw className="w-2.5 h-2.5" /> Transforms:
        </span>
        {p.transforms.map((t: any, idx: number) => {
          let label = t.type;
          if (t.type === 'map' && t.map) {
            label = `map (${Object.keys(t.map).length} values)`;
          } else if (t.type === 'string' && t.string?.fmt) {
            label = `string (${t.string.fmt})`;
          } else if (t.type === 'convert' && t.convert?.toType) {
            label = `convert to ${t.convert.toType}`;
          }
          return (
            <span key={idx} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/55 rounded font-bold">
              {label}
            </span>
          );
        })}
      </div>
    );
  };

  if (resolvedPatches.length === 0) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-150 rounded-lg text-slate-400 italic text-center text-xs">
        No patch-based value exchanges configured for this resource.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-slate-50 border border-slate-150 rounded-lg max-h-[400px] overflow-y-auto">
      {/* Incoming Patches (Composite -> Resource) */}
      {incoming.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <CornerDownRight className="w-3.5 h-3.5 text-blue-500" /> Incoming Inputs (XRD  <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" /> Resource)
          </div>
          <div className="space-y-2">
            {incoming.map((p, idx) => {
              const isCombine = p.type === 'CombineFromComposite';
              const fromSources = isCombine
                ? p.combine?.variables?.map((v: any) => v.fromFieldPath) || []
                : [p.fromFieldPath || 'unknown'];
              const toDest = p.toFieldPath || 'unknown';

              return (
                <div key={idx} className="p-3 bg-white border border-slate-150 rounded-lg shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      {fromSources.map((src: string, sIdx: number) => (
                        <div key={sIdx} className="font-mono text-[10px] text-blue-600 bg-blue-50/50 border border-blue-100/60 px-2 py-0.5 rounded truncate font-bold animate-fadeIn" title={src}>
                          {src}
                        </div>
                      ))}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="font-mono text-[10px] text-slate-700 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded truncate font-bold min-w-0 flex-1 animate-fadeIn" title={toDest}>
                      {toDest}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                      {p.type || 'FromCompositeFieldPath'}
                    </span>
                    {p.sourcePatchSet && (
                      <span className="text-[9px] text-indigo-500 font-mono bg-indigo-50 px-1 py-0.5 rounded font-bold border border-indigo-100 animate-fadeIn">
                        PatchSet: {p.sourcePatchSet}
                      </span>
                    )}
                  </div>
                  {renderTransformations(p)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outgoing Patches (Resource -> Composite) */}
      {outgoing.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Outgoing Outputs (Resource <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" /> XRD Status)
          </div>
          <div className="space-y-2">
            {outgoing.map((p, idx) => {
              const fromSources = [p.fromFieldPath || 'unknown'];
              const toDest = p.toFieldPath || 'unknown';

              return (
                <div key={idx} className="p-3 bg-white border border-slate-150 rounded-lg shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-[10px] text-slate-700 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded truncate font-bold min-w-0 flex-1 animate-fadeIn" title={fromSources[0]}>
                      {fromSources[0]}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="font-mono text-[10px] text-amber-600 bg-amber-50/50 border border-amber-100/60 px-2 py-0.5 rounded truncate font-bold min-w-0 flex-1 animate-fadeIn" title={toDest}>
                      {toDest}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                      {p.type || 'ToCompositeFieldPath'}
                    </span>
                    {p.sourcePatchSet && (
                      <span className="text-[9px] text-indigo-500 font-mono bg-indigo-50 px-1 py-0.5 rounded font-bold border border-indigo-100 animate-fadeIn">
                        PatchSet: {p.sourcePatchSet}
                      </span>
                    )}
                  </div>
                  {renderTransformations(p)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
