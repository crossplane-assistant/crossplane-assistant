import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimService } from '../claim.service';
import { decodeRef, Ref } from '../../common/model/ref';
import { stringify } from 'yaml';
import { FieldsFilter } from '../../../../core/utils/fields-filter';
import { NodeSelection } from '../graph/claim-graph/claim-graph.component';
import { ResourceDetailPanelComponent } from '../../common/base-list/resource-detail-panel.component';
import { EventService } from '../../events/event.service';

@Component({
  selector: 'app-claim-view',
  templateUrl: './claim-view.component.html',
  styleUrl: './claim-view.component.scss',
})
export class ClaimViewComponent
  extends ResourceDetailPanelComponent
  implements OnInit
{
  claimName: string = '';

  claim: any;
  ref: Ref | undefined;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private claimService: ClaimService,
    eventService: EventService
  ) {
    super(eventService);
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const paramRef = params['ref'] as string;
      this.ref = decodeRef(paramRef);
      this.claimName = this.ref.name;
      this.load();
    });
  }

  load() {
    if (!this.ref) {
      return;
    }

    this.loading = true;

    this.claimService.getClaim(this.ref).subscribe((claim) => {
      this.claim = claim;
      this.loading = false;
    });
  }

  resourcesTemplate: string = '';

  onSelectNode(selection: NodeSelection) {
    if (selection.node) {
      this.manifest = selection.node.manifest;
      this.setPanelTitle(selection.node.name);

      // Load the template from the CompositeRevision for the selected resource
      if (selection.resourceTemplate) {
        this.resourcesTemplate = stringify(selection.resourceTemplate, null, 2);
      }

      if (this.manifest) {
        this.manifest = new FieldsFilter().filterByName(
          this.manifest,
          'managedFields'
        );
        this.yamlManifest = stringify(this.manifest, null, 2);

        this.selectedRef = {
          apiVersion: this.manifest['apiVersion'],
          kind: this.manifest['apiVersion'],
          name: this.manifest['metadata']['name'],
          namespace: this.manifest['metadata']['namespace'],
        };
      }
      super.showPanel();
    }
  }
}
