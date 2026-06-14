import { parseDocument } from 'yaml';

export interface PatchIR {
  type: string; // e.g. "FromCompositeFieldPath"
  fromFieldPath?: string;
  toFieldPath?: string;
  combine?: any;
  transforms?: any[];
  astPath: (string | number)[];
}

export interface ComposedResourceIR {
  id: string;          // 'name' in Crossplane (e.g. "RDSInstance")
  kind: string;        // base.kind
  apiVersion: string;  // base.apiVersion
  base: any;           // the base object
  patches: PatchIR[];
  astPath: (string | number)[];
}

export interface CompositionIR {
  name: string;
  composite: {
    apiVersion: string;
    kind: string;
  };
  resources: ComposedResourceIR[];
  mode: 'Resources' | 'Pipeline';
}

/**
 * Parses a Crossplane Composition YAML string into a clean, logical Intermediate Representation (IR).
 */
export function parseYAMLToIR(yamlString: string): CompositionIR {
  const defaultIR: CompositionIR = {
    name: 'Unknown',
    composite: { apiVersion: '', kind: '' },
    resources: [],
    mode: 'Resources',
  };

  if (!yamlString || yamlString.trim() === '') {
    return defaultIR;
  }

  try {
    const doc = parseDocument(yamlString);
    const data = doc.toJS() as any;

    if (!data || data.kind !== 'Composition') {
      return defaultIR;
    }

    const name = data.metadata?.name || 'Unknown';
    const compositeApiVersion = data.spec?.compositeTypeRef?.apiVersion || '';
    const compositeKind = data.spec?.compositeTypeRef?.kind || '';
    const mode = data.spec?.mode === 'Pipeline' ? 'Pipeline' : 'Resources';

    const resources: ComposedResourceIR[] = [];

    if (mode === 'Resources' && Array.isArray(data.spec?.resources)) {
      data.spec.resources.forEach((res: any, index: number) => {
        if (!res || !res.name) return;
        const base = res.base || {};
        const patches: PatchIR[] = [];

        if (Array.isArray(res.patches)) {
          res.patches.forEach((patch: any, pIndex: number) => {
            patches.push({
              type: patch.type || 'FromCompositeFieldPath',
              fromFieldPath: patch.fromFieldPath,
              toFieldPath: patch.toFieldPath,
              combine: patch.combine,
              transforms: patch.transforms,
              astPath: ['spec', 'resources', index, 'patches', pIndex],
            });
          });
        }

        resources.push({
          id: res.name,
          kind: base.kind || 'Unknown',
          apiVersion: base.apiVersion || 'Unknown',
          base,
          patches,
          astPath: ['spec', 'resources', index],
        });
      });
    } else if (mode === 'Pipeline' && Array.isArray(data.spec?.pipeline)) {
      data.spec.pipeline.forEach((step: any, stepIndex: number) => {
        const stepResources = step.input?.resources;
        if (Array.isArray(stepResources)) {
          stepResources.forEach((res: any, resIndex: number) => {
            if (!res || !res.name) return;
            const base = res.base || {};
            const patches: PatchIR[] = [];

            if (Array.isArray(res.patches)) {
              res.patches.forEach((patch: any, pIndex: number) => {
                patches.push({
                  type: patch.type || 'FromCompositeFieldPath',
                  fromFieldPath: patch.fromFieldPath,
                  toFieldPath: patch.toFieldPath,
                  combine: patch.combine,
                  transforms: patch.transforms,
                  astPath: ['spec', 'pipeline', stepIndex, 'input', 'resources', resIndex, 'patches', pIndex],
                });
              });
            }

            resources.push({
              id: res.name,
              kind: base.kind || 'Unknown',
              apiVersion: base.apiVersion || 'Unknown',
              base,
              patches,
              astPath: ['spec', 'pipeline', stepIndex, 'input', 'resources', resIndex],
            });
          });
        }
      });
    }

    return {
      name,
      composite: { apiVersion: compositeApiVersion, kind: compositeKind },
      resources,
      mode,
    };
  } catch (err) {
    console.error('Error parsing Composition YAML to IR:', err);
    return defaultIR;
  }
}

/**
 * Updates a specific path in the YAML AST using the document model to preserve comments,
 * and returns the updated YAML string.
 */
export function updateYAMLPath(
  yamlString: string,
  path: (string | number)[],
  value: any
): string {
  if (!yamlString) return '';
  try {
    const doc = parseDocument(yamlString);
    doc.setIn(path, value);
    return doc.toString();
  } catch (err) {
    console.error(`Error updating YAML path [${path.join(', ')}]:`, err);
    return yamlString;
  }
}
