import {Component, EventEmitter, Input, Output} from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import {FormsModule} from "@angular/forms";
import { XRDService } from '../xrd.service';
import {JsonPipe} from "@angular/common";
import {SlidingPanelComponent} from "../../../../core/sliding-panel/sliding-panel.component";
import {ApiErrorViewerComponent} from "../../common/api-error-viewer/api-error-viewer.component";

@Component({
  selector: 'app-create-xrd',
  standalone: true,
    imports: [MonacoEditorModule, FormsModule, JsonPipe, SlidingPanelComponent, ApiErrorViewerComponent],
  templateUrl: './create-xrd.component.html',
  styleUrl: './create-xrd.component.scss'
})
export class CreateXrdComponent {

  constructor(private xrdService: XRDService){}

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
    this.xrdService
      .create(this.yamlManifest)
      .subscribe(observer )
  }



  yamlManifest: any =
`kind: CompositeResourceDefinition
apiVersion: apiextensions.crossplane.io/v1
metadata:
  name: xsamples.mycompany.io
spec:
  group: mycompany.io
  names:
    singular: xsample
    plural: xsamples
    kind: XSample
    listKind: XSampleList
  claimNames:
    kind: Sample
    plural: samples
    shortNames: []
  versions:
    - name: v1alpha1
      referenceable: true
      served: true
      schema:
        openAPIV3Schema:
          properties:
            spec:
              properties: {}
              type: object
            status:
              properties: {}
              type: object
          type: object
      additionalPrinterColumns:
        - name: name
          type: string
          description: Sample name
          jsonPath: .spec.name
    `

}
