import {Component, OnDestroy, OnInit} from '@angular/core';
import {DurationPipe} from "../../../../core/pipe/duration";
import {EventsListComponent} from "../../common/events-list/events-list.component";
import {MonacoEditorModule} from "ngx-monaco-editor-v2";
import {JsonPipe, NgForOf} from "@angular/common";
import {SlidingPanelComponent} from "../../../../core/sliding-panel/sliding-panel.component";
import {ResourceDetailPanelComponent} from "../../common/base-list/resource-detail-panel.component";
import {EventService} from "../../events/event.service";
import {FormsModule} from "@angular/forms";
import {ManagedResourceExtended, ManagedResourceKind} from "../managed-resource";
import {ManagedResourceService} from "../managedresources.service";
import {FunctionExtended} from "../../function/function";
import {CreateFunctionComponent} from "../../function/create-function/create-function.component";
import {CreateManageResourceComponent} from "../create-manage-resource/create-manage-resource.component";
import {
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    NgSelectComponent,
    NgSelectModule
} from "@ng-select/ng-select";
import {Reloader} from "../../common/base-list/reloader";

@Component({
  selector: 'app-list-managed-resources',
  standalone: true,
    imports: [
        DurationPipe,
        EventsListComponent,
        MonacoEditorModule,
        NgForOf,
        SlidingPanelComponent,
        FormsModule,
        JsonPipe,
        CreateFunctionComponent,
        CreateManageResourceComponent,
        NgSelectModule
    ],
  templateUrl: './list-managed-resources.component.html',
  styleUrl: './list-managed-resources.component.scss'
})
export class ListManagedResourcesComponent
    extends ResourceDetailPanelComponent
    implements OnInit, OnDestroy {


    private reloader  = new Reloader(this.loadMR.bind(this));
    public isNewVisible: boolean = false
    public managedResourceKind: ManagedResourceKind | undefined;

    public mrKinds: ManagedResourceKind[] = [];
    public managedResources: ManagedResourceExtended[] = [];

    constructor(
        private managedResourceService: ManagedResourceService,
        eventService: EventService
    ) {
        super(eventService);
    }

    ngOnInit() {
        this.load()
        this.reloader.start();
    }

    delete(name: string){

        if(!this.managedResourceKind){
            return
        }
        this.managedResourceService.delete(
                this.managedResourceKind.group,
                this.managedResourceKind.version,
                this.managedResourceKind.kind, name)
            .subscribe(()=>{
            this.isDetailVisible = false
            this.loadMR()
        })
    }

    onCreateChange(event: any){
        this.isNewVisible = false
        this.loadMR()
    }

    load(){
        this.managedResourceService.listKinds().subscribe((mrk) => {
            this.mrKinds = mrk
            if(mrk && mrk.length > 0) {
                this.managedResourceKind = mrk[0]
            }
        });
    }

    ngOnDestroy() {
        this.reloader.stop()
    }

    onMrKindChange(mrk: ManagedResourceKind){

        this.managedResourceKind = mrk
        this.loadMR()
    }

    loadMR(){

        if(!this.managedResourceKind){
            return
        }
        this.managedResourceService.list(this.managedResourceKind.group, this.managedResourceKind.version, this.managedResourceKind.kind).subscribe((c) => {
            this.managedResources = c.map((mr, index, values) => {
                let conditions = (mr as any).status?.conditions
                    ? ((mr as any).status?.conditions as any[])
                    : [];
                return {
                    manifest: mr,
                    synced: conditions.find((condition) => condition.type === 'Synced')
                        ?.status,
                    ready: conditions.find((condition) => condition.type === 'Ready')
                        ?.status,
                } as ManagedResourceExtended;
            });
        });
    }
}
