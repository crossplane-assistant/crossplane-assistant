import { EventService } from '../../events/event.service';
import { Ref } from '../model/ref';
import { Event } from '../../events/event';
import { stringify } from 'yaml';

/**
 * An angular component that display resource detail using a side panel.
 *
 * @class ResourceDetailPanelComponent
 */
export abstract class ResourceDetailPanelComponent {
  editorOptions = {
    theme: 'vs',
    language: 'yaml',
    defaultOptions: { scrollBeyondLastLine: false },
    fontSize: 12.5,
    automaticLayout: true,
    readOnly: true,
  };
  manifest: any = undefined;
  yamlManifest: string = '';
  isDetailVisible = false;
  activeTab = 'manifest';
  selectedRef: Ref | undefined;
  events: Event[] = [];
  public title = '';

  protected constructor(
    private eventService: EventService,
    activeTab: string = 'manifest'
  ) {
    this.activeTab = activeTab;
  }

  showSidePanel(manifest: any) {
    this.title = manifest['metadata']['name'];
    delete manifest.metadata['managedFields'];
    this.manifest = manifest;
    this.yamlManifest = stringify(manifest);
    this.isDetailVisible = true;

    this.selectedRef = {
      apiVersion: manifest['apiVersion'],
      kind: manifest['kind'],
      name: manifest['metadata']['name'],
      namespace: manifest['metadata']['namespace'],
    };
  }

  reset() {
    this.selectedRef = undefined;
    this.manifest = '';
    this.activeTab = 'manifest';
    this.events = [];
  }

  showEvents(ref: Ref) {
    this.eventService.listRefEvents(ref).subscribe((events) => {
      this.events = events;
    });
  }

  setTab(name: string) {
    this.activeTab = name;

    if (this.activeTab == 'event') {
      if (this.selectedRef) {
        this.showEvents(this.selectedRef);
      }
    }
  }

  hidePanel() {
    this.isDetailVisible = false;
  }

  showPanel() {
    this.isDetailVisible = true;
  }

  // Set the title of the panel
  setPanelTitle(title: string) {
    this.title = title;
  }
}
