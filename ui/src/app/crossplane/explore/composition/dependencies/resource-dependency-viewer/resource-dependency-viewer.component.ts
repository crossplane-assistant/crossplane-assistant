import { Component, Input } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  InOutBuilder,
  Item,
  ResourceDependencies,
} from './resource-graph-builder';
import { LogoViewerComponent } from '../../../../../core/logo-viewer/logo-viewer.component';
import { ResourceDependencyDetailComponent } from '../resource-dependency-detail/resource-dependency-detail.component';
import { ResourceContext } from '../../composition-viewer/viewer/resources/dynamic-resource-viewer/dynamic-resource-viewer.component';

@Component({
  selector: 'app-resource-dependency-viewer',
  standalone: true,
  imports: [JsonPipe, LogoViewerComponent, ResourceDependencyDetailComponent],
  templateUrl: './resource-dependency-viewer.component.html',
  styleUrl: './resource-dependency-viewer.component.scss',
})
export class ResourceDependencyViewerComponent {
  showDetails: boolean = false;
  selectedItem: Item | undefined;
  resourceDeps: ResourceDependencies | undefined;

  _resourceContext: ResourceContext | undefined;

  @Input()
  set resourceContext(resourceContext: ResourceContext | undefined) {
    this._resourceContext = resourceContext;
    this.init();
  }

  get resourceContext(): ResourceContext | undefined {
    return this._resourceContext;
  }

  init() {
    if (!this._resourceContext?.graph) {
      return;
    }

    const builder = new InOutBuilder(this._resourceContext.graph);
    this.resourceDeps = builder.build(this._resourceContext.resourceIndex);
  }

  selectResource(resource: Item) {
    this.showDetails = true;
    this.selectedItem = resource;
  }
}
