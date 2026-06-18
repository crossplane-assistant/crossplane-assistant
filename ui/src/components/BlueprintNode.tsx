import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers, Cpu } from 'lucide-react';

interface BlueprintNodeProps {
  data: {
    node: {
      id: string;
      name: string;
      kind: string;
      apiVersion: string;
      isStep?: boolean;
    };
    isRoot: boolean;
    isActive: boolean;
    onSelectNode: (nodeId: string) => void;
  };
}

export const BlueprintNode: React.FC<BlueprintNodeProps> = ({ data }) => {
  const { node, isRoot, isActive, onSelectNode } = data;
  const isLeaf = !node.isStep && node.id !== 'xrd';

  return (
    <div
      onClick={() => onSelectNode(node.id === 'xrd' ? '' : node.id)}
      className={`cursor-pointer rounded-xl py-2 px-3.5 w-[310px] min-h-[70px] shadow-sm bg-white border transition-all flex flex-col justify-center relative group text-left select-none ${
        isActive
          ? 'ring-2 ring-blue-500 border-blue-500 shadow-md bg-blue-50/5'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* React Flow Handles */}
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          className="!w-3 !h-3 !border-2 !bg-blue-500 !border-white !-left-1.5 transition-colors group-hover:bg-blue-600"
        />
      )}
      {!isLeaf && (
        <Handle
          type="source"
          position={Position.Right}
          id="source"
          className="!w-3 !h-3 !border-2 !bg-blue-500 !border-white !-right-1.5 transition-colors group-hover:bg-blue-600"
        />
      )}

      <div className="flex items-center gap-3 w-full">
        <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 group-hover:bg-slate-100 transition-colors flex-shrink-0 flex items-center justify-center">
          {node.id === 'xrd' ? (
            <Layers className="w-4 h-4 text-blue-500" />
          ) : node.isStep ? (
            <Cpu className="w-4 h-4 text-slate-500 animate-spin-slow" />
          ) : (
            <Layers className="w-4 h-4 text-indigo-500" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-[11px] text-slate-800 font-mono truncate">
            {node.name}
          </div>
          <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate uppercase font-bold tracking-wider">
            {node.kind}
          </div>
          <div className="text-[8px] text-slate-400 font-mono truncate">
            {node.apiVersion}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BlueprintNode;
