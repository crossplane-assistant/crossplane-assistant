export interface XRD {
  metadata: Metadata;
}

export interface Metadata {
  name: string;
}

export interface XRDExtended {
  manifest: any;

  established: boolean;
  offered: boolean;
  age: Date;
}
