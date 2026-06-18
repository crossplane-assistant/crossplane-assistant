import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useComposition, useCompositionDependencies } from '../queries/useCompositionQueries';
import { CompositionTreeNav } from './CompositionTreeNav';
import { DynamicResourceViewer } from './DynamicResourceViewer';
import { CompositionGraph } from './CompositionGraph';
import MonacoEditor from '@monaco-editor/react';
import { stringify } from 'yaml';
import { CompositionCanvas } from './CompositionCanvas';
import { TransformInspector } from './TransformInspector';
import { parseYAMLToIR } from '../utils/compositionParser';
import { Edge } from '@xyflow/react';
import { Sparkles, Hammer } from 'lucide-react';
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

  const [isGraphCollapsed, setIsGraphCollapsed] = React.useState<boolean>(() => {
    const saved = localStorage.getItem('composition-workspace:graph-collapsed');
    return saved !== null ? saved === 'true' : false;
  });

  const [zoom, setZoom] = React.useState<number>(() => {
    const saved = localStorage.getItem('composition-workspace:graph-zoom');
    return saved !== null ? parseInt(saved, 10) : 100;
  });

  const [maxHeight, setMaxHeight] = React.useState<number>(() => {
    const saved = localStorage.getItem('composition-workspace:graph-height');
    return saved !== null ? parseInt(saved, 10) : 400;
  });

  React.useEffect(() => {
    localStorage.setItem('composition-workspace:graph-collapsed', String(isGraphCollapsed));
  }, [isGraphCollapsed]);

  React.useEffect(() => {
    localStorage.setItem('composition-workspace:graph-zoom', String(zoom));
  }, [zoom]);

  React.useEffect(() => {
    localStorage.setItem('composition-workspace:graph-height', String(maxHeight));
  }, [maxHeight]);

  const handleZoomIn = () => setZoom((prev) => Math.min(150, prev + 10));
  const handleZoomOut = () => setZoom((prev) => Math.max(50, prev - 10));
  const handleZoomReset = () => setZoom(100);

  const handleHeightIncrease = () => setMaxHeight((prev) => Math.min(800, prev + 100));
  const handleHeightDecrease = () => setMaxHeight((prev) => Math.max(200, prev - 100));

  const [sandboxClaimYaml, setSandboxClaimYaml] = React.useState<string>('');
  const [sandboxCompYaml, setSandboxCompYaml] = React.useState<string>('');
  const [sandboxActiveTab, setSandboxActiveTab] = React.useState<'claim' | 'composition'>('claim');
  const [isRendering, setIsRendering] = React.useState<boolean>(false);
  const [renderResult, setRenderResult] = React.useState<{
    cli_available: boolean;
    stdout?: string;
    stderr?: string;
    error?: string;
  } | null>(null);
  const [sandboxError, setSandboxError] = React.useState<string>('');

  const view = searchParams.get('view') || 'tree';
  const isCanvasView = view === 'canvas';

  const [localYaml, setLocalYaml] = React.useState<string>('');
  const [selectedEdge, setSelectedEdge] = React.useState<Edge | null>(null);
  const [canvasParseError, setCanvasParseError] = React.useState<string>('');

  const { data: composition, isLoading, error } = useComposition(name);

  React.useEffect(() => {
    if (composition && !localYaml) {
      setLocalYaml(stringify(composition));
    }
  }, [composition, localYaml]);

  React.useEffect(() => {
    if (localYaml) {
      setSandboxCompYaml(localYaml);
      try {
        const parsed = parseYAMLToIR(localYaml);
        if (parsed.name === 'Unknown' && localYaml.trim() !== '') {
          setCanvasParseError('Structure YAML invalide ou non supportée pour le Canvas.');
        } else {
          setCanvasParseError('');
        }
      } catch (err: any) {
        setCanvasParseError(err.message || 'Erreur lors du parsing du YAML.');
      }
    }
  }, [localYaml]);

  React.useEffect(() => {
    if (selected === 'sandbox' && composition) {
      // Set initial composition YAML if empty
      if (!sandboxCompYaml) {
        setSandboxCompYaml(stringify(composition));
      }

      // Fetch dummy claim if empty
      if (!sandboxClaimYaml) {
        const apiVersion = composition.spec?.compositeTypeRef?.apiVersion || '';
        const parts = apiVersion.split('/');
        const group = parts.length > 1 ? parts[0] : '';
        const version = parts.length > 1 ? parts[1] : parts[0];
        const kind = composition.spec?.compositeTypeRef?.kind || '';

        if (version && kind) {
          setIsRendering(true);
          fetch(`/crossplane/sandbox/dummy-claim?group=${encodeURIComponent(group)}&version=${encodeURIComponent(version)}&kind=${encodeURIComponent(kind)}`)
            .then((res) => {
              if (!res.ok) {
                throw new Error(`Failed to generate dummy claim: HTTP ${res.status}`);
              }
              return res.text();
            })
            .then((text) => {
              setSandboxClaimYaml(text);
              setIsRendering(false);
            })
            .catch((err) => {
              console.error(err);
              setSandboxError(err.message || 'Failed to fetch dummy claim');
              setIsRendering(false);
            });
        }
      }
    }
  }, [selected, composition, sandboxCompYaml, sandboxClaimYaml]);

  const handleRender = async () => {
    setIsRendering(true);
    setSandboxError('');
    setRenderResult(null);
    try {
      const response = await fetch('/crossplane/sandbox/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claim: sandboxClaimYaml,
          composition: sandboxCompYaml,
        }),
      });
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const data = await response.json();
      setRenderResult(data);
    } catch (err: any) {
      console.error(err);
      setSandboxError(err.message || 'An unexpected error occurred during simulation.');
    } finally {
      setIsRendering(false);
    }
  };

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

          <button
            onClick={() => handleSelect('sandbox')}
            className="mt-8 p-5 bg-blue-50/50 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-2xl shadow-3xs hover:shadow-2xs transition-all flex items-start gap-4 text-left max-w-md cursor-pointer group"
          >
            <span className="text-2xl mt-0.5">🧪</span>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-blue-900 group-hover:text-blue-700">
                Ouvrir la Sandbox (Dry-Run)
              </h4>
              <p className="text-xs text-blue-700/80 leading-relaxed">
                Simulez instantanément le rendu de vos compositions localement sans impacter votre cluster. Testez vos Claim de manière sécurisée et diagnostiquez les erreurs de validation en direct.
              </p>
            </div>
          </button>
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

    if (selected === 'sandbox') {
      return (
        <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-fadeIn">
          {/* Header of the Sandbox */}
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span className="text-lg">🧪</span> Sandbox (Dry-Run Engine)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Modifiez votre claim fictive et la définition de la composition pour simuler le rendu des ressources.
              </p>
            </div>
            
            {/* Simulation button */}
            <button
              onClick={handleRender}
              disabled={isRendering}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                isRendering
                  ? 'bg-blue-100 text-blue-400 cursor-not-allowed border border-blue-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 active:scale-95'
              }`}
            >
              {isRendering ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-white rounded-full animate-spin" />
                  <span>Simulation en cours...</span>
                </>
              ) : (
                <>
                  <span>⚡ Simuler le Rendu (Dry-Run)</span>
                </>
              )}
            </button>
          </div>

          {/* Dual-column body */}
          <div className="flex-1 flex overflow-hidden min-h-[600px] h-[650px]">
            {/* Left Column (Inputs) */}
            <div className="w-1/2 border-r border-slate-200 flex flex-col overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-50/30">
                <button
                  onClick={() => setSandboxActiveTab('claim')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                    sandboxActiveTab === 'claim'
                      ? 'border-blue-600 text-blue-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                  }`}
                >
                  📄 Claim
                </button>
                <button
                  onClick={() => setSandboxActiveTab('composition')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                    sandboxActiveTab === 'composition'
                      ? 'border-blue-600 text-blue-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                  }`}
                >
                  🛠️ Composition
                </button>
              </div>

              <div className="flex-1 overflow-hidden relative bg-white">
                {sandboxActiveTab === 'claim' ? (
                  <MonacoEditor
                    height="100%"
                    language="yaml"
                    theme="vs-light"
                    value={sandboxClaimYaml}
                    onChange={(val) => setSandboxClaimYaml(val || '')}
                    options={{ minimap: { enabled: false }, automaticLayout: true }}
                  />
                ) : (
                  <MonacoEditor
                    height="100%"
                    language="yaml"
                    theme="vs-light"
                    value={sandboxCompYaml}
                    onChange={(val) => setSandboxCompYaml(val || '')}
                    options={{ minimap: { enabled: false }, automaticLayout: true }}
                  />
                )}
              </div>
            </div>

            {/* Right Column (Outputs) */}
            <div className="w-1/2 flex flex-col overflow-hidden bg-slate-50/30">
              <div className="p-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  📤 Ressources Générées
                </span>
                {renderResult?.cli_available && (
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md">
                    CLI Available
                  </span>
                )}
              </div>

              <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
                {sandboxError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium space-y-1">
                    <p className="font-bold">HTTP Error</p>
                    <p>{sandboxError}</p>
                  </div>
                )}

                {/* If CLI is NOT available, or error field in response */}
                {renderResult && (!renderResult.cli_available || renderResult.error) && (
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-4 shadow-3xs">
                    <div className="flex gap-2.5 items-start">
                      <span className="text-2xl">⚠️</span>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-amber-900">
                          Crossplane CLI non détecté ou requis
                        </h4>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          {renderResult.error || "L'assistant nécessite le binaire CLI `crossplane` officiel pour simuler le rendu des ressources localement via la commande `crossplane beta render`."}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-150 space-y-2">
                      <h5 className="text-xs font-bold text-amber-800">Comment installer le CLI Crossplane :</h5>
                      <div className="bg-amber-900/10 p-3 rounded-lg font-mono text-[11px] text-amber-900 leading-relaxed whitespace-pre-wrap">
{`# Télécharger et installer le binaire officiel
curl -sL https://cli.crossplane.io/install.sh | sh
sudo mv crossplane /usr/local/bin/

# Vérifier l'installation
crossplane version`}
                      </div>
                      <p className="text-[10px] text-amber-600">
                        Pour en savoir plus, consultez la <a href="https://docs.crossplane.io/latest/cli/" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-amber-800">documentation officielle Crossplane CLI</a>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Render Stderr/Diagnostics panel if any warnings or syntax errors */}
                {renderResult?.stderr && (
                  <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-red-100/50 border-b border-red-150 flex items-center justify-between">
                      <span className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                        🚨 Diagnostics / Erreurs de validation
                      </span>
                    </div>
                    <pre className="p-4 font-mono text-[11px] text-red-700 overflow-x-auto whitespace-pre-wrap bg-white leading-relaxed">
                      {renderResult.stderr}
                    </pre>
                  </div>
                )}

                {/* Output Editor Container */}
                {renderResult?.cli_available && !renderResult.error && (
                  <div className="flex-1 min-h-[300px] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
                    <MonacoEditor
                      height="100%"
                      language="yaml"
                      theme="vs-light"
                      value={renderResult.stdout || ''}
                      options={{ readOnly: true, minimap: { enabled: false }, automaticLayout: true }}
                    />
                  </div>
                )}

                {/* Initial Instruction State if no simulation run yet */}
                {!renderResult && !sandboxError && !isRendering && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-250 rounded-2xl my-4 min-h-[300px]">
                    <span className="text-3xl mb-2">⚡</span>
                    <h4 className="font-bold text-slate-700 text-sm">Prêt pour la Simulation</h4>
                    <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                      Cliquez sur le bouton "Simuler le Rendu (Dry-Run)" ci-dessus pour exécuter le moteur de rendu Crossplane localement.
                    </p>
                  </div>
                )}
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isCanvasView) {
                searchParams.delete('view');
              } else {
                searchParams.set('view', 'canvas');
              }
              setSearchParams(searchParams);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-lg border transition-all cursor-pointer ${
              isCanvasView
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs animate-pulse'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs hover:text-slate-900'
            }`}
          >
            <span>🎨 Visual Canvas</span>
          </button>

          <button
            onClick={() => handleSelect('sandbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-lg border transition-all cursor-pointer ${
              selected === 'sandbox'
                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs hover:text-slate-900'
            }`}
          >
            <span>🧪 Sandbox</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Workspace Splits */}
      {isCanvasView ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/20 animate-fadeIn h-full">
          {/* Fallback Warning Banner if there's an AST parser error */}
          {canvasParseError && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-amber-800 text-xs font-semibold flex items-center gap-2 flex-none">
              <span className="text-sm">⚠️</span>
              <span>{canvasParseError}</span>
            </div>
          )}
          
          <div className="flex-1 flex overflow-hidden h-full">
            {/* Left Panel: Monaco YAML Editor */}
            <div className="w-1/2 border-r border-slate-200 flex flex-col bg-white h-full">
              <div className="px-4 py-2 border-b bg-slate-50/50 flex items-center justify-between flex-none">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Hammer className="w-3.5 h-3.5 text-slate-500" /> Monaco Editor (Source of Truth)
                </span>
                <span className="text-[10px] text-slate-400 italic">Auto-syncs bi-directionally</span>
              </div>
              <div className="flex-1 relative">
                <MonacoEditor
                  height="100%"
                  language="yaml"
                  theme="vs-light"
                  value={localYaml}
                  onChange={(val) => setLocalYaml(val || '')}
                  options={{ minimap: { enabled: false }, automaticLayout: true }}
                />
              </div>
            </div>

            {/* Right Panel: React Flow Canvas & Side Inspector */}
            <div className="w-1/2 flex relative overflow-hidden h-full">
              <div className="flex-1 flex flex-col h-full bg-slate-50/20">
                <div className="px-4 py-2 border-b bg-slate-50/50 flex items-center justify-between flex-none">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Interactive Canvas (No-Code Builder)
                  </span>
                  <span className="text-[10px] text-slate-400 italic">Drag connections to patch fields</span>
                </div>
                <div className="flex-1 p-4 overflow-hidden h-full">
                  <CompositionCanvas
                    yamlString={localYaml}
                    onYamlChange={setLocalYaml}
                    onSelectEdge={setSelectedEdge}
                  />
                </div>
              </div>

              {/* Transform side inspector if a patch edge is clicked */}
              {selectedEdge && (
                <TransformInspector
                  selectedEdge={selectedEdge}
                  yamlString={localYaml}
                  onYamlChange={setLocalYaml}
                  onClose={() => setSelectedEdge(null)}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
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
                <div className="flex items-center gap-4">
                  {/* Zoom controls */}
                  {!isGraphCollapsed && (
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-2xs text-[10px] font-semibold text-slate-600">
                      <span className="text-slate-400 mr-1 select-none">Zoom :</span>
                      <button
                        onClick={handleZoomOut}
                        disabled={zoom <= 50}
                        className="px-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                        title="Zoom arrière"
                      >
                        ➖
                      </button>
                      <button
                        onClick={handleZoomReset}
                        className="px-1 hover:bg-slate-100 rounded cursor-pointer font-mono"
                        title="Réinitialiser zoom"
                      >
                        {zoom}%
                      </button>
                      <button
                        onClick={handleZoomIn}
                        disabled={zoom >= 150}
                        className="px-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                        title="Zoom avant"
                      >
                        ➕
                      </button>
                    </div>
                  )}

                  {/* Height controls */}
                  {!isGraphCollapsed && (
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-2xs text-[10px] font-semibold text-slate-600">
                      <span className="text-slate-400 mr-1 select-none">Hauteur :</span>
                      <button
                        onClick={handleHeightDecrease}
                        disabled={maxHeight <= 200}
                        className="px-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                        title="Diminuer la hauteur"
                      >
                        ⬇️
                      </button>
                      <span className="font-mono">{maxHeight}px</span>
                      <button
                        onClick={handleHeightIncrease}
                        disabled={maxHeight >= 800}
                        className="px-1 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                        title="Augmenter la hauteur"
                      >
                        ⬆️
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setIsGraphCollapsed(!isGraphCollapsed)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-md font-semibold text-[10px] text-slate-600 hover:text-slate-800 transition-colors cursor-pointer shadow-xs"
                  >
                    {isGraphCollapsed ? 'Expand Diagram ↓' : 'Collapse Diagram ↑'}
                  </button>
                </div>
              </div>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isGraphCollapsed ? 'max-h-0 opacity-0' : 'opacity-100'
                }`}
                style={{ maxHeight: isGraphCollapsed ? '0px' : `${maxHeight + 50}px` }}
              >
                <CompositionGraph
                  composition={composition}
                  activeNodeId={selected}
                  onSelectNode={handleSelect}
                  maxHeight={maxHeight}
                  zoom={zoom}
                />
              </div>
            </div>

            {/* Bottom Selected Details Section */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/10">
              {renderMainPane()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
