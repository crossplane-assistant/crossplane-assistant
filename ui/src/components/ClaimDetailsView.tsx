import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import MonacoEditor from '@monaco-editor/react';
import { stringify } from 'yaml';
import { decodeRef, Ref, ClaimTreeNode } from '../types';
import { useClaim, useClaimTree } from '../queries/useClaimQueries';
import { useCompositionRevision } from '../queries/useCompositionQueries';
import { useEvents } from '../queries/useEventQueries';
import { ClaimGraph } from './ClaimGraph';
import { ClaimEventsList } from './ClaimEventsList';
import { X, Library, FileText, LayoutTemplate, Activity, ChevronRight } from 'lucide-react';

function cleanManifest(manifest: any): any {
  if (!manifest) return {};
  const copy = JSON.parse(JSON.stringify(manifest));
  if (copy.metadata) {
    delete copy.metadata.managedFields;
  }
  return copy;
}

export const ClaimDetailsView: React.FC = () => {
  const { ref: encodedRef } = useParams<{ ref: string }>();
  const [ref, setRef] = useState<Ref | undefined>(undefined);

  // Selected node state for sliding drawer
  const [selectedNode, setSelectedNode] = useState<ClaimTreeNode | null>(null);
  const [selectedNodeTemplate, setSelectedNodeTemplate] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('manifest');

  // Decode the reference parameter
  useEffect(() => {
    if (encodedRef) {
      try {
        setRef(decodeRef(encodedRef));
      } catch (err) {
        console.error('Failed to decode ref parameter', err);
      }
    }
  }, [encodedRef]);

  // Query Claim details
  const {
    isLoading: claimLoading,
    error: claimError,
    refetch: refetchClaim,
    dataUpdatedAt: claimUpdatedAt,
  } = useClaim(ref);

  // Query Claim dependency tree
  const {
    data: tree,
    isLoading: treeLoading,
    error: treeError,
    refetch: refetchTree,
    dataUpdatedAt: treeUpdatedAt,
  } = useClaimTree(ref);

  // Resolve CompositionRevision Name from Claim Tree root
  const compositionRevisionRefName = tree?.root?.manifest?.spec?.compositionRevisionRef?.name;

  // Query CompositionRevision details
  const { data: compositionRevision } = useCompositionRevision(compositionRevisionRefName);

  // Selected node reference for events querying
  const selectedNodeRef = selectedNode?.manifest
    ? {
        apiVersion: selectedNode.manifest.apiVersion,
        kind: selectedNode.manifest.kind,
        name: selectedNode.manifest.metadata?.name,
        namespace: selectedNode.manifest.metadata?.namespace,
      }
    : undefined;

  // Query Kubernetes events for selected resource
  const { data: events = [], isLoading: eventsLoading } = useEvents(selectedNodeRef);

  // Sync / refresh both queries
  const handleRefresh = () => {
    refetchClaim();
    refetchTree();
  };

  const lastRefreshDate = new Date(Math.max(claimUpdatedAt, treeUpdatedAt) || Date.now());

  if (claimLoading || treeLoading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse font-semibold mt-10">
        Loading Claim Dependency Graph...
      </div>
    );
  }

  if (claimError || treeError) {
    const errorMsg = (claimError as Error)?.message || (treeError as Error)?.message || 'Unknown error';
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 border border-red-200 rounded-xl max-w-2xl mx-auto mt-10">
        <h3 className="font-bold text-lg">Error Loading Claim Graph</h3>
        <p className="mt-1 text-sm">{errorMsg}</p>
        <Link to="/explore/claims" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to Claims List
        </Link>
      </div>
    );
  }

  const claimName = ref?.name || 'Claim Details';

  const handleSelectNode = (node: ClaimTreeNode, template?: any) => {
    setSelectedNode(node);
    setSelectedNodeTemplate(template);
    // If we click a node that has no template, force fallback tab to 'manifest'
    if (activeTab === 'template' && !template) {
      setActiveTab('manifest');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 relative">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
        <Link to="/explore/claims" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
          <Library className="w-4 h-4 text-slate-400" />
          Claims
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className="text-slate-800 font-bold truncate max-w-md">{claimName}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            {claimName}
          </h1>
          <p className="text-sm text-slate-500">
            Interactive resource dependency tree visualization for the selected Claim.
          </p>
        </div>
      </div>

      {/* Tree Visualization */}
      {tree?.root ? (
        <ClaimGraph
          root={tree.root}
          activeNodeId={selectedNode?.uid}
          onSelectNode={handleSelectNode}
          compositionRevision={compositionRevision}
          lastRefresh={lastRefreshDate}
          onRefresh={handleRefresh}
          reloadInSeconds={15}
        />
      ) : (
        <div className="p-8 text-center text-slate-400 italic bg-white border border-slate-200 rounded-xl shadow-sm">
          No dependency graph was resolved for this Claim.
        </div>
      )}

      {/* Sliding Detail Drawer */}
      {selectedNode && (
        <div className="fixed inset-y-0 right-0 w-[650px] bg-white shadow-2xl border-l border-slate-200 flex flex-col z-50 animate-slideIn">
          {/* Header */}
          <div className="p-6 border-b border-slate-150 bg-slate-50 flex items-center justify-between flex-shrink-0">
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-slate-800 text-lg font-mono truncate max-w-[450px]">
                {selectedNode.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider font-bold">
                {selectedNode.kind} ({selectedNode.version})
              </span>
            </div>
            
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Radix Tabs */}
          <Tabs.Root
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Tab Trigger Buttons */}
            <Tabs.List className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-6 flex-shrink-0">
              <Tabs.Trigger
                value="manifest"
                className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 flex items-center gap-1.5 focus:outline-none cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4" /> Manifest
              </Tabs.Trigger>
              {selectedNodeTemplate && (
                <Tabs.Trigger
                  value="template"
                  className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 flex items-center gap-1.5 focus:outline-none cursor-pointer transition-colors"
                >
                  <LayoutTemplate className="w-4 h-4" /> Template
                </Tabs.Trigger>
              )}
              <Tabs.Trigger
                value="event"
                className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 flex items-center gap-1.5 focus:outline-none cursor-pointer transition-colors"
              >
                <Activity className="w-4 h-4" /> Events
              </Tabs.Trigger>
            </Tabs.List>

            {/* Tab Content Panel Container */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Manifest Tab */}
              <Tabs.Content value="manifest" className="h-[480px] border border-slate-200 rounded-lg overflow-hidden shadow-inner bg-white">
                <MonacoEditor
                  height="100%"
                  language="yaml"
                  theme="vs-light"
                  value={stringify(cleanManifest(selectedNode.manifest || {}))}
                  options={{ readOnly: true, minimap: { enabled: false } }}
                />
              </Tabs.Content>

              {/* Template Tab */}
              {selectedNodeTemplate && (
                <Tabs.Content value="template" className="h-[480px] border border-slate-200 rounded-lg overflow-hidden shadow-inner bg-white">
                  <MonacoEditor
                    height="100%"
                    language="yaml"
                    theme="vs-light"
                    value={stringify(selectedNodeTemplate)}
                    options={{ readOnly: true, minimap: { enabled: false } }}
                  />
                </Tabs.Content>
              )}

              {/* Event Tab */}
              <Tabs.Content value="event" className="animate-fadeIn">
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Resource Events</div>
                <ClaimEventsList events={events} isLoading={eventsLoading} />
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>
      )}
    </div>
  );
};
export default ClaimDetailsView;
