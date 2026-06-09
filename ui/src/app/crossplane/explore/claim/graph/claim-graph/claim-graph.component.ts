import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { ClaimService } from '../../claim.service';
import { CompositionRevisionService } from '../../../composition/compositionrevisions.service';
import { EventService } from '../../../events/event.service';
import { ResourceDetailPanelComponent } from '../../../common/base-list/resource-detail-panel.component';
import { Node } from '../graph';
import { Ref } from '../../../common/model/ref';
import { parse } from 'yamljs';

@Component({
  selector: 'app-claim-graph',
  templateUrl: './claim-graph.component.html',
  styleUrl: './claim-graph.component.scss',
})
export class ClaimGraphComponent
  extends ResourceDetailPanelComponent
  implements OnInit, OnDestroy
{
  intervalId: any | undefined;
  loading: boolean = true;
  reloadInSeconds: number = 15;
  lastRefresh: Date = new Date();

  compositionRevisionRef: string = '';
  compositionRevision: any;

  @Input()
  ref: Ref | undefined;

  root: Node | undefined;

  @Output()
  select: EventEmitter<NodeSelection> = new EventEmitter();

  constructor(
    private route: ActivatedRoute,
    private claimService: ClaimService,
    private compositionRevisionService: CompositionRevisionService,
    eventService: EventService
  ) {
    super(eventService);
  }

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    this.intervalId && clearInterval(this.intervalId);
  }

  load() {
    if (!this.ref) {
      return;
    }

    this.claimService.resourceTree(this.ref).subscribe((tree) => {
      this.root = tree.root as Node;
      this.loading = false;
      this.lastRefresh = new Date();

      this.compositionRevisionRef =
        tree.root.manifest.spec.compositionRevisionRef.name;

      this.compositionRevisionService
        .getCompositionRevision(this.compositionRevisionRef)
        .subscribe((cr) => (this.compositionRevision = cr));

      // Configure the refresh interval
      if (!this.intervalId) {
        this.intervalId = setInterval(
          this.load.bind(this),
          this.reloadInSeconds * 1000
        );
      }
    });
  }

  getResourceTemplate(index: number): any {
    return this.compositionRevision.spec.resources[index];
  }

  nodeSelected(node: Node) {
    const nodeSelection: NodeSelection = {
      node: node,
      resourceTemplate: undefined,
    };
    if (node.metaKind == 'Resource') {
      nodeSelection.resourceTemplate = this.getResourceTemplate(node.index);
    }
    this.select.emit(nodeSelection);
  }
}

export class NodeSelection {
  node: any = '';
  resourceTemplate: any = undefined;
}
