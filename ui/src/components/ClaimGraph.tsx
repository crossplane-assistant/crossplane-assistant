import React from 'react';
import { ClaimTreeNode } from '../types';
import { ClaimGraphNode } from './ClaimGraphNode';
import { RefreshCw } from 'lucide-react';

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
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-4">
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
