import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CompositionService } from '../composition.service';
import { SlidingPanelComponent } from 'src/app/core/sliding-panel/sliding-panel.component';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import {ApiErrorViewerComponent} from "../../common/api-error-viewer/api-error-viewer.component";

@Component({
  selector: 'app-create-composition',
  standalone: true,
  imports: [MonacoEditorModule, FormsModule, JsonPipe, SlidingPanelComponent, ApiErrorViewerComponent],
  templateUrl: './create-composition.component.html',
  styleUrl: './create-composition.component.scss'
})
export class CreateCompositionComponent {

  constructor(private compositionService: CompositionService){}

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
    this.compositionService
      .create(this.yamlManifest)
      .subscribe(observer )
  }

  yamlManifest: any =
`kind: Composition
apiVersion: apiextensions.crossplane.io/v1
metadata:
  name: xsamples.demo.crossplane-assistant.io
spec:
  compositeTypeRef:
    apiVersion: demo.crossplane-assistant.io/v1alpha1
    kind: XSample
  mode: Resources
  resources:
    - name: SamplePod
      base:
        apiVersion: kubernetes.crossplane.io/v1alpha1
        kind: Object
        spec:
          forProvider:
            manifest:
              apiVersion: v1
              kind: Pod
              spec:
                containers:
                  - image: nginx
                    name: sample
          providerConfigRef:
            name: provider-kubernetes
      patches: []
      readinessChecks:
        - type: MatchCondition
          matchCondition:
            type: Ready
            status: "True"
      readinessChecks:
        - type: MatchCondition
          matchCondition:
            type: Ready
            status: "True"
    `;
}

