export interface ResourceRef {
  index: number;
  apiVersion: string;
  kind: string;
  name: string;
}

export interface Edge {
  src: { resourceRef: ResourceRef };
  dst: { resourceRef: ResourceRef };
}

export interface ResourcesGraph {
  resources: any[];
  edges: Edge[];
}

export interface ResourceContext {
  resource: any;
  resourceIndex: number;
  composition: any;
  graph: ResourcesGraph | undefined;
}

export interface Item {
  index: number;
  apiVersion: string;
  kind: string;
  name: string;
}

export interface ResourceDependencies {
  resource: any;
  in: Item[];
  out: Item[];
}

export interface Composition {
  metadata: {
    name: string;
    creationTimestamp: string;
    [key: string]: any;
  };
  spec: {
    compositeTypeRef: {
      apiVersion: string;
      kind: string;
    };
    resources?: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface CompositionExtended {
  manifest: Composition;
  age: string;
}

export interface Ref {
  apiVersion: string;
  kind: string;
  name: string;
  namespace?: string;
}

export function encodeRef(ref: Ref): string {
  const namespace = ref.namespace ? ref.namespace : '';
  return encodeURIComponent(
    `${ref.apiVersion}:${ref.kind}:${ref.name}:${namespace}`
  );
}

export interface ManagedResourceKind {
  provider: string;
  group: string;
  version: string;
  kind: string;
  resource: string;
}
