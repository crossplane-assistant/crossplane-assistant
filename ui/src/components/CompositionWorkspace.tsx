import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useComposition, useCompositionDependencies } from '../queries/useCompositionQueries';
import { CompositionTreeNav } from './CompositionTreeNav';
import { DynamicResourceViewer } from './DynamicResourceViewer';
import { CompositionGraph } from './CompositionGraph';
import MonacoEditor from '@monaco-editor/react';
import { stringify } from 'yaml';
import { 
  ArrowLeft, 
  Layers, 
  Cpu, 
  FileText, 
  Activity, 
  GitFork, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { useClaims } from '../queries/useClaimQueries';
import { encodeRef } from '../types';

export const CompositionWorkspace: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get('selected') || '';

  const [isGraphCollapsed, setIsGraphCollapsed] = React.useState(!!selected);

  // Auto-collapse graph when selection changes (from empty to selected)
  React.useEffect(() => {
    if (selected) {
      setIsGraphCollapsed(true);
    } else {
      setIsGraphCollapsed(false);
    }
  }, [selected]);

  const { data: composition, isLoading, error } = useComposition(name);
  const { data: graph } = useCompositionDependencies(name);
  const { data: claims = [] } = useClaims();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse font-semibold mt-10">
        Loading Composition Workspace...
      </div>
    );
  }

  if (error || !composition) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 border border-red-200 rounded-xl max-w-2xl mx-auto mt-10">
        <h3 className="font-bold text-lg">Error Loading Composition</h3>
        <p className="mt-1 text-sm">{(error as Error)?.message || 'Composition not found'}</p>
        <Link to="/explore/compositions" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
          <ArrowLeft className="w-3 h-3" /> Back to List
        </Link>
      </div>
    );
  }

  const compositeType = composition.spec?.compositeTypeRef;
  const pipeline = composition.spec?.pipeline || [];
  const legacyResources = composition.spec?.resources || [];

  // Helper to change selection via URL search params
  const handleSelect = (key: string) => {
    if (key) {
      setSearchParams({ selected: key });
    } else {
      setSearchParams({});
    }
  };

  // Flatten and extract all composed resources with their global indices
  const allResources: Array<{ resource: any; globalIndex: number; stepName?: string }> = [];
  let globalResourceCounter = 0;

  if (pipeline.length > 0) {
    pipeline.forEach((step: any) => {
      const isPatchAndTransform = step.functionRef?.name?.toLowerCase().includes('patch-and-transform') || false;
      const stepResources = isPatchAndTransform ? (step.input?.resources || []) : [];
      stepResources.forEach((res: any) => {
        allResources.push({
          resource: res,
          globalIndex: globalResourceCounter++,
          stepName: step.step,
        });
      });
    });
  } else if (legacyResources.length > 0) {
    legacyResources.forEach((res: any) => {
      allResources.push({
        resource: res,
        globalIndex: globalResourceCounter++,
      });
    });
  }

  // Filter claims matching Composition GVK
  const matchingClaims = claims.filter((claim: any) => {
    if (!compositeType) return false;
    const compositeParts = compositeType.apiVersion.split('/');
    const claimParts = claim.apiVersion.split('/');
    const compositeGroup = compositeParts[0];
    const claimGroup = claimParts[0];
    if (compositeGroup !== claimGroup) return false;

    const compKind = compositeType.kind;
    const claimKind = claim.kind;
    const cleanCompKind = compKind.startsWith('X') ? compKind.slice(1) : compKind;
    const cleanClaimKind = claimKind.startsWith('X') ? claimKind.slice(1) : claimKind;
    return cleanCompKind.toLowerCase() === cleanClaimKind.toLowerCase();
  });

  // Render main workspace content depending on active selection
  const renderMainPane = () => {
    if (!selected) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl max-w-2xl mx-auto my-12 shadow-xs">
          <Layers className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="font-extrabold text-slate-800 text-lg">Composition Workspace</h3>
          <p className="text-sm text-slate-500 max-w-md mt-1.5 leading-relaxed">
            Select a pipeline step configuration, an extracted composed resource, or a live matching Claim from the tree structure on the left to start your deep analysis.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-md">
            <span className="px-2.5 py-1 bg-white text-xs font-semibold text-slate-600 rounded-md border shadow-2xs">🔍 Inspect Patches & Flow</span>
            <span className="px-2.5 py-1 bg-white text-xs font-semibold text-slate-600 rounded-md border shadow-2xs">🔗 Trace computed dependencies</span>
            <span className="px-2.5 py-1 bg-white text-xs font-semibold text-slate-600 rounded-md border shadow-2xs">🚀 Quick link to live Claims</span>
          </div>
        </div>
      );
    }

    if (selected.startsWith('step:')) {
      const stepName = selected.replace('step:', '');
      const matchedStep = pipeline.find((s: any) => s.step === stepName);
      if (!matchedStep) {
        return <div className="p-4 text-slate-400 italic">Pipeline step not found.</div>;
      }
      const functionName = matchedStep.functionRef?.name || 'unknown-function';
      const yamlInput = matchedStep.input ? stringify(matchedStep.input) : '';

      return (
        <div className="space-y-6 max-w-5xl animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-500" /> Pipeline Step: <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{stepName}</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 border px-2 py-1 rounded">
                Function: {functionName}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> step.input (Configuration parameters)
              </h4>
              {matchedStep.input ? (
                <div className="h-[450px] border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-white">
                  <MonacoEditor
                    height="100%"
                    language="yaml"
                    theme="vs-light"
                    value={yamlInput}
                    options={{ readOnly: true, minimap: { enabled: false } }}
                  />
                </div>
              ) : (
                <div className="p-8 border rounded-xl bg-slate-50/50 text-center italic text-slate-400 text-sm">
                  No configuration input parameters defined for this step.
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (selected.startsWith('resource:')) {
      const resName = selected.replace('resource:', '');
      const matched = allResources.find((r) => r.resource.name === resName);
      if (!matched) {
        return <div className="p-4 text-slate-400 italic">Composed resource not found.</div>;
      }

      return (
        <div className="space-y-4 max-w-5xl animate-fadeIn">
          <div className="bg-slate-50/60 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Composed Resource Template</span>
              <h3 className="text-base font-extrabold text-slate-800 font-mono">{resName}</h3>
            </div>
            {matched.stepName && (
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Pipeline Step: {matched.stepName}
              </span>
            )}
          </div>
          <DynamicResourceViewer
            context={{
              graph,
              resource: matched.resource,
              resourceIndex: matched.globalIndex,
              composition: composition,
              defaultOpen: true,
            }}
          />
        </div>
      );
    }

    if (selected.startsWith('claim:')) {
      const claimKey = selected.replace('claim:', '');
      const matchedClaim = matchingClaims.find((c: any) => {
        const key = c.metadata?.namespace 
          ? `${c.metadata.namespace}/${c.metadata.name}` 
          : c.metadata?.name || '';
        return key === claimKey;
      });

      if (!matchedClaim) {
        return <div className="p-4 text-slate-400 italic">Active Claim not found.</div>;
      }

      const syncedStatus = matchedClaim.status?.conditions?.find((c: any) => c.type === 'Synced')?.status || 'Unknown';
      const readyStatus = matchedClaim.status?.conditions?.find((c: any) => c.type === 'Ready')?.status || 'Unknown';

      const ref = {
        apiVersion: matchedClaim.apiVersion,
        kind: matchedClaim.kind,
        name: matchedClaim.metadata?.name,
        namespace: matchedClaim.metadata?.namespace,
      };
      const encoded = encodeRef(ref);

      return (
        <div className="space-y-6 max-w-4xl animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Consuming Claim</span>
              <h3 className="text-lg font-extrabold text-slate-800 font-mono">
                {matchedClaim.metadata?.namespace ? `${matchedClaim.metadata.namespace}/` : ''}{matchedClaim.metadata?.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">{matchedClaim.kind} ({matchedClaim.apiVersion})</p>
            </div>

            {/* Health indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold text-slate-500 uppercase">Synced Status</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                  syncedStatus === 'True' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${syncedStatus === 'True' ? 'bg-green-500' : 'bg-red-500'}`} />
                  {syncedStatus}
                </span>
              </div>
              <div className="p-4 rounded-xl border flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold text-slate-500 uppercase">Ready Status</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                  readyStatus === 'True' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${readyStatus === 'True' ? 'bg-green-500' : 'bg-red-500'}`} />
                  {readyStatus}
                </span>
              </div>
            </div>

            {/* Inspection Actions */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-500" /> Active Inspection Actions
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                This Claim is fully provisioned and reconciling on the cluster. Utilize our dynamic inspection suite to analyze this live system:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Link
                  to={`/explore/claims/${encoded}`}
                  className="p-4 bg-white border border-slate-200 hover:border-indigo-200 rounded-xl hover:bg-indigo-50/10 shadow-3xs hover:shadow-2xs transition-all flex flex-col justify-between text-left group"
                >
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 group-hover:text-indigo-600">
                      <GitFork className="w-4 h-4 text-indigo-500" /> Dependency Graph
                    </h5>
                    <p className="text-xs text-slate-500">
                      Explore the live 2D relational network of composed resources created by this Claim.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 mt-4 inline-flex items-center gap-0.5 group-hover:underline">
                    Inspect Graph <ExternalLink className="w-3 h-3" />
                  </span>
                </Link>

                <Link
                  to={`/explore/claims/${encoded}?tab=timeline`}
                  className="p-4 bg-white border border-slate-200 hover:border-emerald-200 rounded-xl hover:bg-emerald-50/10 shadow-3xs hover:shadow-2xs transition-all flex flex-col justify-between text-left group"
                >
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 group-hover:text-emerald-600">
                      <Clock className="w-4 h-4 text-emerald-500" /> Gantt Timeline
                    </h5>
                    <p className="text-xs text-slate-500">
                      Analyze the chronological boot-up timeline and reconciliation latency of all nested resources.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 mt-4 inline-flex items-center gap-0.5 group-hover:underline">
                    Inspect Timeline <ExternalLink className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Upper Navigation Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between flex-none">
        <div className="flex items-center gap-4">
          <Link
            to="/explore/compositions"
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            title="Back to Compositions"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-800 font-mono leading-none">{name}</h1>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/50">
                Workspace
              </span>
            </div>
            {compositeType && (
              <span className="text-xs text-slate-400 font-mono block mt-1">
                Implements GVK: {compositeType.kind} ({compositeType.apiVersion})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Workspace Splits */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar (25% width) */}
        <div className="w-[300px] border-r border-slate-200 bg-slate-50/50 flex-none flex flex-col overflow-y-auto">
          <CompositionTreeNav 
            composition={composition} 
            selected={selected} 
            onSelect={handleSelect} 
            matchingClaims={matchingClaims}
          />
        </div>

        {/* Main Content Pane (75% width) */}
        <div className="flex-1 bg-white overflow-hidden flex flex-col">
          {/* Top Collapsible Graph Section */}
          <div className="border-b border-slate-150 bg-slate-50/20 p-5 flex-none flex flex-col space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <GitFork className="w-4 h-4 text-blue-500 animate-pulse" /> Blueprint Workflow Diagram
              </h3>
              <button
                onClick={() => setIsGraphCollapsed(!isGraphCollapsed)}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-md font-semibold text-[10px] text-slate-600 hover:text-slate-800 transition-colors cursor-pointer shadow-xs"
              >
                {isGraphCollapsed ? 'Expand Diagram ↓' : 'Collapse Diagram ↑'}
              </button>
            </div>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isGraphCollapsed ? 'max-h-0 opacity-0' : 'max-h-[350px] opacity-100'
            }`}>
              <CompositionGraph
                composition={composition}
                activeNodeId={selected}
                onSelectNode={handleSelect}
              />
            </div>
          </div>

          {/* Bottom Selected Details Section */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/10">
            {renderMainPane()}
          </div>
        </div>
      </div>
    </div>
  );
};
