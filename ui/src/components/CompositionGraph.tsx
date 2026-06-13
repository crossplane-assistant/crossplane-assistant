import React from 'react';
import { Cpu, Layers } from 'lucide-react';

export interface VirtualNode {
  id: string;
  name: string;
  kind: string;
  apiVersion: string;
  children?: VirtualNode[];
  isStep?: boolean;
}

export const buildVirtualTree = (composition: any): VirtualNode => {
  const compositeType = composition?.spec?.compositeTypeRef;
  const pipeline = composition?.spec?.pipeline || [];
  const resources = composition?.spec?.resources || [];

  const root: VirtualNode = {
    id: 'xrd',
    name: compositeType?.kind || 'XComposite',
    kind: 'Composite Interface (XRD)',
    apiVersion: compositeType?.apiVersion || '',
    children: [],
  };

  if (pipeline.length > 0) {
    let globalResCounter = 0;
    root.children = pipeline.map((step: any, idx: number) => {
      const stepName = step.step || `step-${idx}`;
      const isPt = step.functionRef?.name?.toLowerCase().includes('patch-and-transform') || false;
      const stepResources = isPt ? (step.input?.resources || []) : [];

      const stepNode: VirtualNode = {
        id: `step:${stepName}`,
        name: stepName,
        kind: 'Pipeline Step',
        apiVersion: step.functionRef?.name || '',
        isStep: true,
        children: stepResources.map((res: any) => {
          globalResCounter++;
          return {
            id: `resource:${res.name}`,
            name: res.name,
            kind: res.base?.kind || 'Resource',
            apiVersion: res.base?.apiVersion || '',
          };
        }),
      };
      return stepNode;
    });
  } else if (resources.length > 0) {
    root.children = resources.map((res: any) => ({
      id: `resource:${res.name}`,
      name: res.name,
      kind: res.base?.kind || 'Resource',
      apiVersion: res.base?.apiVersion || '',
    }));
  }

  return root;
};

interface CompositionGraphProps {
  composition: any;
  activeNodeId?: string;
  onSelectNode: (nodeId: string) => void;
}

export const CompositionGraph: React.FC<CompositionGraphProps> = ({
  composition,
  activeNodeId = '',
  onSelectNode,
}) => {
  const virtualRoot = buildVirtualTree(composition);

  return (
    <div className="graph-container overflow-x-auto overflow-y-auto max-w-full p-4 bg-slate-50/40 border border-slate-200 rounded-xl shadow-inner min-h-[140px] max-h-[300px]">
      <div className="inline-block min-w-full">
        <CompositionGraphNode
          node={virtualRoot}
          isRoot={true}
          activeNodeId={activeNodeId}
          onSelectNode={onSelectNode}
        />
      </div>
    </div>
  );
};

interface CompositionGraphNodeProps {
  node: VirtualNode;
  isRoot?: boolean;
  first?: boolean;
  last?: boolean;
  uniq?: boolean;
  activeNodeId?: string;
  onSelectNode: (nodeId: string) => void;
}

const CompositionGraphNode: React.FC<CompositionGraphNodeProps> = ({
  node,
  isRoot = false,
  first = false,
  last = false,
  uniq = false,
  activeNodeId = '',
  onSelectNode,
}) => {
  const isActive = node.id === activeNodeId;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div
      className={`graph-wrapper ${isRoot ? 'root' : ''} ${first ? 'first' : ''} ${last ? 'last' : ''} ${uniq ? 'uniq' : ''}`}
    >
      {!isRoot && <div className="connector root" />}

      <div className={`${isRoot ? 'flex root' : 'flex'} items-stretch gap-0`}>
        {/* Node card */}
        <div className="flex items-center flex-shrink-0" style={{ minWidth: '320px' }}>
          <button
            onClick={() => onSelectNode(node.id === 'xrd' ? '' : node.id)}
            className={`cursor-pointer rounded-xl py-2 px-3.5 my-2 w-[310px] min-h-[70px] shadow-sm bg-white border transition-all flex flex-col justify-center relative group text-left ${
              isActive
                ? 'ring-2 ring-blue-500 border-blue-500 shadow-md bg-blue-50/5'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 group-hover:bg-slate-100 transition-colors flex-shrink-0">
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
          </button>
        </div>

        {/* Children rendering */}
        {hasChildren && (
          <div className="graph-children flex flex-col justify-center pl-[25px] relative">
            <div className="connector line" />
            {node.children!.map((child, idx) => (
              <CompositionGraphNode
                key={child.id}
                node={child}
                first={idx === 0}
                last={idx === node.children!.length - 1}
                uniq={node.children!.length === 1}
                activeNodeId={activeNodeId}
                onSelectNode={onSelectNode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
