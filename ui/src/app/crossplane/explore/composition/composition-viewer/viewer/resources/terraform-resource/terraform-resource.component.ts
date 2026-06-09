import { Component, Type } from '@angular/core';
import { stringify } from 'yaml';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';
import { ResourcePanelComponent } from '../resource-panel/resource-panel.component';
import { ResourceViewerProvider } from '../editor-resource';
import { ResourceContext } from '../dynamic-resource-viewer/dynamic-resource-viewer.component';
import { BaseResourceComponent } from '../base-resource/base-resource';
import { ResourceDependencyViewerComponent } from '../../../../dependencies/resource-dependency-viewer/resource-dependency-viewer.component';

@Component({
  selector: 'app-terraform-resource',
  standalone: true,
  imports: [
    MonacoEditorModule,
    FormsModule,
    ResourcePanelComponent,
    ResourceDependencyViewerComponent,
  ],
  templateUrl: './terraform-resource.component.html',
  styleUrl: './terraform-resource.component.scss',
})
export class TerraformResourceComponent extends BaseResourceComponent {
  forProvider: any;

  constructor() {
    super();
    this.setTab('detail');
  }

  protected override onResourceContextChange(resourceContext: ResourceContext) {
    if (resourceContext.resource.base?.spec?.forProvider) {
      this.forProvider = stringify(
        resourceContext.resource.base.spec.forProvider
      );
      this.editorHandler.content = stringify(resourceContext.resource);
    }
  }
}

export class TerraformResourceViewerProvider implements ResourceViewerProvider {
  public isSupported(apiVersion: string, kind: string): boolean {
    return apiVersion.startsWith('tf.upbound.io') && kind == 'Workspace';
  }

  public provide(): Type<any> {
    return TerraformResourceComponent;
  }
}
