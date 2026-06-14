import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { updateYAMLPath } from '../utils/compositionParser';

interface TransformInspectorProps {
  selectedEdge: any; // React Flow Edge containing patch data
  yamlString: string;
  onYamlChange: (newYaml: string) => void;
  onClose: () => void;
}

export const TransformInspector: React.FC<TransformInspectorProps> = ({
  selectedEdge,
  yamlString,
  onYamlChange,
  onClose,
}) => {
  const edgeData = selectedEdge?.data || {};
  const patch = edgeData.patch || {};
  const resourceId = edgeData.resourceId || '';
  const transforms = patch.transforms || [];

  const [testInput, setTestInput] = useState<string>('us-east');
  const [testOutput, setTestOutput] = useState<string>('');

  // Live evaluation of transforms in JavaScript
  useEffect(() => {
    let currentVal: any = testInput;

    for (const t of transforms) {
      if (!t) continue;

      if (t.type === 'map' && t.map) {
        if (t.map[currentVal] !== undefined) {
          currentVal = t.map[currentVal];
        } else if (t.map.default !== undefined) {
          currentVal = t.map.default;
        }
      } else if (t.type === 'string' && t.string) {
        const fmt = t.string.fmt || '%s';
        currentVal = fmt.replace('%s', String(currentVal));
      } else if (t.type === 'math' && t.math) {
        const num = parseFloat(currentVal);
        if (!isNaN(num)) {
          if (t.math.multiply !== undefined) {
            currentVal = num * t.math.multiply;
          } else if (t.math.add !== undefined) {
            currentVal = num + t.math.add;
          }
        }
      }
    }

    setTestOutput(String(currentVal));
  }, [testInput, transforms]);

  const updateTransforms = (newTransforms: any[]) => {
    const patchAstPath = patch.astPath;
    if (!patchAstPath) return;

    // The astPath of the patch is e.g. ["spec", "resources", 0, "patches", 1]
    // We want to update the 'transforms' field of this patch:
    const transformsPath = [...patchAstPath, 'transforms'];
    const updatedYaml = updateYAMLPath(yamlString, transformsPath, newTransforms);
    onYamlChange(updatedYaml);
  };

  const handleAddTransform = (type: 'map' | 'string' | 'math') => {
    let newStep: any = {};
    if (type === 'map') {
      newStep = { type: 'map', map: { 'us-east': 'ue1', 'us-west': 'uw1' } };
    } else if (type === 'string') {
      newStep = { type: 'string', string: { fmt: 'infra-%s-storage' } };
    } else if (type === 'math') {
      newStep = { type: 'math', math: { multiply: 10 } };
    }

    const updated = [...transforms, newStep];
    updateTransforms(updated);
  };

  const handleDeleteTransform = (index: number) => {
    const updated = [...transforms];
    updated.splice(index, 1);
    updateTransforms(updated);
  };

  const handleUpdateStep = (index: number, updatedStep: any) => {
    const updated = [...transforms];
    updated[index] = updatedStep;
    updateTransforms(updated);
  };

  return (
    <div className="w-80 border-l border-slate-200 bg-white h-full flex flex-col shadow-xl overflow-hidden animate-slideInRight">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="truncate max-w-[200px]">
          <h3 className="font-extrabold text-sm text-slate-800">Transform Inspector</h3>
          <p className="text-[10px] text-slate-400 font-mono truncate">{resourceId} patch</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body / Stackable Blocks */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patch Info</span>
          <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg font-mono text-[10px] text-slate-600 space-y-1">
            <div><span className="text-slate-400">Type:</span> {patch.type}</div>
            {patch.fromFieldPath && <div><span className="text-slate-400">From:</span> {patch.fromFieldPath}</div>}
            {patch.toFieldPath && <div><span className="text-slate-400">To:</span> {patch.toFieldPath}</div>}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transform Steps</span>
            <span className="text-[10px] text-slate-400 italic">Sequential (top to bottom)</span>
          </div>

          {transforms.length === 0 ? (
            <div className="p-4 border border-dashed rounded-xl text-center italic text-xs text-slate-400 bg-slate-50/30">
              No transforms defined yet. Click below to add one!
            </div>
          ) : (
            <div className="space-y-3">
              {transforms.map((t: any, index: number) => {
                if (!t) return null;
                return (
                  <div key={index} className="p-3 border border-slate-150 rounded-xl bg-white shadow-2xs space-y-2.5 relative group">
                    <button
                      onClick={() => handleDeleteTransform(index)}
                      className="absolute top-2 right-2 p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {t.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Step {index + 1}</span>
                    </div>

                    {t.type === 'string' && t.string && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500">Format String</label>
                        <input
                          type="text"
                          value={t.string.fmt || ''}
                          onChange={(e) =>
                            handleUpdateStep(index, {
                              ...t,
                              string: { ...t.string, fmt: e.target.value },
                            })
                          }
                          className="w-full text-xs font-mono px-2 py-1 bg-slate-50 border rounded border-slate-200 outline-none focus:border-indigo-300"
                        />
                      </div>
                    )}

                    {t.type === 'math' && t.math && (
                      <div className="grid grid-cols-2 gap-2">
                        {t.math.multiply !== undefined ? (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">Multiply By</label>
                            <input
                              type="number"
                              value={t.math.multiply}
                              onChange={(e) =>
                                handleUpdateStep(index, {
                                  ...t,
                                  math: { ...t.math, multiply: parseFloat(e.target.value) || 1 },
                                })
                              }
                              className="w-full text-xs font-mono px-2 py-1 bg-slate-50 border rounded border-slate-200 outline-none focus:border-indigo-300"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">Add Value</label>
                            <input
                              type="number"
                              value={t.math.add || 0}
                              onChange={(e) =>
                                handleUpdateStep(index, {
                                  ...t,
                                  math: { ...t.math, add: parseFloat(e.target.value) || 0 },
                                })
                              }
                              className="w-full text-xs font-mono px-2 py-1 bg-slate-50 border rounded border-slate-200 outline-none focus:border-indigo-300"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {t.type === 'map' && t.map && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500">Key-Value Map</label>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {Object.entries(t.map)
                            .filter(([key]) => key !== 'default')
                            .map(([key, val]) => (
                              <div key={key} className="flex gap-1 items-center">
                                <input
                                  type="text"
                                  disabled
                                  value={key}
                                  className="w-1/2 text-xs font-mono px-1.5 py-0.5 bg-slate-50 border rounded border-slate-200"
                                />
                                <span className="text-slate-400 text-xs font-bold">➔</span>
                                <input
                                  type="text"
                                  value={String(val)}
                                  onChange={(e) => {
                                    const newMap = { ...t.map, [key]: e.target.value };
                                    handleUpdateStep(index, { ...t, map: newMap });
                                  }}
                                  className="w-1/2 text-xs font-mono px-1.5 py-0.5 bg-white border rounded border-slate-250 focus:border-indigo-300 outline-none"
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Actions */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Step</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAddTransform('string')}
              className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
            >
              <Plus className="w-3 h-3 text-indigo-500" /> String
            </button>
            <button
              onClick={() => handleAddTransform('map')}
              className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
            >
              <Plus className="w-3 h-3 text-indigo-500" /> Map
            </button>
            <button
              onClick={() => handleAddTransform('math')}
              className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border rounded-lg text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
            >
              <Plus className="w-3 h-3 text-indigo-500" /> Math
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          ⚡ Real-time Transform Preview
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] font-semibold text-slate-400 block mb-0.5">Test Input</label>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="w-full text-xs font-mono px-2 py-1 bg-white border border-slate-200 rounded outline-none focus:border-indigo-300"
            />
          </div>
          <div>
            <label className="text-[9px] font-semibold text-slate-400 block mb-0.5">Live Output</label>
            <input
              type="text"
              readOnly
              value={testOutput}
              className="w-full text-xs font-mono px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
