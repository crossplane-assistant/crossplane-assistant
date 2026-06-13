import React from 'react';
import { Link } from 'react-router-dom';
import { encodeRef } from '../types';
import { useClaims } from '../queries/useClaimQueries';
import { Link2, ArrowRight, Layers, FileText, Settings, ShieldAlert } from 'lucide-react';

interface ResourceRelationsProps {
  resource: any;
}

export const ResourceRelations: React.FC<ResourceRelationsProps> = ({ resource }) => {
  if (!resource) return null;

  const apiVersion = resource.apiVersion || '';
  const kind = resource.kind || '';
  const metadata = resource.metadata || {};
  const spec = resource.spec || {};

  // Composition-specific relationship lookup (Blueprint -> Running Instances)
  if (kind === 'Composition') {
    const compositeTypeRef = spec.compositeTypeRef;
    const { data: claims = [], isLoading, error } = useClaims();

    // Filter claims by compositeTypeRef GVK
    const matchingClaims = claims.filter((claim: any) => {
      if (!compositeTypeRef) return false;
      
      const compositeParts = compositeTypeRef.apiVersion.split('/');
      const claimParts = claim.apiVersion.split('/');
      
      const compositeGroup = compositeParts[0];
      const claimGroup = claimParts[0];
      if (compositeGroup !== claimGroup) return false;
      
      const compKind = compositeTypeRef.kind;
      const claimKind = claim.kind;
      const cleanCompKind = compKind.startsWith('X') ? compKind.slice(1) : compKind;
      const cleanClaimKind = claimKind.startsWith('X') ? claimKind.slice(1) : claimKind;
      
      return cleanCompKind.toLowerCase() === cleanClaimKind.toLowerCase();
    });

    return (
      <div className="space-y-6">
        {/* XRD Interface Info */}
        {compositeTypeRef && (
          <div className="border border-slate-100 bg-slate-50/30 rounded-xl p-4 shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" /> Implemented XRD Interface
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono font-bold text-slate-700 truncate">
                  {compositeTypeRef.kind}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {compositeTypeRef.apiVersion}
                </div>
              </div>
              <div className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold border border-blue-200/50">
                Interface Signature
              </div>
            </div>
          </div>
        )}

        {/* Active Claims List */}
        <div className="border border-slate-100 bg-slate-50/30 rounded-xl p-4 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
            <FileText className="w-3.5 h-3.5 text-indigo-500" /> Active Claims ({matchingClaims.length})
          </div>
          {isLoading ? (
            <div className="text-xs text-slate-400 animate-pulse text-center py-4">Loading active claims...</div>
          ) : error ? (
            <div className="text-xs text-red-400 text-center py-4">Error loading claims: {(error as Error).message}</div>
          ) : matchingClaims.length === 0 ? (
            <div className="text-xs text-slate-400 italic text-center py-4">
              No active namespace Claims found for this Composition's GVK interface.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {matchingClaims.map((claim: any, idx: number) => {
                const ref = {
                  apiVersion: claim.apiVersion,
                  kind: claim.kind,
                  name: claim.metadata?.name,
                  namespace: claim.metadata?.namespace,
                };
                const encoded = encodeRef(ref);

                return (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs bg-white border border-slate-100 rounded-lg p-2.5 shadow-2xs hover:border-slate-200 transition-all">
                    <div className="min-w-0 flex-1">
                      <div className="font-mono font-bold text-slate-700 truncate" title={claim.metadata?.name}>
                        {claim.metadata?.namespace ? `${claim.metadata.namespace}/` : ''}{claim.metadata?.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {claim.kind} ({claim.apiVersion})
                      </div>
                    </div>
                    <Link
                      to={`/explore/claims/${encoded}`}
                      className="flex items-center gap-0.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 font-bold text-[10px] rounded-md transition-all cursor-pointer border border-indigo-100 hover:border-indigo-200 flex-shrink-0"
                    >
                      Go to Graph <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 1. Extract Claim Ref (if we are an XR/Composite Resource)
  const claimRef = spec.claimRef;

  // 2. Extract Composite Ref (if we are a Claim)
  const resourceRef = spec.resourceRef;

  // 3. Extract Composed Managed Resources Refs (if we are an XR)
  const resourceRefs = spec.resourceRefs || [];

  // 4. Extract ProviderConfig Ref (if we are a Managed Resource)
  const providerConfigRef = spec.providerConfigRef;

  // 5. Extract Parent Composite Resource from OwnerReferences (if we are an MR)
  const ownerRefs = metadata.ownerReferences || [];
  const parentXRRef = ownerRefs.find(
    (ref: any) => ref.controller === true && !ref.kind.includes('Provider')
  );

  const hasRelations =
    claimRef || resourceRef || resourceRefs.length > 0 || providerConfigRef || parentXRRef;

  if (!hasRelations) {
    return (
      <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 italic text-center text-xs flex flex-col items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-slate-300" />
        No explicit Crossplane relationships detected for this resource.
      </div>
    );
  }

  // Helper to determine GVK details for a standard GVK string
  const parseGVK = (apiVersion: string, kind: string) => {
    const parts = apiVersion.split('/');
    const group = parts.length > 1 ? parts[0] : '';
    const version = parts.length > 1 ? parts[1] : apiVersion;
    return { group, version, kind };
  };

  return (
    <div className="space-y-6">
      {/* 1. Claim Relation Link */}
      {claimRef && (
        <div className="border border-slate-100 bg-slate-50/30 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            <FileText className="w-3.5 h-3.5 text-blue-500" /> Owning Claim (App Interface)
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono font-bold text-slate-700 truncate">
                {claimRef.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {claimRef.kind} ({claimRef.apiVersion}) in namespace: {claimRef.namespace}
              </div>
            </div>
            <Link
              to={`/explore/claims/${encodeRef({
                apiVersion: claimRef.apiVersion,
                kind: claimRef.kind,
                name: claimRef.name,
                namespace: claimRef.namespace,
              })}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-blue-150 hover:border-blue-200"
            >
              Go to Graph <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* 2. Composite Resource (XR) Relation Link */}
      {resourceRef && (
        <div className="border border-slate-100 bg-slate-50/30 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Bound Composite Resource (XR)
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono font-bold text-slate-700 truncate">
                {resourceRef.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {resourceRef.kind} ({resourceRef.apiVersion})
              </div>
            </div>
            <Link
              to={`/explore/claims/${encodeRef({
                apiVersion: apiVersion,
                kind: kind,
                name: metadata.name,
                namespace: metadata.namespace,
              })}?activeName=${resourceRef.name}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-indigo-150 hover:border-indigo-200"
            >
              Inspect XR <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. Parent Composite Resource Link (For Managed Resources) */}
      {parentXRRef && (
        <div className="border border-slate-100 bg-slate-50/30 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Parent Composite Resource (Owner)
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono font-bold text-slate-700 truncate">
                {parentXRRef.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {parentXRRef.kind} ({parentXRRef.apiVersion})
              </div>
            </div>
            {/* Try to resolve a parent claim reference if possible or route to claims list */}
            <Link
              to={`/explore/claims`}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-indigo-150 hover:border-indigo-200"
            >
              Explore Claims <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* 4. ProviderConfig Relation Link */}
      {providerConfigRef && (
        <div className="border border-slate-100 bg-slate-50/30 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            <Settings className="w-3.5 h-3.5 text-amber-500" /> Active Provider Config
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono font-bold text-slate-700 truncate">
                {providerConfigRef.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Target configuration for cloud provider API credentials.
              </div>
            </div>
            <div className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold border border-slate-200/50">
              Ref: {providerConfigRef.name}
            </div>
          </div>
        </div>
      )}

      {/* 5. Composed Resources (MRs) List */}
      {resourceRefs.length > 0 && (
        <div className="border border-slate-100 bg-slate-50/30 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
            <Link2 className="w-3.5 h-3.5 text-emerald-500" /> Composed Resources ({resourceRefs.length})
          </div>
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {resourceRefs.map((ref: any, idx: number) => {
              const gvk = parseGVK(ref.apiVersion, ref.kind);
              return (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs bg-white border border-slate-100 rounded-lg p-2.5 shadow-2xs hover:border-slate-200 transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono font-bold text-slate-700 truncate" title={ref.name}>
                      {ref.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {ref.kind}
                    </div>
                  </div>
                  <Link
                    to={`/explore/managed-resources?group=${gvk.group}&kind=${gvk.kind}&name=${ref.name}`}
                    className="flex items-center gap-0.5 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 font-semibold text-[10px] rounded-md transition-all cursor-pointer border border-emerald-100 hover:border-emerald-200 flex-shrink-0"
                  >
                    Go to List <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
