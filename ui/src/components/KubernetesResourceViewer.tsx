import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import MonacoEditor from '@monaco-editor/react';
import { stringify } from 'yaml';
import { ResourceContext } from '../types';
import { ResourcePanel } from './ResourcePanel';
import { ResourceDependencyViewer } from './ResourceDependencyViewer';
import { ResourceDataFlowViewer } from './ResourceDataFlowViewer';

interface ViewerProps {
  context: ResourceContext;
}

export const KubernetesResourceViewer: React.FC<ViewerProps> = ({ context }) => {
  const { resource, defaultOpen } = context;
  const k8sManifest = resource?.base?.spec?.forProvider?.manifest;
  const yamlK8s = k8sManifest ? stringify(k8sManifest) : '';
  const yamlFull = resource ? stringify(resource) : '';

  return (
    <ResourcePanel resourceType="kubernetes" resource={resource} defaultOpen={defaultOpen}>
      <Tabs.Root defaultValue="kubernetes" className="flex flex-col w-full">
        <Tabs.List className="flex border-b border-slate-200 gap-4 mb-4">
          <Tabs.Trigger
            value="kubernetes"
            className="px-4 py-2 text-sm font-medium text-slate-600 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 focus:outline-none cursor-pointer transition-colors"
          >
            Kubernetes
          </Tabs.Trigger>
          <Tabs.Trigger
            value="manifest"
            className="px-4 py-2 text-sm font-medium text-slate-600 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 focus:outline-none cursor-pointer transition-colors"
          >
            YAML
          </Tabs.Trigger>
          <Tabs.Trigger
            value="dependencies"
            className="px-4 py-2 text-sm font-medium text-slate-600 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 focus:outline-none cursor-pointer transition-colors"
          >
            Dependencies
          </Tabs.Trigger>
          <Tabs.Trigger
            value="flow"
            className="px-4 py-2 text-sm font-medium text-slate-600 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 focus:outline-none cursor-pointer transition-colors"
          >
            Data Flow
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="kubernetes" className="h-[300px] border border-slate-200 rounded-lg overflow-hidden shadow-inner">
          <MonacoEditor
            height="100%"
            language="yaml"
            theme="vs-light"
            value={yamlK8s}
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
        </Tabs.Content>

        <Tabs.Content value="manifest" className="h-[300px] border border-slate-200 rounded-lg overflow-hidden shadow-inner">
          <MonacoEditor
            height="100%"
            language="yaml"
            theme="vs-light"
            value={yamlFull}
            options={{ readOnly: true, minimap: { enabled: false } }}
          />
        </Tabs.Content>

        <Tabs.Content value="dependencies" className="mt-2 animate-fadeIn">
          <ResourceDependencyViewer context={context} />
        </Tabs.Content>

        <Tabs.Content value="flow" className="mt-2 animate-fadeIn">
          <ResourceDataFlowViewer context={context} />
        </Tabs.Content>
      </Tabs.Root>
    </ResourcePanel>
  );
};
