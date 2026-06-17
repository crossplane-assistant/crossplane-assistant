import React from 'react';
import { ClaimTreeNode } from '../types';
import { ClaimGraphNode } from './ClaimGraphNode';
import { RefreshCw, Activity } from 'lucide-react';

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

interface ClaimGraphProps {
  root: ClaimTreeNode;
  activeNodeId?: string;
  onSelectNode: (node: ClaimTreeNode, resourceTemplate?: any) => void;
  compositionRevision?: any;
  lastRefresh?: Date;
  onRefresh?: () => void;
  reloadInSeconds?: number;
}

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

      {/* Graph Visual container */}
      <div className="graph-container overflow-x-auto overflow-y-auto max-w-full p-6 bg-slate-50/50 border border-slate-200 rounded-xl shadow-inner min-h-[400px]">
        <div className="inline-block min-w-full">
          <ClaimGraphNode
            node={root}
            isRoot={true}
            activeNodeId={activeNodeId}
            onSelectNode={onSelectNode}
            compositionRevision={compositionRevision}
          />
        </div>
      </div>
    </div>
  );
};
