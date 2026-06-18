import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node as RFNode,
  Edge as RFEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BlueprintNode } from './BlueprintNode';

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

const nodeTypes = {
  blueprintNode: BlueprintNode,
};

interface CompositionGraphProps {
  composition: any;
  activeNodeId?: string;
  onSelectNode: (nodeId: string) => void;
  maxHeight?: number;
}

const buildReactFlowGraph = (
  virtualRoot: VirtualNode,
  activeNodeId: string,
  onSelectNode: (nodeId: string) => void
) => {
  const rfNodes: RFNode[] = [];
  const rfEdges: RFEdge[] = [];

  let currentY = 50;
  const levelWidth = 400; // Horizontal distance between GVK / Steps / Resources
  const nodeHeight = 110; // Vertical gap between leaves

  const traverse = (node: VirtualNode, level: number, parentId?: string): { x: number; y: number } => {
    const nodeId = node.id;
    const x = 50 + level * levelWidth;
    let y = 0;

    // DFS centering layout
    if (!node.children || node.children.length === 0) {
      y = currentY;
      currentY += nodeHeight;
    } else {
      const childPositions = node.children.map((child) => traverse(child, level + 1, nodeId));
      const sumY = childPositions.reduce((sum, pos) => sum + pos.y, 0);
      y = sumY / childPositions.length;
    }

    rfNodes.push({
      id: nodeId,
      type: 'blueprintNode',
      position: { x, y },
      data: {
        node,
        isRoot: level === 0,
        isActive: nodeId === activeNodeId || (nodeId === 'xrd' && activeNodeId === ''),
        onSelectNode,
      },
    });

    if (parentId) {
      rfEdges.push({
        id: `edge-${parentId}-${nodeId}`,
        source: parentId,
        sourceHandle: 'source',
        target: nodeId,
        targetHandle: 'target',
        animated: true,
        style: {
          stroke: '#3b82f6', // Animated blue edge represents the execution flow
          strokeWidth: 3,
        },
      });
    }

    return { x, y };
  };

  traverse(virtualRoot, 0);
  return { nodes: rfNodes, edges: rfEdges };
};

export const CompositionGraph: React.FC<CompositionGraphProps> = ({
  composition,
  activeNodeId = '',
  onSelectNode,
  maxHeight = 300,
}) => {
  const virtualRoot = buildVirtualTree(composition);

  const { nodes, edges } = useMemo(() => {
    return buildReactFlowGraph(virtualRoot, activeNodeId, onSelectNode);
  }, [virtualRoot, activeNodeId, onSelectNode]);

  const handleNodeClick = (_event: React.MouseEvent, rfNode: RFNode) => {
    const { node } = rfNode.data as any;
    onSelectNode(node.id === 'xrd' ? '' : node.id);
  };

  return (
    <div
      className="w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative shadow-inner"
      style={{ height: `${maxHeight}px` }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
