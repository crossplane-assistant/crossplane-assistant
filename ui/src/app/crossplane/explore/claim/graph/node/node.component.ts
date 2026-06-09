import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Condition, Node } from '../graph';
import { NgIf, NgStyle } from '@angular/common';
import { DurationPipe } from '../../../../../core/pipe/duration';

@Component({
  selector: 'graph-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  standalone: true,
  imports: [NgStyle, NgIf, DurationPipe],
})
export class NodeComponent {
  _node: Node | null = null;

  ready: Condition | null = null;
  synced: Condition | null = null;
  deleting: boolean | undefined = undefined;
  manifest: any;

  kindLogo: string = '';
  kindInitials: string = '';
  kindInitialsFontSize: number = 1.3;
  resourceName: string = '';
  nbChildren = 0;

  @Input()
  activeNodeId: string = '';

  @Input()
  isRoot: boolean = false;

  @Input()
  first: boolean = false;

  @Input()
  last: boolean = false;

  @Input()
  uniq: boolean = false;

  @Input()
  set node(node: any) {
    this._node = node as Node;

    if (node.manifest) {
      this.manifest = node.manifest;
    }
    this.ready = this.getReady();
    this.synced = this.getSynced();
    this.deleting = this.getDeleting();

    this.kindLogo = this.getLogo();
    this.kindInitials = this.getInitials();
    if (this.kindInitials.length > 1) {
      this.kindInitialsFontSize = (1.2 / this.kindInitials.length) * 2;
    }
    this.nbChildren = 0;
    if (this._node.children) {
      this.nbChildren = this._node.children.length;
    }
    this.resourceName =
      this.manifest?.metadata?.annotations?.[
        'crossplane.io/composition-resource-name'
      ];
  }

  @Output()
  select: EventEmitter<Node> = new EventEmitter();

  get node(): Node {
    return this._node as Node;
  }

  constructor() {}

  public hasChild(): boolean {
    return (
      (this._node && this._node.children && this._node.children.length > 0) ||
      false
    );
  }

  public isActive(): boolean {
    return (this._node && this._node.uid === this.activeNodeId) || false;
  }

  click() {
    this.select.emit(this._node as Node);
  }

  childClick(childUid: Node) {
    this.select.emit(childUid);
  }

  getReady(): Condition | null {
    return this.getCondition('Ready', this._node);
  }

  getSynced(): Condition | null {
    return this.getCondition('Synced', this._node);
  }

  getDeleting(): boolean {
    return !!this.manifest?.metadata?.deletionTimestamp;
  }

  getAge(): Date {
    return this.manifest?.metadata?.creationTimestamp || null;
  }

  getCondition(type: string, node: Node | null): Condition | null {
    if (!this.manifest?.status?.conditions) {
      return null;
    }
    const conditions = this.manifest.status.conditions as Condition[];

    const condition: Condition | undefined = conditions.find(
      (c) => c.type == type
    );
    if (!condition) {
      return null;
    }
    return condition;
  }

  getInitials(): string {
    if (this.manifest?.kind) {
      return this.manifest.kind.replace(/[^A-Z]+/g, '');
    }
    return '';
  }

  getLogo(): string {
    // TODO: use same logic as in logo-viewer
    if (this.manifest?.apiVersion) {
      if (this.manifest.apiVersion.startsWith('kubernetes.crossplane.io')) {
        return '/assets/logo/kubernetes.png';
      }
      if (this.manifest.apiVersion.indexOf('gcp.upbound.io') >= 0) {
        return '/assets/logo/gcp.png';
      }
      if (this.manifest.apiVersion.indexOf('gcp.crossplane.io') >= 0) {
        return '/assets/logo/gcp.png';
      }
      if (this.manifest.apiVersion.startsWith('azure.crossplane.io')) {
        return '/assets/logo/azure.png';
      }
      if (this.manifest.apiVersion.startsWith('aws.crossplane.io')) {
        return '/assets/logo/aws.png';
      }
      if (this.manifest.apiVersion.startsWith('postgresql.sql.crossplane.io')) {
        return '/assets/logo/postgresql.png';
      }
      if (this.manifest.apiVersion.startsWith('aiven.io')) {
        return '/assets/logo/aiven.png';
      }
      if (this.manifest.apiVersion.startsWith('external-secrets.io')) {
        return '/assets/logo/external-secrets.png';
      }
      if (this.manifest.apiVersion.startsWith('tf.upbound.io')) {
        return '/assets/logo/terraform.png';
      }
      if (this.manifest.apiVersion.startsWith('externaldns.k8s.io')) {
        return '/assets/logo/external-dns.png';
      }
      if (this.manifest.apiVersion.startsWith('atlas.mongodb.com')) {
        return '/assets/logo/mongodb.png';
      }
      if (this.manifest.apiVersion.indexOf('upbound.io') >= 0) {
        return '/assets/logo/generic.png';
      }
    }
    return '';
  }
}
