import { Edge, ResourceRef, ResourcesGraph } from '../graph';

export class InOutBuilder {
  graph: ResourcesGraph;

  constructor(graph: ResourcesGraph) {
    this.graph = graph;
  }

  public build(resourceIdx: number): ResourceDependencies {
    console.log('build', resourceIdx);
    return {
      resource: this.graph.resources[resourceIdx],
      in: this.getLinkedItems(resourceIdx, 'in'),
      out: this.getLinkedItems(resourceIdx, 'out'),
    };
  }

  private isLinked(resourceRef: ResourceRef, resourceIdx: number): boolean {
    return resourceRef.index == resourceIdx;
  }

  private getCurrentTarget(
    edge: Edge,
    mode: 'in' | 'out'
  ): { current: ResourceRef; target: ResourceRef } {
    if (mode == 'in') {
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
    const itemMap = new Map<number, Item>();

    this.graph.edges.forEach((edge) => {
      const currentAndTarget = this.getCurrentTarget(edge, mode);

      if (!this.isLinked(currentAndTarget.current, resourceIdx)) {
        return;
      }

      let item = itemMap.get(resourceIdx);
      if (!item) {
        item = this.initItem(currentAndTarget.target);
        itemMap.set(currentAndTarget.target.index, item);
      }

      item?.links.push(edge);
    });

    return Array.from(itemMap.values());
  }

  private getResourceName(index: number) {
    const resource = this.graph.resources[index];
    if (resource.name) {
      return resource.name;
    }
    return `resource[${index}]`;
  }

  private initItem(ref: ResourceRef): Item {
    let item: Item = {
      name: this.getResourceName(ref.index),
      links: [],
      apiVersion: this.graph.resources[ref.index].base.apiVersion,
      kind: this.graph.resources[ref.index].base.kind,
    };
    return item;
  }
}

export interface Item {
  name: string;
  kind: string;
  apiVersion: string;
  links: Edge[];
}

export class ResourceDependencies {
  resource: any;
  in: Item[] = [];
  out: Item[] = [];
}
