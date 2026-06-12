import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useManagedResourceKinds,
  useManagedResources,
  useDeleteManagedResource,
} from '../queries/useManagedResourceQueries';
import { ResourceListView } from './ResourceListView';
import { ManagedResourceKind } from '../types';

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

export const ListManagedResources: React.FC = () => {
  const { data: kinds = [], isLoading: kindsLoading, error: kindsError } = useManagedResourceKinds();
  const [selectedKind, setSelectedKind] = useState<ManagedResourceKind | undefined>(undefined);

  const { data: resources = [], isLoading: resourcesLoading, error: resourcesError } = useManagedResources(selectedKind);
  const deleteMutation = useDeleteManagedResource();

  const [searchParams] = useSearchParams();
  const queryGroup = searchParams.get('group');
  const queryKind = searchParams.get('kind');

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
      if (!selectedKind) {
        setSelectedKind(kinds[0]);
      }
    }
  }, [kinds, selectedKind, queryKind, queryGroup]);

  const getConditions = (mr: any) => mr.status?.conditions || [];
  const getStatus = (mr: any, type: string) => {
    const conditions = getConditions(mr);
    return conditions.find((c: any) => c.type === type)?.status || 'Unknown';
  };

  const handleKindChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const matched = kinds.find((k) => `${k.group}/${k.version}:${k.kind}` === e.target.value);
    setSelectedKind(matched);
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

  const dropdownArea = kinds.length > 0 && (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kind:</span>
      <select
        value={selectedKind ? `${selectedKind.group}/${selectedKind.version}:${selectedKind.kind}` : ''}
        onChange={handleKindChange}
        className="px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm cursor-pointer"
      >
        {kinds.map((k, idx) => (
          <option key={idx} value={`${k.group}/${k.version}:${k.kind}`}>
            {k.kind} ({k.group})
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <ResourceListView
      title="Managed Resources"
      description="List of Managed Resources active in the cluster."
      docLink={{ label: 'official documentation', url: 'https://docs.crossplane.io/latest/concepts/managed-resources/' }}
      data={resources}
      isLoading={kindsLoading || (resourcesLoading && resources.length === 0)}
      error={kindsError || resourcesError}
      columns={columns}
      getRowName={(r) => r.metadata?.name || ''}
      onDelete={async (r) => {
        if (selectedKind) {
          await deleteMutation.mutateAsync({
            kindObj: selectedKind,
            name: r.metadata?.name || '',
          });
        }
      }}
      headerRightArea={dropdownArea}
      createModalTemplate={MR_TEMPLATE}
      createModalTitle={selectedKind ? `Create ${selectedKind.kind}` : 'Create Managed Resource'}
    />
  );
};
