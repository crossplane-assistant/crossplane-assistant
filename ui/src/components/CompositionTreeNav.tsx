import React from 'react';
import { 
  Cpu, 
  Layers, 
  FileText, 
  Activity, 
  Settings
} from 'lucide-react';

interface TreeNavProps {
  composition: any;
  selected: string;
  onSelect: (key: string) => void;
  matchingClaims: any[];
}

export const CompositionTreeNav: React.FC<TreeNavProps> = ({
  composition,
  selected,
  onSelect,
  matchingClaims,
}) => {
  const pipeline = composition?.spec?.pipeline || [];
  const legacyResources = composition?.spec?.resources || [];

  // Helper to check if a specific key is selected
  const isSelected = (key: string) => selected === key;

  return (
    <div className="flex flex-col h-full bg-slate-50/50 border-r border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" /> Structure Explorer
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* 🧪 SANDBOX PLAYPEN */}
        <div className="space-y-1">
          <button
            onClick={() => onSelect('sandbox')}
            className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold rounded-lg text-left transition-all border ${
              isSelected('sandbox')
                ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-2xs font-bold'
                : 'text-blue-700 bg-blue-50/50 border-blue-100 hover:bg-blue-50 hover:text-blue-800'
            }`}
          >
            <span className="flex-shrink-0 text-sm">🧪</span>
            <span className="truncate">Sandbox Playpen</span>
          </button>
        </div>

        {/* ⚙️ PIPELINE / BLUEPRINT SECTION */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-400" /> Composition Spec
          </div>

          <div className="space-y-1">
            {pipeline.length > 0 ? (
              pipeline.map((step: any, idx: number) => {
                const stepName = step.step || `step-${idx}`;
                const isPt = step.functionRef?.name?.toLowerCase().includes('patch-and-transform') || false;
                const stepResources = isPt ? (step.input?.resources || []) : [];
                const stepKey = `step:${stepName}`;

                return (
                  <div key={stepName} className="space-y-0.5">
                    {/* Step Node */}
                    <button
                      onClick={() => onSelect(stepKey)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg text-left transition-all ${
                        isSelected(stepKey)
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/50 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100/70'
                      }`}
                    >
                      <Cpu className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected(stepKey) ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
                      <span className="truncate">{stepName}</span>
                    </button>

                    {/* Step Config Sub-node */}
                    <div className="pl-6 border-l border-slate-200/80 ml-4 space-y-0.5">
                      <button
                        onClick={() => onSelect(stepKey)}
                        className={`w-full flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-md text-left transition-colors ${
                          isSelected(stepKey)
                            ? 'text-blue-600 bg-blue-50/30 font-semibold'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/40'
                        }`}
                      >
                        <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>Input Config</span>
                      </button>

                      {/* Composed Resources Sub-nodes */}
                      {stepResources.map((res: any) => {
                        const resKey = `resource:${res.name}`;
                        return (
                          <button
                            key={res.name}
                            onClick={() => onSelect(resKey)}
                            className={`w-full flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-md text-left transition-colors ${
                              isSelected(resKey)
                                ? 'text-indigo-600 bg-indigo-50/40 font-bold border-l-2 border-indigo-500'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/40'
                            }`}
                          >
                            <Layers className={`w-3 h-3 flex-shrink-0 ${isSelected(resKey) ? 'text-indigo-500' : 'text-slate-400'}`} />
                            <span className="truncate font-mono">{res.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : legacyResources.length > 0 ? (
              <div className="space-y-1">
                {legacyResources.map((res: any) => {
                  const resKey = `resource:${res.name}`;
                  return (
                    <button
                      key={res.name}
                      onClick={() => onSelect(resKey)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-lg text-left transition-all ${
                        isSelected(resKey)
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/50 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100/70'
                      }`}
                    >
                      <Layers className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected(resKey) ? 'text-indigo-500' : 'text-slate-400'}`} />
                      <span className="truncate font-mono">{res.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 italic px-2">No spec components resolved.</div>
            )}
          </div>
        </div>

        {/* 👥 ACTIVE INSTANCES (CLAIMS) SECTION */}
        <div className="space-y-2 pt-4 border-t border-slate-200/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-1">
            <Activity className="w-3 h-3 text-slate-400" /> Active Claims ({matchingClaims.length})
          </div>

          <div className="space-y-1">
            {matchingClaims.length > 0 ? (
              matchingClaims.map((claim: any) => {
                const claimName = claim.metadata?.name || '';
                const claimNamespace = claim.metadata?.namespace || '';
                const claimKey = `claim:${claimNamespace ? `${claimNamespace}/${claimName}` : claimName}`;

                return (
                  <button
                    key={claimKey}
                    onClick={() => onSelect(claimKey)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-left transition-all ${
                      isSelected(claimKey)
                        ? 'bg-indigo-50/80 text-indigo-700 border border-indigo-200/40 shadow-2xs font-bold'
                        : 'text-slate-600 hover:bg-slate-100/70'
                    }`}
                  >
                    <Activity className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected(claimKey) ? 'text-indigo-500' : 'text-slate-400'}`} />
                    <span className="truncate font-mono">
                      {claimNamespace ? `${claimNamespace}/` : ''}{claimName}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="text-[10px] text-slate-400 italic px-2">No active claims found on cluster.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
