import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ManagedResourceExtended} from "../managed-resource";
import {ManagedResourceService} from "../managedresources.service";
import {MonacoEditorModule} from "ngx-monaco-editor-v2";
import {FormsModule} from "@angular/forms";
import {JsonPipe} from "@angular/common";
import {SlidingPanelComponent} from "../../../../core/sliding-panel/sliding-panel.component";
import {ApiErrorViewerComponent} from "../../common/api-error-viewer/api-error-viewer.component";

@Component({
  selector: 'app-create-manage-resource',
  standalone: true,
  imports: [MonacoEditorModule, FormsModule, JsonPipe, SlidingPanelComponent, ApiErrorViewerComponent],
  templateUrl: './create-manage-resource.component.html',
  styleUrl: './create-manage-resource.component.scss'
})
export class CreateManageResourceComponent {

  constructor(private service: ManagedResourceService){}

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
      `apiVersion: 
kind: 
metadata:
  name: sample
spec:
`
}
