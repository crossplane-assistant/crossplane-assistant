export interface ManagedResource {
    metadata: Metadata;
}

export interface Metadata {
    name: string;
}

export interface ManagedResourceExtended {
    manifest: any;
    synced: any;
    ready: any;
}

export interface ManagedResourceKind {
    provider: string
    group: string
    version: string
    kind: string
    resource: string
}
