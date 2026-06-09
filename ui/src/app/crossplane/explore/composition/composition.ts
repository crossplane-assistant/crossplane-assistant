export interface Composition {
  metadata: Metadata;

  manifest: any;
}

export interface Metadata {
  name: string;
}

export interface CompositionExtended {
  manifest: any;
  established: boolean;
  offered: boolean;
  age: Date;
}
