import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useManagedResourceKinds,
  useManagedResources,
  useDeleteManagedResource,
} from '../queries/useManagedResourceQueries';
import { ResourceListView } from './ResourceListView';
import { ManagedResourceKind } from '../types';
import { Search, ChevronDown, ChevronRight, AlertCircle, Package, Layers } from 'lucide-react';

const MR_TEMPLATE = `apiVersion: s3.aws.upbound.io/v1beta1
kind: Bucket
metadata:
  name: my-app-static-bucket
spec:
  forProvider:
    region: us-east-1
  providerConfigRef:
    name: default
`;

export const getProviderLabel = (k: ManagedResourceKind): string => {
  if (k.provider) {
    const clean = k.provider.replace(/^provider-/, '');
    return clean.toUpperCase();
  }
  const group = k.group || '';
  const lower = group.toLowerCase();
  if (lower.includes('aws.')) return 'AWS';
  if (lower.includes('gcp.') || lower.includes('google.')) return 'GCP';
  if (lower.includes('azure.')) return 'Azure';
  if (lower.includes('kubernetes.') || lower.includes('k8s.')) return 'KUBERNETES';
  if (lower.includes('helm.')) return 'HELM';
  
  const parts = group.split('.');
  if (parts.length >= 2) {
    const candidate = parts[parts.length - 3] || parts[0];
    return candidate.toUpperCase();
  }
  return 'OTHER';
};

export const ListManagedResources: React.FC = () => {
  const { data: kinds = [], isLoading: kindsLoading, error: kindsError } = useManagedResourceKinds();
  const [selectedKind, setSelectedKind] = useState<ManagedResourceKind | undefined>(undefined);

  const { data: resources = [], isLoading: resourcesLoading, error: resourcesError } = useManagedResources(selectedKind);
  const deleteMutation = useDeleteManagedResource();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryGroup = searchParams.get('group');
  const queryKind = searchParams.get('kind');

  // Sidebar search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'unhealthy'>('active');
  const [collapsedProviders, setCollapsedProviders] = useState<Record<string, boolean>>({});

  // Smart initial selection logic on load / kind parameter query
  useEffect(() => {
    if (kinds.length > 0) {
      if (queryKind) {
        const matched = kinds.find(
          (k) =>
            k.kind.toLowerCase() === queryKind.toLowerCase() &&
            (!queryGroup || k.group.toLowerCase() === queryGroup.toLowerCase())
        );
        if (matched) {
          setSelectedKind(matched);
          return;
        }
      }

      // If no kind param, find the first active/unhealthy kind, or fallback
      const firstUnhealthy = kinds.find(
        (k) => (k.totalItems || 0) > 0 && (k.readyItems || 0) < (k.totalItems || 0)
      );
      if (firstUnhealthy) {
        setSelectedKind(firstUnhealthy);
        setSearchParams({ kind: firstUnhealthy.kind, group: firstUnhealthy.group });
        return;
      }

      const firstActive = kinds.find((k) => (k.totalItems || 0) > 0);
      if (firstActive) {
        setSelectedKind(firstActive);
        setSearchParams({ kind: firstActive.kind, group: firstActive.group });
        return;
      }

      if (!selectedKind && kinds[0]) {
        setSelectedKind(kinds[0]);
        setSearchParams({ kind: kinds[0].kind, group: kinds[0].group });
      }
    }
  }, [kinds, queryKind, queryGroup, setSearchParams]);

  const handleSelectKind = (k: ManagedResourceKind) => {
    setSelectedKind(k);
    setSearchParams({ kind: k.kind, group: k.group });
  };

  const toggleProviderCollapsed = (providerName: string) => {
    setCollapsedProviders((prev) => ({
      ...prev,
      [providerName]: !prev[providerName],
    }));
  };

  // Process, filter & group the kinds array
  const kindsByProvider = useMemo(() => {
    let list = kinds;

    // Apply Search Query Filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (k) =>
          k.kind.toLowerCase().includes(q) ||
          k.group.toLowerCase().includes(q) ||
          getProviderLabel(k).toLowerCase().includes(q)
      );
    }

    // Apply Active / Unhealthy Tab Filters
    if (filterTab === 'active') {
      list = list.filter((k) => (k.totalItems || 0) > 0);
    } else if (filterTab === 'unhealthy') {
      list = list.filter((k) => (k.totalItems || 0) > 0 && (k.readyItems || 0) < (k.totalItems || 0));
    }

    // Group elements by Provider Label
    const groups: Record<string, ManagedResourceKind[]> = {};
    list.forEach((k) => {
      const prov = getProviderLabel(k);
      if (!groups[prov]) {
        groups[prov] = [];
      }
      groups[prov].push(k);
    });

    // Sort kinds inside each provider group alphabetically
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.kind.localeCompare(b.kind));
    });

    return groups;
  }, [kinds, searchTerm, filterTab]);

  const totalKindsCount = kinds.length;
  const filteredKindsCount = Object.values(kindsByProvider).reduce((acc, list) => acc + list.length, 0);

  const getConditions = (mr: any) => mr.status?.conditions || [];
  const getStatus = (mr: any, type: string) => {
    const conditions = getConditions(mr);
    return conditions.find((c: any) => c.type === type)?.status || 'Unknown';
  };

  const columns = [
    {
      header: 'Name',
      render: (r: any) => <span className="font-semibold text-blue-600 font-mono">{r.metadata?.name}</span>,
    },
    {
      header: 'Synced',
      render: (r: any) => {
        const status = getStatus(r, 'Synced');
        const color = status === 'True' ? 'bg-green-500' : 'bg-red-500';
        return (
          <span className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-600">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} /> {status}
          </span>
        );
      },
    },
    {
      header: 'Ready',
      render: (r: any) => {
        const status = getStatus(r, 'Ready');
        const color = status === 'True' ? 'bg-green-500' : 'bg-red-500';
        return (
          <span className="inline-flex items-center gap-1.5 font-medium text-xs text-slate-600">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} /> {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex h-[calc(100vh-120px)] w-full gap-6 overflow-hidden max-w-7xl mx-auto pb-4">
      {/* Sidebar: Kinds Explorer */}
      <div className="w-80 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-shrink-0 h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-500" /> Kinds Explorer
            </h2>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-150 px-1.5 py-0.5 rounded-full">
              {filteredKindsCount}/{totalKindsCount}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Filter resource kinds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex p-0.5 bg-slate-150 rounded-lg">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                filterTab === 'active'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterTab('unhealthy')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                filterTab === 'unhealthy'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Unhealthy
            </button>
          </div>
        </div>

        {/* Scrollable Accordions */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-white">
          {Object.keys(kindsByProvider).length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 italic">
              No matching kinds found.
            </div>
          ) : (
            Object.keys(kindsByProvider)
              .sort()
              .map((provider) => {
                const groupKinds = kindsByProvider[provider];
                const isCollapsed = !!collapsedProviders[provider];
                const totalActiveInGroup = groupKinds.reduce((acc, k) => acc + (k.totalItems || 0), 0);
                const totalReadyInGroup = groupKinds.reduce((acc, k) => acc + (k.readyItems || 0), 0);
                const hasUnhealthyInGroup = totalReadyInGroup < totalActiveInGroup;

                return (
                  <div key={provider} className="border border-slate-100 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleProviderCollapsed(provider)}
                      className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {isCollapsed ? (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}
                        <Package className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{provider}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {totalActiveInGroup > 0 && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                              hasUnhealthyInGroup
                                ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {totalReadyInGroup}/{totalActiveInGroup}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">({groupKinds.length})</span>
                      </div>
                    </button>

                    {!isCollapsed && (
                      <div className="divide-y divide-slate-50 bg-white">
                        {groupKinds.map((k) => {
                          const isSelected =
                            selectedKind &&
                            selectedKind.kind === k.kind &&
                            selectedKind.group === k.group;

                          const total = k.totalItems || 0;
                          const ready = k.readyItems || 0;
                          const isUnhealthy = total > 0 && ready < total;

                          return (
                            <button
                              key={`${k.group}/${k.kind}`}
                              onClick={() => handleSelectKind(k)}
                              className={`w-full flex items-center justify-between py-1.5 pr-2.5 text-left text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50/40 text-blue-600 border-l-4 border-blue-500 font-semibold pl-2.5'
                                  : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent pl-3'
                              }`}
                            >
                              <span className="truncate mr-2" title={`${k.kind} (${k.group})`}>
                                {k.kind}
                              </span>
                              {total > 0 && (
                                <span
                                  className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono leading-none ${
                                    isUnhealthy
                                      ? 'bg-rose-50 text-rose-600 border border-rose-100/50'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {isUnhealthy ? `${ready}/${total} ⚠️` : `${total}`}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Main Content Area: Resource Instance Table */}
      <div className="flex-1 overflow-hidden h-full flex flex-col">
        {selectedKind ? (
          <ResourceListView
            title={selectedKind.kind}
            description={`List of ${selectedKind.kind} instances (${selectedKind.group}/${selectedKind.version}).`}
            docLink={{
              label: 'official documentation',
              url: 'https://docs.crossplane.io/latest/concepts/managed-resources/',
            }}
            data={resources}
            isLoading={kindsLoading || (resourcesLoading && resources.length === 0)}
            error={kindsError || resourcesError}
            columns={columns}
            getRowName={(r) => r.metadata?.name || ''}
            onDelete={async (r) => {
              await deleteMutation.mutateAsync({
                kindObj: selectedKind,
                name: r.metadata?.name || '',
              });
            }}
            createModalTemplate={MR_TEMPLATE}
            createModalTitle={`Create ${selectedKind.kind}`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-700 text-sm mb-1">No Kind Selected</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Select a resource kind from the explorer sidebar to view active instances in the cluster.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
