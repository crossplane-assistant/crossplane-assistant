import { JsonPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { SlidingPanelComponent } from 'src/app/core/sliding-panel/sliding-panel.component';
import { ApiErrorViewerComponent } from '../../common/api-error-viewer/api-error-viewer.component';
import { ProviderService } from '../provider.service';

@Component({
  selector: 'app-create-provider',
  standalone: true,
  imports: [MonacoEditorModule, FormsModule, JsonPipe, SlidingPanelComponent, ApiErrorViewerComponent],
  templateUrl: './create-provider.component.html',
  styleUrl: './create-provider.component.scss'
})
export class CreateProviderComponent {
  constructor(private service: ProviderService){}

  @Input()
  visible: boolean = false;

  @Output()
  closePanel: EventEmitter<any> = new EventEmitter();

  editorOptions = {
    theme: 'vs',
    language: 'yaml',
    defaultOptions: { scrollBeyondLastLine: false },
    fontSize: 12.5,
    automaticLayout: true,
    minimap: { enabled: false },
  };

  createErr:any = null;

  save(){

    const observer = {
      next: (x: any) => this.closePanel.emit(true),
      error: (err: any) => {this.createErr = err},
    };

    this.createErr = null
    this.service
      .create(this.yamlManifest)
      .subscribe(observer )
  }

  yamlManifest: any =
`apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-kubernetes
spec:
  package: xpkg.upbound.io/crossplane-contrib/provider-kubernetes:v0.15.0
`
}
