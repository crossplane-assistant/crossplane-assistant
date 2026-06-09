import { Component, Input } from '@angular/core';
import { parse } from 'yamljs';
import { CompositionService } from '../composition.service';
import { ResourcesGraph } from '../dependencies/graph';
@Component({
  selector: 'app-composition-viewer',
  templateUrl: './composition-viewer.component.html',
  styleUrls: ['./composition-viewer.component.scss'],
})
export class CompositionViewerComponent {
  protected _manifest: any;
  protected graph: ResourcesGraph | undefined;

  @Input()
  protected composition: any;

  protected initialized: boolean = false;

  @Input()
  set manifest(manifest: any) {
    this._manifest = manifest;
    this.init();
  }

  get manifest(): any {
    return this._manifest;
  }

  constructor(private compositionService: CompositionService) {}

  public init() {
    this.initialized = false;
    if (this._manifest) {
      this.compositionService
        .getDependencies(this._manifest.metadata.name)
        .subscribe((graph) => {
          this.graph = graph;
          this.initialized = true;
        });
    }
  }
}
