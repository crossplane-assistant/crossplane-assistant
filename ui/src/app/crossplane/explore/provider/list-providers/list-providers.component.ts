import {Component, OnDestroy, OnInit} from '@angular/core';
import { EventService } from "../../events/event.service";
import { ProviderService } from "../provider.service";
import { ResourceDetailPanelComponent } from "../../common/base-list/resource-detail-panel.component";
import { ProviderExtended } from "../provider";
import {Reloader} from "../../common/base-list/reloader";


@Component({
    selector: 'app-list-providers',
    templateUrl: './list-providers.component.html',
    styleUrl: './list-providers.component.scss'
})
export class ListProvidersComponent
    extends ResourceDetailPanelComponent
    implements OnInit, OnDestroy {

    private reloader = new Reloader(this.load.bind(this));
    public isNewVisible: boolean = false
    public providers: ProviderExtended[] = [];

    constructor(
        private providerService: ProviderService,
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

    delete(name: string) {
        this.providerService.delete(name).subscribe(() => {
            this.isDetailVisible = false
            this.load()
        })
    }

    onCreateChange(event: any) {
        this.isNewVisible = false
        this.load()
    }

    load() {
        this.providerService.listProviders().subscribe((c) => {
            this.providers = c.map((provider, index, values) => {
                let conditions = (provider as any).status?.conditions
                    ? ((provider as any).status?.conditions as any[])
                    : [];
                return {
                    manifest: provider,
                    healthy: conditions.find((condition) => condition.type === 'Healthy')
                        ?.status,
                    installed: conditions.find((condition) => condition.type === 'Installed')
                        ?.status,
                } as ProviderExtended;
            });
        });
    }


}
