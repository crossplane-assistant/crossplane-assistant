import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  Handle,
  useNodesState,
  useEdgesState,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { parseYAMLToIR, updateYAMLPath } from '../utils/compositionParser';
import { Database, ArrowRightLeft, ArrowLeftRight } from 'lucide-react';

export interface ActiveAttribute {
  nodeId: string;
  field: string;
  isLocked: boolean;
}

// Custom Node for XRD Composite Input
export const CompositeInputNode: React.FC<{ data: any }> = ({ data }) => {
  const fields = data.fields || [];
  const activeAttribute = data.activeAttribute as ActiveAttribute | null;
  const highlightedFields = data.highlightedFields as Set<string> | undefined;

  const isAnyActive = activeAttribute !== null;

  return (
    <div className="bg-slate-900 border-2 border-slate-700 text-white rounded-xl shadow-xl w-64 overflow-hidden">
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
        <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
        <div>
          <h4 className="font-bold text-sm tracking-wide">Composite Input (XRD)</h4>
          <p className="text-xs text-slate-400">{data.kind || 'XComposite'}</p>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {fields.length === 0 ? (
          <div className="text-xs text-slate-500 italic text-center py-2">
            No fields mapped. Drag a connection!
          </div>
        ) : (
          fields.map((field: string) => {
            const isThisActive = activeAttribute?.nodeId === 'composite-input' && activeAttribute?.field === field;
            const isLinked = highlightedFields?.has(field) && !isThisActive;
            const isDimmed = isAnyActive && !isThisActive && !isLinked;

            const containerClasses = `
              relative flex items-center justify-between text-xs py-1 px-2 rounded border transition-all duration-200 nodrag cursor-pointer select-none
              ${isThisActive ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 font-semibold ring-2 ring-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.4)]' : ''}
              ${isLinked ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-semibold shadow-[0_0_8px_rgba(16,185,129,0.3)]' : ''}
              ${isDimmed ? 'opacity-25 border-transparent text-slate-600' : ''}
              ${!isAnyActive ? 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60' : ''}
            `;

            const handleClasses = `
              w-3 h-3 border-2 transition-all duration-200 !-right-1.5
              ${isThisActive ? 'bg-indigo-400 border-indigo-200 shadow-[0_0_6px_rgba(99,102,241,0.6)]' : ''}
              ${isLinked ? 'bg-emerald-400 border-emerald-200 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : ''}
              ${isDimmed ? 'opacity-25 bg-slate-600 border-slate-800' : ''}
              ${!isAnyActive ? 'bg-indigo-500 border-slate-900' : ''}
            `;

            return (
              <div
                key={field}
                className={containerClasses}
                onMouseEnter={() => data.onAttributeHoverEnter?.(field)}
                onMouseLeave={() => data.onAttributeHoverLeave?.()}
                onClick={(e) => {
                  e.stopPropagation();
                  data.onAttributeClick?.(field);
                }}
              >
                <span className="font-mono truncate max-w-[180px]" title={field}>{field}</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={field}
                  className={handleClasses}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Custom Node for Managed Resource (MR)
export const ManagedResourceNode: React.FC<{ data: any }> = ({ data }) => {
  const incoming = data.incomingFields || [];
  const outgoing = data.outgoingFields || [];
  const activeAttribute = data.activeAttribute as ActiveAttribute | null;
  const highlightedFields = data.highlightedFields as Set<string> | undefined;

  const isAnyActive = activeAttribute !== null;
  const nodeId = `mr-${data.id}`;

  return (
    <div className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-800 rounded-xl shadow-xl w-64 overflow-hidden transition-all">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <Database className="w-5 h-5 text-emerald-500" />
        <div>
          <h4 className="font-bold text-sm text-slate-900 truncate max-w-[180px]" title={data.id}>{data.id}</h4>
          <p className="text-xs text-slate-500 truncate max-w-[180px]">{data.kind}</p>
        </div>
      </div>
      <div className="p-3 space-y-3">
        {/* Incoming Fields (Target handles) */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Inputs (Patches)</div>
          {incoming.length === 0 ? (
            <div className="text-[11px] text-slate-400 italic py-1 pl-1 relative">
              None
              <Handle
                type="target"
                position={Position.Left}
                id="default-target"
                className={`w-2 h-2 bg-slate-400 border border-white !-left-1.5 ${isAnyActive ? 'opacity-25' : ''}`}
              />
            </div>
          ) : (
            incoming.map((field: string) => {
              const isThisActive = activeAttribute?.nodeId === nodeId && activeAttribute?.field === field;
              const isLinked = highlightedFields?.has(field) && !isThisActive;
              const isDimmed = isAnyActive && !isThisActive && !isLinked;

              const containerClasses = `
                relative flex items-center text-xs py-1 px-2 rounded border transition-all duration-200 nodrag cursor-pointer select-none
                ${isThisActive ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold ring-2 ring-indigo-400/30' : ''}
                ${isLinked ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold shadow-[0_0_8px_rgba(16,185,129,0.2)]' : ''}
                ${isDimmed ? 'opacity-25 border-transparent text-slate-400' : ''}
                ${!isAnyActive ? 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-100/50' : ''}
              `;

              const handleClasses = `
                w-3 h-3 border-2 transition-all duration-200 !-left-1.5
                ${isThisActive ? 'bg-indigo-400 border-indigo-200 shadow-[0_0_6px_rgba(99,102,241,0.6)]' : ''}
                ${isLinked ? 'bg-emerald-400 border-emerald-200 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : ''}
                ${isDimmed ? 'opacity-25 bg-slate-300 border-slate-100' : ''}
                ${!isAnyActive ? 'bg-indigo-400 border-white' : ''}
              `;

              return (
                <div
                  key={field}
                  className={containerClasses}
                  onMouseEnter={() => data.onAttributeHoverEnter?.(field)}
                  onMouseLeave={() => data.onAttributeHoverLeave?.()}
                  onClick={(e) => {
                    e.stopPropagation();
                    data.onAttributeClick?.(field);
                  }}
                >
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={field}
                    className={handleClasses}
                  />
                  <span className="font-mono truncate pl-1 max-w-[180px]" title={field}>{field}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Outgoing Fields (Source handles) */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Outputs (Status)</div>
          {outgoing.length === 0 ? (
            <div className="text-[11px] text-slate-400 italic py-1 pl-1 relative">
              None
              <Handle
                type="source"
                position={Position.Right}
                id="default-source"
                className={`w-2 h-2 bg-slate-400 border border-white !-right-1.5 ${isAnyActive ? 'opacity-25' : ''}`}
              />
            </div>
          ) : (
            outgoing.map((field: string) => {
              const isThisActive = activeAttribute?.nodeId === nodeId && activeAttribute?.field === field;
              const isLinked = highlightedFields?.has(field) && !isThisActive;
              const isDimmed = isAnyActive && !isThisActive && !isLinked;

              const containerClasses = `
                relative flex items-center justify-between text-xs py-1 px-2 rounded border transition-all duration-200 nodrag cursor-pointer select-none
                ${isThisActive ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold ring-2 ring-indigo-400/30' : ''}
                ${isLinked ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold shadow-[0_0_8px_rgba(16,185,129,0.2)]' : ''}
                ${isDimmed ? 'opacity-25 border-transparent text-slate-400' : ''}
                ${!isAnyActive ? 'bg-emerald-50/50 border-emerald-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50' : ''}
              `;

              const handleClasses = `
                w-3 h-3 border-2 transition-all duration-200 !-right-1.5
                ${isThisActive ? 'bg-indigo-400 border-indigo-200 shadow-[0_0_6px_rgba(99,102,241,0.6)]' : ''}
                ${isLinked ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : ''}
                ${isDimmed ? 'opacity-25 bg-slate-300 border-slate-100' : ''}
                ${!isAnyActive ? 'bg-emerald-500 border-white' : ''}
              `;

              return (
                <div
                  key={field}
                  className={containerClasses}
                  onMouseEnter={() => data.onAttributeHoverEnter?.(field)}
                  onMouseLeave={() => data.onAttributeHoverLeave?.()}
                  onClick={(e) => {
                    e.stopPropagation();
                    data.onAttributeClick?.(field);
                  }}
                >
                  <span className="font-mono truncate pr-1 max-w-[180px]" title={field}>{field}</span>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={field}
                    className={handleClasses}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Custom Node for XRD Composite Status Output
export const CompositeOutputNode: React.FC<{ data: any }> = ({ data }) => {
  const fields = data.fields || [];
  const activeAttribute = data.activeAttribute as ActiveAttribute | null;
  const highlightedFields = data.highlightedFields as Set<string> | undefined;

  const isAnyActive = activeAttribute !== null;

  return (
    <div className="bg-emerald-950 border-2 border-emerald-800 text-white rounded-xl shadow-xl w-64 overflow-hidden">
      <div className="bg-emerald-900 px-4 py-3 border-b border-emerald-800 flex items-center gap-2">
        <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
        <div>
          <h4 className="font-bold text-sm tracking-wide">Composite Status Output</h4>
          <p className="text-xs text-emerald-300">{data.kind || 'XComposite'}</p>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {fields.length === 0 ? (
          <div className="text-xs text-emerald-800/80 italic text-center py-2">
            No outputs mapped.
          </div>
        ) : (
          fields.map((field: string) => {
            const isThisActive = activeAttribute?.nodeId === 'composite-output' && activeAttribute?.field === field;
            const isLinked = highlightedFields?.has(field) && !isThisActive;
            const isDimmed = isAnyActive && !isThisActive && !isLinked;

            const containerClasses = `
              relative flex items-center text-xs py-1 px-2 rounded border transition-all duration-200 nodrag cursor-pointer select-none
              ${isThisActive ? 'bg-indigo-500/25 border-indigo-400 text-indigo-100 font-semibold ring-2 ring-indigo-500/30' : ''}
              ${isLinked ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100 font-semibold shadow-[0_0_8px_rgba(16,185,129,0.3)]' : ''}
              ${isDimmed ? 'opacity-25 border-transparent text-emerald-950/40' : ''}
              ${!isAnyActive ? 'bg-emerald-900/40 border-emerald-900 text-emerald-100 hover:border-emerald-800 hover:bg-emerald-900/60' : ''}
            `;

            const handleClasses = `
              w-3 h-3 border-2 transition-all duration-200 !-left-1.5
              ${isThisActive ? 'bg-indigo-400 border-indigo-200 shadow-[0_0_6px_rgba(99,102,241,0.6)]' : ''}
              ${isLinked ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : ''}
              ${isDimmed ? 'opacity-25 bg-emerald-800 border-emerald-950' : ''}
              ${!isAnyActive ? 'bg-emerald-500 border-emerald-950' : ''}
            `;

            return (
              <div
                key={field}
                className={containerClasses}
                onMouseEnter={() => data.onAttributeHoverEnter?.(field)}
                onMouseLeave={() => data.onAttributeHoverLeave?.()}
                onClick={(e) => {
                  e.stopPropagation();
                  data.onAttributeClick?.(field);
                }}
              >
                <Handle
                  type="target"
                  position={Position.Left}
                  id={field}
                  className={handleClasses}
                />
                <span className="font-mono truncate pl-1 max-w-[180px]" title={field}>{field}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Register custom node types
const nodeTypes = {
  compositeInput: CompositeInputNode,
  managedResource: ManagedResourceNode,
  compositeOutput: CompositeOutputNode,
};

interface CompositionCanvasProps {
  yamlString: string;
  onYamlChange?: (newYaml: string) => void;
  onSelectEdge?: (edge: Edge | null) => void;
}

export const CompositionCanvas: React.FC<CompositionCanvasProps> = ({
  yamlString,
  onYamlChange,
  onSelectEdge,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // State for active/hovered/clicked attribute highlighting
  const [activeAttribute, setActiveAttribute] = useState<ActiveAttribute | null>(null);

  // Map Composition IR to React Flow Nodes & Edges
  const ir = useMemo(() => parseYAMLToIR(yamlString), [yamlString]);

  // Compute active highlighting on the fly
  const { highlightedEdges, highlightedFieldsMap } = useMemo(() => {
    const highlightedEdges = new Set<string>();
    const highlightedFieldsMap: Record<string, Set<string>> = {};

    if (!activeAttribute) {
      return { highlightedEdges, highlightedFieldsMap };
    }

    edges.forEach((edge) => {
      const isSourceMatch = edge.source === activeAttribute.nodeId && edge.sourceHandle === activeAttribute.field;
      const isTargetMatch = edge.target === activeAttribute.nodeId && edge.targetHandle === activeAttribute.field;

      if (isSourceMatch || isTargetMatch) {
        highlightedEdges.add(edge.id);

        if (edge.source && edge.sourceHandle) {
          if (!highlightedFieldsMap[edge.source]) {
            highlightedFieldsMap[edge.source] = new Set();
          }
          highlightedFieldsMap[edge.source].add(edge.sourceHandle);
        }

        if (edge.target && edge.targetHandle) {
          if (!highlightedFieldsMap[edge.target]) {
            highlightedFieldsMap[edge.target] = new Set();
          }
          highlightedFieldsMap[edge.target].add(edge.targetHandle);
        }
      }
    });

    return { highlightedEdges, highlightedFieldsMap };
  }, [activeAttribute, edges]);

  // Event callbacks for active attribute tracing (stableCallback references)
  const onAttributeHoverEnter = useCallback((nodeId: string, field: string) => {
    setActiveAttribute((prev) => {
      if (prev?.isLocked) return prev;
      return { nodeId, field, isLocked: false };
    });
  }, []);

  const onAttributeHoverLeave = useCallback(() => {
    setActiveAttribute((prev) => {
      if (prev?.isLocked) return prev;
      return null;
    });
  }, []);

  const onAttributeClick = useCallback((nodeId: string, field: string) => {
    setActiveAttribute((prev) => {
      if (prev?.nodeId === nodeId && prev?.field === field && prev?.isLocked) {
        return null;
      }
      return { nodeId, field, isLocked: true };
    });
  }, []);

  const onConnect = (connection: Connection) => {
    if (!onYamlChange) return;

    const { source, sourceHandle, target, targetHandle } = connection;
    if (!source || !target || !sourceHandle || !targetHandle) return;

    // Case 1: Composite Input -> Managed Resource
    if (source === 'composite-input' && target.startsWith('mr-')) {
      const targetMrId = target.substring(3);
      const targetRes = ir.resources.find((r) => r.id === targetMrId);
      if (!targetRes) return;

      const newPatch = {
        type: 'FromCompositeFieldPath',
        fromFieldPath: sourceHandle,
        toFieldPath: targetHandle,
      };

      const existingPatches = targetRes.patches.map(p => ({
        type: p.type,
        fromFieldPath: p.fromFieldPath,
        toFieldPath: p.toFieldPath,
        combine: p.combine,
        transforms: p.transforms,
      }));

      const updatedYaml = updateYAMLPath(
        yamlString,
        [...targetRes.astPath, 'patches'],
        [...existingPatches, newPatch]
      );
      onYamlChange(updatedYaml);
    }
    // Case 2: Managed Resource -> Composite Output
    else if (source.startsWith('mr-') && target === 'composite-output') {
      const sourceMrId = source.substring(3);
      const sourceRes = ir.resources.find((r) => r.id === sourceMrId);
      if (!sourceRes) return;

      const newPatch = {
        type: 'ToCompositeFieldPath',
        fromFieldPath: sourceHandle,
        toFieldPath: targetHandle,
      };

      const existingPatches = sourceRes.patches.map(p => ({
        type: p.type,
        fromFieldPath: p.fromFieldPath,
        toFieldPath: p.toFieldPath,
        combine: p.combine,
        transforms: p.transforms,
      }));

      const updatedYaml = updateYAMLPath(
        yamlString,
        [...sourceRes.astPath, 'patches'],
        [...existingPatches, newPatch]
      );
      onYamlChange(updatedYaml);
    }
  };

  // Structural mapping - runs ONLY when the IR changes
  useEffect(() => {
    if (!ir) return;

    // Collect all unique fields mapped on XRD side
    const inputFieldsSet = new Set<string>();
    const outputFieldsSet = new Set<string>();

    ir.resources.forEach((res) => {
      res.patches.forEach((patch) => {
        if (patch.type === 'FromCompositeFieldPath' && patch.fromFieldPath) {
          inputFieldsSet.add(patch.fromFieldPath);
        } else if (patch.type === 'ToCompositeFieldPath' && patch.toFieldPath) {
          outputFieldsSet.add(patch.toFieldPath);
        }
      });
    });

    const inputFields = Array.from(inputFieldsSet);
    const outputFields = Array.from(outputFieldsSet);

    // Position setup
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // 1. Composite Input Node (XRD)
    newNodes.push({
      id: 'composite-input',
      type: 'compositeInput',
      position: { x: 50, y: 100 },
      data: {
        kind: ir.composite.kind || 'XComposite',
        fields: inputFields,
      },
    });

    // 2. Managed Resource Nodes
    ir.resources.forEach((res, idx) => {
      const incomingFields = res.patches
        .filter((p) => p.type === 'FromCompositeFieldPath' && p.toFieldPath)
        .map((p) => p.toFieldPath!);

      const outgoingFields = res.patches
        .filter((p) => p.type === 'ToCompositeFieldPath' && p.fromFieldPath)
        .map((p) => p.fromFieldPath!);

      newNodes.push({
        id: `mr-${res.id}`,
        type: 'managedResource',
        position: { x: 400, y: 50 + idx * 300 },
        data: {
          id: res.id,
          kind: res.kind,
          incomingFields,
          outgoingFields,
        },
      });

      // 3. Create Edges
      res.patches.forEach((patch, pIdx) => {
        const isInput = patch.type === 'FromCompositeFieldPath';
        const edgeId = isInput ? `edge-input-${res.id}-${pIdx}` : `edge-output-${res.id}-${pIdx}`;

        if (isInput && patch.fromFieldPath && patch.toFieldPath) {
          newEdges.push({
            id: edgeId,
            source: 'composite-input',
            sourceHandle: patch.fromFieldPath,
            target: `mr-${res.id}`,
            targetHandle: patch.toFieldPath,
            data: { patch, resourceId: res.id },
          });
        } else if (!isInput && patch.fromFieldPath && patch.toFieldPath) {
          newEdges.push({
            id: edgeId,
            source: `mr-${res.id}`,
            sourceHandle: patch.fromFieldPath,
            target: 'composite-output',
            targetHandle: patch.toFieldPath,
            data: { patch, resourceId: res.id },
          });
        }
      });
    });

    // 4. Composite Output Node
    newNodes.push({
      id: 'composite-output',
      type: 'compositeOutput',
      position: { x: 750, y: 100 },
      data: {
        kind: ir.composite.kind || 'XComposite',
        fields: outputFields,
      },
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [ir, setNodes, setEdges]);

  // Dynamically project active selection & highlighting states onto nodes
  const processedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        activeAttribute,
        highlightedFields: highlightedFieldsMap[node.id],
        onAttributeHoverEnter: (field: string) => onAttributeHoverEnter(node.id, field),
        onAttributeHoverLeave,
        onAttributeClick: (field: string) => onAttributeClick(node.id, field),
      },
    }));
  }, [nodes, activeAttribute, highlightedFieldsMap, onAttributeHoverEnter, onAttributeHoverLeave, onAttributeClick]);

  // Dynamically project dynamic styles & animations onto edges
  const processedEdges = useMemo(() => {
    const isAnyActive = activeAttribute !== null;

    return edges.map((edge) => {
      const isInput = edge.id.startsWith('edge-input');
      const isActive = highlightedEdges.has(edge.id);

      if (isInput) {
        return {
          ...edge,
          animated: isActive || !isAnyActive,
          style: {
            ...edge.style,
            stroke: isActive ? '#818cf8' : isAnyActive ? '#cbd5e1' : '#818cf8',
            strokeWidth: isActive ? 4 : 2,
            opacity: isActive ? 1 : isAnyActive ? 0.25 : 1,
            transition: 'stroke 0.2s, stroke-width 0.2s, opacity 0.2s',
          },
        };
      } else {
        return {
          ...edge,
          animated: isActive,
          style: {
            ...edge.style,
            stroke: isActive ? '#10b981' : isAnyActive ? '#cbd5e1' : '#10b981',
            strokeWidth: isActive ? 4 : 2,
            strokeDasharray: isActive ? undefined : '5,5',
            opacity: isActive ? 1 : isAnyActive ? 0.25 : 1,
            transition: 'stroke 0.2s, stroke-width 0.2s, opacity 0.2s',
          },
        };
      }
    });
  }, [edges, activeAttribute, highlightedEdges]);

  // Handle edge clicks (selects a patch for the inspector)
  const handleEdgeClick = (_event: React.MouseEvent, edge: Edge) => {
    if (onSelectEdge) {
      onSelectEdge(edge);
    }
  };

  const handlePaneClick = () => {
    if (onSelectEdge) {
      onSelectEdge(null);
    }
    setActiveAttribute(null);
  };

  return (
    <div className="w-full h-full min-h-[500px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative">
      <ReactFlow
        nodes={processedNodes}
        edges={processedEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        onConnect={onConnect}
        fitView
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
