import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ClaimTreeNode, ClaimCondition } from '../types';
import { ClaimNodeLogo } from './ClaimNodeLogo';
import { RefreshCw, Activity, AlertTriangle, Eye, Trash2 } from 'lucide-react';

interface DependencyNodeProps {
  data: {
    node: ClaimTreeNode;
    isRoot: boolean;
    isActive: boolean;
    onSelectNode: (node: ClaimTreeNode, resourceTemplate?: any) => void;
    resourceTemplate?: any;
  };
}

function formatAge(timestamp: string): string {
  if (!timestamp) return '';
  const created = new Date(timestamp);
  const seconds = Math.floor((new Date().getTime() - created.getTime()) / 1000);
  if (seconds < 0) return 'now';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export const DependencyNode: React.FC<DependencyNodeProps> = ({ data }) => {
  const { node, isRoot, isActive, onSelectNode, resourceTemplate } = data;
  const manifest = node.manifest || {};

  // Extract conditions
  const getCondition = (type: string): ClaimCondition | undefined => {
    const conditions: ClaimCondition[] = manifest?.status?.conditions || node.conditions || [];
    return conditions.find((c: any) => c.type === type);
  };

  const readyCond = getCondition('Ready');
  const syncedCond = getCondition('Synced');
  const isDeleting = !!manifest?.metadata?.deletionTimestamp;

  const creationTimestamp = manifest?.metadata?.creationTimestamp || '';
  const compositionResourceName = manifest?.metadata?.annotations?.['crossplane.io/composition-resource-name'] || '';

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div
      onClick={() => onSelectNode(node, resourceTemplate)}
      className={`cursor-pointer rounded-xl py-2.5 px-3.5 w-[380px] min-h-[90px] shadow-sm bg-white border transition-all flex flex-col justify-between relative group select-none ${
        isActive
          ? 'ring-2 ring-blue-500 border-blue-500 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      } ${!node.manifest ? 'border-dashed border-slate-300 bg-slate-50/50' : ''}`}
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
      {hasChildren && (
        <Handle
          type="source"
          position={Position.Right}
          id="source"
          className="!w-3 !h-3 !border-2 !bg-blue-500 !border-white !-right-1.5 transition-colors group-hover:bg-blue-600"
        />
      )}

      {/* Top row: Logo + Kind + Name + Badges */}
      <div className="flex items-start gap-3 w-full flex-1">
        <div className="flex-shrink-0">
          <ClaimNodeLogo
            apiVersion={manifest?.apiVersion || node.version}
            kind={manifest?.kind || node.kind}
          />
        </div>

        {/* Info Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-800 font-mono truncate mr-2" title={manifest?.kind || node.kind}>
              {manifest?.kind || node.kind}
            </span>
            
            {/* Management Policy Badges */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {manifest?.spec?.managementPolicy === 'Observe' && (
                <span title="Observe Only Policy">
                  <Eye className="w-4 h-4 text-slate-400" />
                </span>
              )}
              {manifest?.spec?.managementPolicy === 'Delete' && (
                <span title="Delete Only Policy">
                  <Trash2 className="w-4 h-4 text-slate-400" />
                </span>
              )}
            </div>
          </div>

          <div className="font-bold text-xs text-blue-600 font-mono truncate mt-0.5" title={manifest?.metadata?.name || node.name}>
            {manifest?.metadata?.name || node.name}
          </div>

          {/* Annotation Composition Resource Name if exists */}
          {compositionResourceName && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium truncate mt-0.5">
              <span className="font-bold text-slate-500 font-mono uppercase bg-slate-100 px-1 py-0.5 rounded text-[8px]">
                res: {compositionResourceName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row metadata */}
      <div className="flex items-center justify-between w-full border-t border-slate-100 pt-1 text-[10px] text-slate-400 font-medium mt-1">
        <div className="flex items-center gap-2">
          {creationTimestamp && (
            <span className="font-mono bg-slate-50 border border-slate-100 rounded px-1" title={`Created: ${creationTimestamp}`}>
              {formatAge(creationTimestamp)}
            </span>
          )}
          {node.generation !== undefined && node.generation > 0 && (
            <span className="font-mono bg-slate-50 border border-slate-100 rounded px-1">
              v{node.generation}
            </span>
          )}
          {node.namespace && (
            <span className="font-mono bg-slate-50 border border-slate-100 rounded px-1 truncate max-w-[80px]" title={`Namespace: ${node.namespace}`}>
              ns: {node.namespace}
            </span>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          {syncedCond && (
            <span title={`Synced: ${syncedCond.status} (${syncedCond.reason || 'No reason'})`}>
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  syncedCond.status === 'True'
                    ? 'text-emerald-500'
                    : syncedCond.status === 'False'
                    ? 'text-red-500'
                    : 'text-slate-300 animate-spin'
                }`}
              />
            </span>
          )}
          {readyCond && (
            <span title={`Ready: ${readyCond.status} (${readyCond.reason || 'No reason'})`}>
              <Activity
                className={`w-3.5 h-3.5 ${
                  readyCond.status === 'True'
                    ? 'text-emerald-500'
                    : readyCond.status === 'False'
                    ? 'text-red-500'
                    : 'text-slate-300'
                }`}
              />
            </span>
          )}
          {isDeleting && (
            <span title="Resource is being deleted">
              <AlertTriangle
                className="w-3.5 h-3.5 text-amber-500 animate-pulse"
              />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
