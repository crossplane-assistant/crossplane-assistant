import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClaimService } from '../claim.service';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { SlidingPanelComponent } from 'src/app/core/sliding-panel/sliding-panel.component';
import {ApiErrorViewerComponent} from "../../common/api-error-viewer/api-error-viewer.component";

@Component({
  selector: 'create-claim',
  standalone: true,
    imports: [MonacoEditorModule, FormsModule, JsonPipe, SlidingPanelComponent, ApiErrorViewerComponent],
  templateUrl: './create-claim.component.html',
  styleUrl: './create-claim.component.scss'
})
export class CreateClaimComponent {


    constructor(private claimService: ClaimService){}

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
      this.claimService
        .create(this.yamlManifest)
        .subscribe(observer )
    }



    yamlManifest: any =
  `kind:
  apiVersion:
  metadata:
    name: xsamples.mycompany.io
  spec:

  `
  }
