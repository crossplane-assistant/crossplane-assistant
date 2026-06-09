import {Component, OnDestroy, OnInit} from '@angular/core';
import { Composition, CompositionExtended } from '../composition';
import { CompositionService } from '../composition.service';
import { ResourceDetailPanelComponent } from '../../common/base-list/resource-detail-panel.component';
import { EventService } from '../../events/event.service';
import {Reloader} from "../../common/base-list/reloader";

@Component({
  selector: 'app-list-compositions',
  templateUrl: './list-compositions.component.html',
  styleUrls: ['./list-compositions.component.scss'],
})
export class ListCompositionsComponent
  extends ResourceDetailPanelComponent
  implements OnInit, OnDestroy
{
  private reloader = new Reloader(this.load.bind(this));
  public compositions: CompositionExtended[] = [];
  isNewVisible: boolean = false

  constructor(
    private compositionService: CompositionService,
    eventService: EventService
  ) {
    super(eventService, 'view');
  }

  ngOnInit() {
    this.load()
    this.reloader.start();
  }

  ngOnDestroy() {
    this.reloader.stop();
  }


  delete(name: string){
    this.compositionService.delete(name).subscribe(()=>{
      this.isDetailVisible = false
      this.load()
    })
  }

  onCreateChange(event: any){
    this.isNewVisible = false
    this.load()
  }


  load(){
    this.compositionService.listCompositions().subscribe((c) => {
      this.compositions = c.map((xrd, index, values) => {
        return {
          manifest: xrd,
          // established: ((xrd as any).status.conditions as any[]).find(condition => condition.type === "Established")?.status,
          // offered: ((xrd as any).status.conditions as any[]).find(condition => condition.type === "Offered")?.status,
          age: (xrd as any).metadata.creationTimestamp,
        } as CompositionExtended;
      });
    });
  }

}
