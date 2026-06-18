import React, { useMemo } from 'react';
import { ClaimTreeNode } from '../types';
import { RefreshCw, Activity } from 'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node as RFNode,
  Edge as RFEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DependencyNode } from './DependencyNode';

export interface ProgressStats {
  total: number;
  ready: number;
  percentage: number;
}

export const getProgressStats = (node: ClaimTreeNode | null | undefined): ProgressStats => {
  if (!node) {
    return { total: 0, ready: 0, percentage: 0 };
  }

  let total = 0;
  let ready = 0;

  const traverse = (n: ClaimTreeNode) => {
    total++;
    const conditions = n.manifest?.status?.conditions || n.conditions || [];
    const readyCond = conditions.find((c: any) => c.type === 'Ready');
    if (readyCond && readyCond.status === 'True') {
      ready++;
    }

    if (n.children) {
      n.children.forEach(traverse);
    }
  };

  traverse(node);

  const percentage = total > 0 ? Math.round((ready / total) * 100) : 0;
  return { total, ready, percentage };
};

const nodeTypes = {
  dependencyNode: DependencyNode,
};

interface ClaimGraphProps {
  root: ClaimTreeNode;
  activeNodeId?: string;
  onSelectNode: (node: ClaimTreeNode, resourceTemplate?: any) => void;
  compositionRevision?: any;
  lastRefresh?: Date;
  onRefresh?: () => void;
  reloadInSeconds?: number;
}

// Build nodes and edges recursively with deterministic horizontal tree layout
const buildReactFlowGraph = (
  rootNode: ClaimTreeNode,
  activeNodeId: string | undefined,
  onSelectNode: (node: ClaimTreeNode, resourceTemplate?: any) => void,
  compositionRevision: any
) => {
  const rfNodes: RFNode[] = [];
  const rfEdges: RFEdge[] = [];

  let currentY = 50;
  const levelWidth = 480; // Distance between horizontal levels
  const nodeHeight = 150; // Spacing on Y axis between siblings/leaves

  const traverse = (node: ClaimTreeNode, level: number, parentId?: string): { x: number; y: number } => {
    const nodeId = node.uid || `${node.kind}-${node.name}-${level}`;
    const x = 50 + level * levelWidth;
    let y = 0;

    // Post-order dynamic layout for centering parents
    if (!node.children || node.children.length === 0) {
      y = currentY;
      currentY += nodeHeight;
    } else {
      const childPositions = node.children.map((child) => traverse(child, level + 1, nodeId));
      const sumY = childPositions.reduce((sum, pos) => sum + pos.y, 0);
      y = sumY / childPositions.length;
    }

    const resourceTemplate =
      compositionRevision?.spec?.resources && node.index !== undefined && node.index !== null
        ? compositionRevision.spec.resources[node.index]
        : undefined;

    rfNodes.push({
      id: nodeId,
      type: 'dependencyNode',
      position: { x, y },
      data: {
        node,
        isRoot: level === 0,
        isActive: node.uid === activeNodeId,
        onSelectNode,
        resourceTemplate,
      },
    });

    if (parentId) {
      const conditions = node.manifest?.status?.conditions || node.conditions || [];
      const readyCond = conditions.find((c: any) => c.type === 'Ready');
      const isDeleting = !!node.manifest?.metadata?.deletionTimestamp;

      let strokeColor = '#cbd5e1';
      let isAnimated = false;

      if (isDeleting) {
        strokeColor = '#f59e0b'; // Amber for deletion
        isAnimated = true;
      } else if (readyCond && readyCond.status === 'True') {
        strokeColor = '#10b981'; // Green for ready
      } else if (readyCond && readyCond.status === 'False') {
        strokeColor = '#ef4444'; // Red for error
      } else {
        strokeColor = '#3b82f6'; // Blue for provisioning in progress
        isAnimated = true;
      }

      rfEdges.push({
        id: `edge-${parentId}-${nodeId}`,
        source: parentId,
        sourceHandle: 'source',
        target: nodeId,
        targetHandle: 'target',
        animated: isAnimated,
        style: {
          stroke: strokeColor,
          strokeWidth: 3,
          transition: 'stroke 0.2s, stroke-width 0.2s',
        },
      });
    }

    return { x, y };
  };

  traverse(rootNode, 0);
  return { nodes: rfNodes, edges: rfEdges };
};

export const ClaimGraph: React.FC<ClaimGraphProps> = ({
  root,
  activeNodeId,
  onSelectNode,
  compositionRevision,
  lastRefresh = new Date(),
  onRefresh,
  reloadInSeconds = 15,
}) => {
  const { total, ready, percentage } = getProgressStats(root);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Memoize graph mapping to prevent unnecessary layout recalculations on every render
  const { nodes, edges } = useMemo(() => {
    return buildReactFlowGraph(root, activeNodeId, onSelectNode, compositionRevision);
  }, [root, activeNodeId, onSelectNode, compositionRevision]);

  const handleNodeClick = (_event: React.MouseEvent, rfNode: RFNode) => {
    const { node, resourceTemplate } = rfNode.data as any;
    onSelectNode(node, resourceTemplate);
  };

  return (
    <div className="space-y-4">
      {/* Provisioning Completion Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-500" />
              Provisioning Progress
            </h4>
            <p className="text-xs text-slate-500">
              Completion rate of all resources in this claim dependency graph.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5 font-mono">
              {ready} / {total} Resources Ready
            </span>
            <span className={`text-sm font-extrabold ${percentage === 100 ? 'text-emerald-600' : 'text-blue-600'} font-mono`}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Track & Fill */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-150 relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              percentage === 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Top Graphe Metadata and Actions Bar */}
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg p-3">
        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh Graph
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-medium font-mono flex items-center gap-3">
          <span>Last refresh: {formatTime(lastRefresh)}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Auto-reload: {reloadInSeconds}s</span>
        </div>
      </div>

      {/* Graph Visual container (React Flow interactive canvas) */}
      <div className="w-full h-[550px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};
