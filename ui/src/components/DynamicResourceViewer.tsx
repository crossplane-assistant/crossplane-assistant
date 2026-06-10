import React from 'react';
import { ResourceContext } from '../types';
import { KubernetesResourceViewer } from './KubernetesResourceViewer';
import { TerraformResourceViewer } from './TerraformResourceViewer';
import { GenericResourceViewer } from './GenericResourceViewer';

interface DynamicResourceViewerProps {
  context: ResourceContext;
}

interface ViewerProvider {
  isSupported: (apiVersion: string, kind: string) => boolean;
  Component: React.ComponentType<{ context: ResourceContext }>;
}

const VIEWER_PROVIDERS: ViewerProvider[] = [
  {
    isSupported: (apiVersion, kind) =>
      apiVersion.startsWith('kubernetes.crossplane.io') && kind === 'Object',
    Component: KubernetesResourceViewer,
  },
  {
    isSupported: (apiVersion) =>
      apiVersion.startsWith('tf.crossplane.io') || apiVersion.toLowerCase().includes('terraform'),
    Component: TerraformResourceViewer,
  },
];

export const DynamicResourceViewer: React.FC<DynamicResourceViewerProps> = ({ context }) => {
  const { resource } = context;
  const apiVersion = resource?.base?.apiVersion || '';
  const kind = resource?.base?.kind || '';

  const provider = VIEWER_PROVIDERS.find((p) => p.isSupported(apiVersion, kind));
  const SelectedViewer = provider ? provider.Component : GenericResourceViewer;

  return <SelectedViewer context={context} />;
};
