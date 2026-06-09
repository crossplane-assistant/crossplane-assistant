import { Component, Input } from '@angular/core';
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'api-error-viewer',
  standalone: true,
  imports: [
    JsonPipe
  ],
  templateUrl: './api-error-viewer.component.html',
  styleUrl: './api-error-viewer.component.scss'
})
export class ApiErrorViewerComponent {

  @Input()
  public err: any
}
