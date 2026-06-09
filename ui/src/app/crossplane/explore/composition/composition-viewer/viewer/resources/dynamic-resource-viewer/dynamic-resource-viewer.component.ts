import {
  Component,
  Input,
  Type,
  ViewContainerRef,
  inject,
  AfterViewInit,
} from '@angular/core';
import { KubernetesResourceViewerProvider } from '../kubernetes-resource/kubernetes-resource.component';
import { GenericResourceComponent } from '../generic-resource/generic-resource.component';
import { TerraformResourceViewerProvider } from '../terraform-resource/terraform-resource.component';
import { ResourceViewerProvider } from '../editor-resource';
import { ResourcesGraph } from '../../../../dependencies/graph';

@Component({
  selector: 'app-dynamic-resource-viewer',
  standalone: true,
  imports: [],
  templateUrl: './dynamic-resource-viewer.component.html',
  styleUrl: './dynamic-resource-viewer.component.scss',
})
export class DynamicResourceViewerComponent implements AfterViewInit {
  resourcesViewer: ResourceViewerProvider[] = [
    new KubernetesResourceViewerProvider(),
    new TerraformResourceViewerProvider(),
  ];

  @Input()
  resourceContext: ResourceContext = new ResourceContext();

  vcr = inject(ViewContainerRef);

  ngAfterViewInit() {
    let resource = this.resourceContext.resource;
    let apiVersion = resource.base.apiVersion;
    let kind = resource.base.kind;
    let viewerType: Type<any> = GenericResourceComponent;

    for (let i = 0; i < this.resourcesViewer.length; i++) {
      let provider = this.resourcesViewer[i];
      if (provider.isSupported(apiVersion, kind)) {
        viewerType = provider.provide();
      }
    }

    const compRef = this.vcr.createComponent(viewerType);
    compRef.instance.resourceContext = this.resourceContext;
    compRef.changeDetectorRef.detectChanges();
  }
}

export class ResourceContext {
  public resource: any;
  public resourceIndex: number = 0;
  public composition: any;
  public graph: ResourcesGraph | undefined;
}
