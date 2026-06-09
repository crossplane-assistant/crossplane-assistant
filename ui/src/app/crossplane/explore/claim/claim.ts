export interface Claim {
  metadata: Metadata;
}

export interface Metadata {
  name: string;
}

export interface ClaimExtended {
  manifest: any;
  synced: any;
  ready: any;
}
