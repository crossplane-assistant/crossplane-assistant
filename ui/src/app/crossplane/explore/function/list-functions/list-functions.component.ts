import {Component, OnInit} from '@angular/core';
import {ResourceDetailPanelComponent} from "../../common/base-list/resource-detail-panel.component";
import {EventService} from "../../events/event.service";
import {FunctionExtended} from "../function";
import {FunctionService} from "../function.service";


@Component({
  selector: 'app-list-functions',
  templateUrl: './list-functions.component.html',
  styleUrl: './list-functions.component.scss'
})
export class ListFunctionsComponent
  extends ResourceDetailPanelComponent
  implements OnInit {

  public isNewVisible: boolean = false
  public functions: FunctionExtended[] = [];

  constructor(
      private functionService: FunctionService,
      eventService: EventService
  ) {
    super(eventService);
  }

  ngOnInit() {
    this.load()
  }

  delete(name: string){
    this.functionService.delete(name).subscribe(()=>{
      this.isDetailVisible = false
      this.load()
    })
  }

  onCreateChange(event: any){
    this.isNewVisible = false
    this.load()
  }

  load(){
    this.functionService.listFunctions().subscribe((c) => {
      this.functions = c.map((func, index, values) => {
        let conditions = (func as any).status?.conditions
            ? ((func as any).status?.conditions as any[])
            : [];
        return {
          manifest: func,
          healthy: conditions.find((condition) => condition.type === 'Healthy')
              ?.status,
          installed: conditions.find((condition) => condition.type === 'Installed')
              ?.status,
        } as FunctionExtended;
      });
    });
  }

}
