import React, { useState, useEffect, useRef } from 'react';
import { useClaimDiagnostics } from '../queries/useClaimQueries';
import { Ref } from '../types';
import { 
  Terminal, Copy, Check, Activity, FileText, AlertTriangle, 
  CheckCircle2, RefreshCw, Search, Download, Layers
} from 'lucide-react';

interface ClaimDiagnosticsHubProps {
  claimRef: Ref | undefined;
}

export const ClaimDiagnosticsHub: React.FC<ClaimDiagnosticsHubProps> = ({ claimRef }) => {
  const { data, isLoading, error, refetch, isFetching } = useClaimDiagnostics(claimRef);
  const [selectedResource, setSelectedResource] = useState<{ name: string; kind: string; uid: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first unhealthy resource on load
  useEffect(() => {
    if (data?.tree?.root && !selectedResource) {
      const findFirstUnhealthy = (node: any): any => {
        if (node.status === 'Unready') {
          return node;
        }
        if (node.children) {
          for (const child of node.children) {
            const found = findFirstUnhealthy(child);
            if (found) return found;
          }
        }
        return null;
      };
      const unhealthy = findFirstUnhealthy(data.tree.root);
      if (unhealthy) {
        setSelectedResource({ name: unhealthy.name, kind: unhealthy.kind, uid: unhealthy.uid || '' });
      } else {
        setSelectedResource({ 
          name: data.tree.root.name, 
          kind: data.tree.root.kind, 
          uid: data.tree.root.uid || '' 
        });
      }
    }
  }, [data, selectedResource]);

  // Copy logs handler
  const handleCopyLogs = (lines: string[]) => {
    if (!lines || lines.length === 0) return;
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download logs handler
  const handleDownloadLogs = (lines: string[], filename: string) => {
    if (!lines || lines.length === 0) return;
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_provider_logs.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse font-semibold">
        Fetching real-time diagnostic payload...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 max-w-2xl mx-auto my-6">
        <h3 className="font-extrabold text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Diagnostics Failure
        </h3>
        <p className="mt-2 text-sm">{(error as Error).message || 'Failed to retrieve diagnostics information.'}</p>
        <button 
          onClick={() => refetch()} 
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try Again
        </button>
      </div>
    );
  }

  // Flatten tree nodes for easy listing
  const flattenNodes = (node: any): any[] => {
    if (!node) return [];
    let list = [node];
    if (node.children) {
      for (const child of node.children) {
        list = [...list, ...flattenNodes(child)];
      }
    }
    return list;
  };

  const allResources = data?.tree?.root ? flattenNodes(data.tree.root) : [];
  const selectedLogObj = data?.logs?.find((l: any) => l.resourceName === selectedResource?.name);
  const selectedNodeObj = allResources.find(r => r.name === selectedResource?.name);

  // Filter events based on search
  const filteredEvents = (data?.events || []).filter((ev: any) => {
    if (!searchFilter) return true;
    const filter = searchFilter.toLowerCase();
    return (
      ev.resourceName.toLowerCase().includes(filter) ||
      ev.resourceKind.toLowerCase().includes(filter) ||
      ev.reason.toLowerCase().includes(filter) ||
      ev.message.toLowerCase().includes(filter)
    );
  });

  return (
    <div className="space-y-6">
      {/* Diagnostics Health Summary Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400 animate-pulse">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold flex items-center gap-2">
              Diagnostic Status Summary
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-400">
                Live Poll Active
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
              <span>Total Resources: <b className="text-slate-200">{allResources.length}</b></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                Unhealthy: 
                <b className={allResources.filter(r => r.status === 'Unready').length > 0 ? 'text-red-400' : 'text-green-400'}>
                  {allResources.filter(r => r.status === 'Unready').length}
                </b>
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700/50 rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh Logs'}
        </button>
      </div>

      {/* Main Grid: Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Resource Tree List & Events Timeline */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Resource List / Health Tree */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-500" /> Resource Tree Diagnostics
            </h3>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {allResources.map((res) => {
                const isSelected = selectedResource?.name === res.name;
                const isHealthy = res.status === 'Ready';
                
                return (
                  <button
                    key={res.name}
                    onClick={() => setSelectedResource({ name: res.name, kind: res.kind, uid: res.uid || '' })}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-500/10' 
                        : 'bg-slate-50/30 border-slate-150 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 truncate">
                          {res.name}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1 rounded-sm">
                          {res.metaKind || res.kind}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                        {res.kind} ({res.apiVersion})
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isHealthy ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {res.status}
                      </span>
                      {isHealthy ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aggregated Events Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex-1 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-500" /> Event Timeline (Unified)
              </h3>
              
              {/* Event Filter Input */}
              <div className="relative w-44">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter events..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
              {filteredEvents.length === 0 ? (
                <div className="text-center text-xs text-slate-400 italic py-6">
                  {searchFilter ? 'No events match filter.' : 'No events recorded for these resources.'}
                </div>
              ) : (
                filteredEvents.map((ev: any, index: number) => {
                  const isWarning = ev.type === 'Warning';
                  return (
                    <div key={index} className="flex gap-2.5 text-xs text-slate-600 border-l border-slate-150 pl-3 relative">
                      <div className={`absolute -left-1 top-1.5 w-2 h-2 rounded-full ${
                        isWarning ? 'bg-amber-500' : 'bg-blue-400'
                      }`} />
                      
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-slate-700 font-mono text-[10px]">
                            [{ev.resourceKind}/{ev.resourceName}]
                          </span>
                          <span className={`font-extrabold text-[9px] uppercase px-1 rounded-xs ${
                            isWarning ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {ev.reason}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-auto">
                            {new Date(ev.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-500 leading-relaxed break-all font-mono text-[11px]">
                          {ev.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Correlated Provider Logs Terminal */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="bg-slate-950 border border-slate-900 shadow-2xl rounded-xl p-5 flex flex-col h-full text-slate-100 relative min-h-[460px]">
            
            {/* Terminal Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-extrabold text-slate-200">
                    PROVIDER RECONCILE STREAM: {selectedResource?.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {selectedLogObj ? `Pod: ${selectedLogObj.podName} (${selectedLogObj.namespace})` : 'No active provider stream connected.'}
                  </div>
                </div>
              </div>

              {selectedLogObj?.lines && selectedLogObj.lines.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLogs(selectedLogObj.lines)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400 animate-scaleIn" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                  <button
                    onClick={() => handleDownloadLogs(selectedLogObj.lines, selectedResource?.name || 'resource')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> DOWNLOAD
                  </button>
                </div>
              )}
            </div>

            {/* Terminal Screen Container */}
            <div className="flex-1 bg-slate-900/60 rounded-lg border border-slate-900/80 p-4 font-mono text-[11px] overflow-y-auto max-h-[340px] leading-relaxed custom-terminal-scroll shadow-inner">
              {selectedLogObj?.lines && selectedLogObj.lines.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedLogObj.lines.map((line: string, idx: number) => {
                    const isError = line.toLowerCase().includes('err') || line.toLowerCase().includes('fail');
                    const isWarning = line.toLowerCase().includes('warn') || line.toLowerCase().includes('timeout');
                    return (
                      <div 
                        key={idx} 
                        className={`whitespace-pre-wrap break-all ${
                          isError ? 'text-red-400 font-extrabold' : isWarning ? 'text-amber-400 font-bold' : 'text-emerald-400/90'
                        }`}
                      >
                        <span className="text-slate-500 select-none mr-2 font-mono">{(idx + 1).toString().padStart(3, '0')} |</span>
                        {line}
                      </div>
                    );
                  })}
                  <div ref={terminalEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-slate-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-300 uppercase">
                      No Correlated Reconcile Logs Found
                    </div>
                    <p className="text-[10px] text-slate-500 max-w-sm mt-1 mx-auto leading-relaxed">
                      Either no events occurred recently in this provider for this resource, or the logs have rotated. Falling back to persistent status conditions...
                    </p>
                  </div>
                  
                  {/* Fallback persistent conditions panel */}
                  {selectedNodeObj?.conditions && selectedNodeObj.conditions.length > 0 ? (
                    <div className="w-full max-w-md bg-slate-950 rounded-lg p-3.5 text-left border border-slate-900 text-xs space-y-2 mt-4 font-sans font-medium text-slate-300">
                      <div className="text-[10px] uppercase font-extrabold text-slate-500 font-mono tracking-wider mb-1">
                        Active Condition States:
                      </div>
                      {selectedNodeObj.conditions.map((cond: any, index: number) => {
                        const isTrue = cond.status === 'True';
                        return (
                          <div key={index} className="flex gap-2 border-b border-slate-900/50 pb-2 last:border-0 last:pb-0 font-mono">
                            <span className={`text-[10px] font-bold uppercase ${isTrue ? 'text-green-400' : 'text-red-400'}`}>
                              [{cond.type}={cond.status}]
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="text-slate-400 font-bold">{cond.reason || 'Unknown'}</span>
                              {cond.message && (
                                <p className="text-[10px] text-slate-500 break-all leading-normal mt-0.5">
                                  {cond.message}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-600 italic">No persistent status conditions are present.</div>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};
