import {Component, OnDestroy, OnInit} from '@angular/core';
import { ClaimService } from '../claim.service';
import { Claim, ClaimExtended } from '../claim';
import { ResourceDetailPanelComponent } from '../../common/base-list/resource-detail-panel.component';
import { EventService } from '../../events/event.service';
import {Reloader} from "../../common/base-list/reloader";

@Component({
  selector: 'app-list-claims',
  templateUrl: './list-claims.component.html',
  styleUrls: ['./list-claims.component.scss'],
})
export class ListClaimsComponent
  extends ResourceDetailPanelComponent
  implements OnInit, OnDestroy
{
  public isNewVisible: boolean = false
  private reloader = new Reloader(this.load.bind(this));
  public claims: ClaimExtended[] = [];

  constructor(
    private claimService: ClaimService,
    eventService: EventService
  ) {
    super(eventService);
  }

  ngOnInit() {
    this.reloader.start();
  }

  ngOnDestroy() {
    this.reloader.stop();
  }

  delete( apiVersion :string, kind :string, namespace: string, name: string){
    this.claimService.delete({
      apiVersion:apiVersion,
      kind: kind,
      name: name,
      namespace: namespace
    }).subscribe(()=>{
      this.isDetailVisible = false
      this.load()
    })
  }

  onCreateChange(event: any){
    this.isNewVisible = false
    this.load()
  }

  load(){
    this.claimService.listClaims().subscribe((c) => {
      this.claims = c.map((claim, index, values) => {
        let conditions = (claim as any).status?.conditions
          ? ((claim as any).status?.conditions as any[])
          : [];
        return {
          manifest: claim,
          synced: conditions.find((condition) => condition.type === 'Synced')
            ?.status,
          ready: conditions.find((condition) => condition.type === 'Ready')
            ?.status,
        } as ClaimExtended;
      });
    });
  }
}
