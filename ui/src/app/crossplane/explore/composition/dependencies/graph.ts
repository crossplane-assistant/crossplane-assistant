export interface ResourcesGraph {
  resources: ResourceTemplate[];
  edges: Edge[];
}

export interface Edge {
  src: PatchRef;
  dst: PatchRef;
  path: string;
}

export interface ResourceTemplate {
  name: string;
  base: any;
  patches: Patch[];
}

export interface PatchRef {
  resourceRef: ResourceRef;
  patchIdx: number;
}

export interface ResourceRef {
  name?: string;
  index: number;
}

export interface Patch {
  type: string;
  fromFieldPath: string;
  toFieldPath: string;
}
