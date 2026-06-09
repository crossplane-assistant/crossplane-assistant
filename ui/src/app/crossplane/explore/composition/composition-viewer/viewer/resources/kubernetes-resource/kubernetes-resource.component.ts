import { Component, Type } from '@angular/core';
import { stringify } from 'yaml';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';
import { ResourcePanelComponent } from '../resource-panel/resource-panel.component';
import { BaseResourceComponent } from '../base-resource/base-resource';
import { ResourceViewerProvider } from '../editor-resource';
import { ResourceDependencyViewerComponent } from '../../../../dependencies/resource-dependency-viewer/resource-dependency-viewer.component';
import { ResourceContext } from '../dynamic-resource-viewer/dynamic-resource-viewer.component';
import { EditorHandler } from '../base-resource/editor-handler';

@Component({
  selector: 'app-kubernetes-resource',
  standalone: true,
  imports: [
    MonacoEditorModule,
    FormsModule,
    ResourcePanelComponent,
    ResourceDependencyViewerComponent,
  ],
  templateUrl: './kubernetes-resource.component.html',
  styleUrl: './kubernetes-resource.component.scss',
})
export class KubernetesResourceComponent extends BaseResourceComponent {
  manifest: any;

  yamlManifest: any;

  k8sEditorHandler = new EditorHandler();

  constructor() {
    super();
    this.setTab('kubernetes');
  }

  protected override onResourceContextChange(resourceContext: ResourceContext) {
    if (resourceContext.resource?.base?.spec?.forProvider?.manifest) {
      this.manifest = resourceContext.resource.base.spec.forProvider.manifest;

      this.k8sEditorHandler.content = stringify(this.manifest);
      this.editorHandler.content = stringify(resourceContext.resource);
    }
  }
}

export class KubernetesResourceViewerProvider
  implements ResourceViewerProvider
{
  public isSupported(apiVersion: string, kind: string): boolean {
    return (
      apiVersion.startsWith('kubernetes.crossplane.io') && kind == 'Object'
    );
  }

  public provide(): Type<any> {
    return KubernetesResourceComponent;
  }
}
