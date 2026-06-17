import { describe, test, expect } from 'vitest';

interface ActiveAttribute {
  nodeId: string;
  field: string;
  isLocked: boolean;
}

interface MockEdge {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
}

// Emulate the dynamic highlighted calculations in CompositionCanvas
function calculateHighlights(activeAttribute: ActiveAttribute | null, edges: MockEdge[]) {
  const highlightedEdges = new Set<string>();
  const highlightedFieldsMap: Record<string, Set<string>> = {};

  if (!activeAttribute) {
    return { highlightedEdges, highlightedFieldsMap };
  }

  edges.forEach((edge) => {
    const isSourceMatch = edge.source === activeAttribute.nodeId && edge.sourceHandle === activeAttribute.field;
    const isTargetMatch = edge.target === activeAttribute.nodeId && edge.targetHandle === activeAttribute.field;

    if (isSourceMatch || isTargetMatch) {
      highlightedEdges.add(edge.id);

      if (edge.source && edge.sourceHandle) {
        if (!highlightedFieldsMap[edge.source]) {
          highlightedFieldsMap[edge.source] = new Set();
        }
        highlightedFieldsMap[edge.source].add(edge.sourceHandle);
      }

      if (edge.target && edge.targetHandle) {
        if (!highlightedFieldsMap[edge.target]) {
          highlightedFieldsMap[edge.target] = new Set();
        }
        highlightedFieldsMap[edge.target].add(edge.targetHandle);
      }
    }
  });

  return { highlightedEdges, highlightedFieldsMap };
}

describe('Composition Canvas Attribute Highlighting State Machine', () => {
  const mockEdges: MockEdge[] = [
    {
      id: 'edge-input-db-0',
      source: 'composite-input',
      sourceHandle: 'spec.parameters.dbSize',
      target: 'mr-db',
      targetHandle: 'spec.forProvider.size'
    },
    {
      id: 'edge-input-db-1',
      source: 'composite-input',
      sourceHandle: 'spec.parameters.region',
      target: 'mr-db',
      targetHandle: 'spec.forProvider.region'
    },
    {
      id: 'edge-output-db-0',
      source: 'mr-db',
      sourceHandle: 'status.atProvider.endpoint',
      target: 'composite-output',
      targetHandle: 'status.dbEndpoint'
    }
  ];

  test('should return empty highlights when no active attribute is hovered or clicked', () => {
    const { highlightedEdges, highlightedFieldsMap } = calculateHighlights(null, mockEdges);
    expect(highlightedEdges.size).toBe(0);
    expect(Object.keys(highlightedFieldsMap).length).toBe(0);
  });

  test('should correctly highlight input connections from composite-input on hover/click', () => {
    const active: ActiveAttribute = {
      nodeId: 'composite-input',
      field: 'spec.parameters.dbSize',
      isLocked: false
    };

    const { highlightedEdges, highlightedFieldsMap } = calculateHighlights(active, mockEdges);

    expect(highlightedEdges.has('edge-input-db-0')).toBe(true);
    expect(highlightedEdges.has('edge-input-db-1')).toBe(false);

    expect(highlightedFieldsMap['composite-input'].has('spec.parameters.dbSize')).toBe(true);
    expect(highlightedFieldsMap['mr-db'].has('spec.forProvider.size')).toBe(true);
    expect(highlightedFieldsMap['mr-db'].has('spec.forProvider.region')).toBe(false);
  });

  test('should correctly highlight output connections to composite-output when locked', () => {
    const active: ActiveAttribute = {
      nodeId: 'mr-db',
      field: 'status.atProvider.endpoint',
      isLocked: true
    };

    const { highlightedEdges, highlightedFieldsMap } = calculateHighlights(active, mockEdges);

    expect(highlightedEdges.has('edge-output-db-0')).toBe(true);
    expect(highlightedEdges.has('edge-input-db-0')).toBe(false);

    expect(highlightedFieldsMap['mr-db'].has('status.atProvider.endpoint')).toBe(true);
    expect(highlightedFieldsMap['composite-output'].has('status.dbEndpoint')).toBe(true);
  });
});
