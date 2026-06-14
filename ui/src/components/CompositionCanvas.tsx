import React, { useMemo, useEffect } from 'react';
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

// Custom Node for XRD Composite Input
const CompositeInputNode: React.FC<{ data: any }> = ({ data }) => {
  const fields = data.fields || [];
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
          fields.map((field: string) => (
            <div key={field} className="relative flex items-center justify-between text-xs py-1 px-2 bg-slate-800/40 rounded border border-slate-800">
              <span className="font-mono text-slate-300 truncate max-w-[180px]" title={field}>{field}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={field}
                className="w-3 h-3 bg-indigo-500 border-2 border-slate-900 !-right-1.5"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Custom Node for Managed Resource (MR)
const ManagedResourceNode: React.FC<{ data: any }> = ({ data }) => {
  const incoming = data.incomingFields || [];
  const outgoing = data.outgoingFields || [];
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
                className="w-2 h-2 bg-slate-400 border border-white !-left-1.5"
              />
            </div>
          ) : (
            incoming.map((field: string) => (
              <div key={field} className="relative flex items-center text-xs py-1 px-2 bg-slate-50 rounded border border-slate-100">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={field}
                  className="w-3 h-3 bg-indigo-400 border-2 border-white !-left-1.5"
                />
                <span className="font-mono text-slate-600 truncate pl-1 max-w-[180px]" title={field}>{field}</span>
              </div>
            ))
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
                className="w-2 h-2 bg-slate-400 border border-white !-right-1.5"
              />
            </div>
          ) : (
            outgoing.map((field: string) => (
              <div key={field} className="relative flex items-center justify-between text-xs py-1 px-2 bg-emerald-50/50 rounded border border-emerald-100">
                <span className="font-mono text-slate-600 truncate pr-1 max-w-[180px]" title={field}>{field}</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={field}
                  className="w-3 h-3 bg-emerald-500 border-2 border-white !-right-1.5"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Custom Node for XRD Composite Status Output
const CompositeOutputNode: React.FC<{ data: any }> = ({ data }) => {
  const fields = data.fields || [];
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
          fields.map((field: string) => (
            <div key={field} className="relative flex items-center text-xs py-1 px-2 bg-emerald-900/40 rounded border border-emerald-900">
              <Handle
                type="target"
                position={Position.Left}
                id={field}
                className="w-3 h-3 bg-emerald-500 border-2 border-emerald-950 !-left-1.5"
              />
              <span className="font-mono text-emerald-100 truncate pl-1 max-w-[180px]" title={field}>{field}</span>
            </div>
          ))
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

  // Map Composition IR to React Flow Nodes & Edges
  const ir = useMemo(() => parseYAMLToIR(yamlString), [yamlString]);

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
        if (patch.type === 'FromCompositeFieldPath' && patch.fromFieldPath && patch.toFieldPath) {
          newEdges.push({
            id: `edge-input-${res.id}-${pIdx}`,
            source: 'composite-input',
            sourceHandle: patch.fromFieldPath,
            target: `mr-${res.id}`,
            targetHandle: patch.toFieldPath,
            animated: true,
            style: { stroke: '#818cf8', strokeWidth: 2 },
            data: { patch, resourceId: res.id },
          });
        } else if (patch.type === 'ToCompositeFieldPath' && patch.fromFieldPath && patch.toFieldPath) {
          newEdges.push({
            id: `edge-output-${res.id}-${pIdx}`,
            source: `mr-${res.id}`,
            sourceHandle: patch.fromFieldPath,
            target: 'composite-output',
            targetHandle: patch.toFieldPath,
            style: { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5' },
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
  };

  return (
    <div className="w-full h-full min-h-[500px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
