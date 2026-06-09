export interface Provider {
    metadata: Metadata;
}

export interface Metadata {
    name: string;
}

export interface ProviderExtended {
    manifest: any;
    healthy: any;
    installed: any;
}
