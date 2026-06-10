import { Edge, Item, ResourceDependencies, ResourceRef, ResourcesGraph } from '../types';

export class InOutBuilder {
  graph: ResourcesGraph;

  constructor(graph: ResourcesGraph) {
    this.graph = graph;
  }

  public build(resourceIdx: number): ResourceDependencies {
    return {
      resource: this.graph.resources[resourceIdx],
      in: this.getLinkedItems(resourceIdx, 'in'),
      out: this.getLinkedItems(resourceIdx, 'out'),
    };
  }

  private isLinked(resourceRef: ResourceRef, resourceIdx: number): boolean {
    return resourceRef.index === resourceIdx;
  }

  private getCurrentTarget(
    edge: Edge,
    mode: 'in' | 'out'
  ): { current: ResourceRef; target: ResourceRef } {
    if (mode === 'in') {
      return {
        current: edge.dst.resourceRef,
        target: edge.src.resourceRef,
      };
    }
    return {
      current: edge.src.resourceRef,
      target: edge.dst.resourceRef,
    };
  }

  private getLinkedItems(resourceIdx: number, mode: 'in' | 'out'): Item[] {
    const items: Item[] = [];
    this.graph.edges.forEach((edge) => {
      const currentAndTarget = this.getCurrentTarget(edge, mode);

      if (!this.isLinked(currentAndTarget.current, resourceIdx)) {
        return;
      }

      // Avoid duplicates
      if (!items.some(item => item.index === currentAndTarget.target.index)) {
        items.push({
          index: currentAndTarget.target.index,
          apiVersion: currentAndTarget.target.apiVersion,
          kind: currentAndTarget.target.kind,
          name: currentAndTarget.target.name,
        });
      }
    });
    return items;
  }
}
