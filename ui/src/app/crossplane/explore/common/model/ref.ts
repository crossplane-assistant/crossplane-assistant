export interface Ref {
  apiVersion: string;
  kind: string;
  name: string;
  namespace?: string;
}

export function encodeRef(ref: Ref) {
  // deal with cluster wide objects
  const namespace = ref.namespace ? ref.namespace : '';

  return encodeURIComponent(
    `${ref.apiVersion}:${ref.kind}:${ref.name}:${namespace}`
  );
}

export function decodeRef(serializedRef: string): Ref {
  const parts = serializedRef.split(':');
  return {
    apiVersion: parts[0],
    kind: parts[1],
    name: parts[2],
    namespace: parts[3],
  };
}
