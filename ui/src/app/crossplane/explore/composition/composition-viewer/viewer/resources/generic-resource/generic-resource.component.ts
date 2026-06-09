import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { stringify } from 'yaml';
import { ResourcePanelComponent } from '../resource-panel/resource-panel.component';
import { BaseResourceComponent } from '../base-resource/base-resource';
import { ResourceContext } from '../dynamic-resource-viewer/dynamic-resource-viewer.component';
import { ResourceDependencyViewerComponent } from '../../../../dependencies/resource-dependency-viewer/resource-dependency-viewer.component';
@Component({
  selector: 'app-generic-resource',
  standalone: true,
  imports: [
    MonacoEditorModule,
    FormsModule,
    ResourcePanelComponent,
    ResourceDependencyViewerComponent,
  ],
  templateUrl: './generic-resource.component.html',
  styleUrl: './generic-resource.component.scss',
})
export class GenericResourceComponent extends BaseResourceComponent {
  resource: any;

  constructor() {
    super();
    this.setTab('yaml');
  }

  protected override onResourceContextChange(resourceContext: ResourceContext) {
    if (resourceContext.resource) {
      this.resource = stringify(resourceContext.resource);
      this.editorHandler.content = this.resource;
    }
  }
}
