import {Component, OnDestroy, OnInit} from '@angular/core';
import { XRD, XRDExtended } from '../xrd';
import { XRDService } from '../xrd.service';
import { ResourceDetailPanelComponent } from '../../common/base-list/resource-detail-panel.component';
import { EventService } from '../../events/event.service';
import {Reloader} from "../../common/base-list/reloader";

@Component({
  selector: 'app-list-xrd',
  templateUrl: './list-xrd.component.html',
  styleUrls: ['./list-xrd.component.scss'],
})
export class ListXrdComponent extends ResourceDetailPanelComponent implements OnInit, OnDestroy {

  public isNewVisible: boolean = false
  private reloader = new Reloader(this.load.bind(this));
  public xrds: XRDExtended[] = [];

  constructor(
    private xrdService: XRDService,
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

  delete(name: string){
    this.xrdService.delete(name).subscribe(()=>{
      this.isDetailVisible = false
      this.load()
    })
  }

  onCreateChange(event: any){
    this.isNewVisible = false
    this.load()
  }

  load(){
    this.xrdService.list().subscribe((c) => {
      this.xrds = c.map((xrd, index, values) => {
        let conditions = (xrd as any).status?.conditions
          ? ((xrd as any).status?.conditions as any[])
          : [];

        console.log(
          typeof conditions.find(
            (condition) => condition.type === 'Established'
          )?.status
        );
        return {
          manifest: xrd,
          established: conditions.find(
            (condition) => condition.type === 'Established'
          )?.status,
          offered: conditions.find((condition) => condition.type === 'Offered')
            ?.status,
          age: (xrd as any).metadata.creationTimestamp,
        } as XRDExtended;
      });
    });
  }
}
