import {Component, Input, input} from '@angular/core';
import {JsonPipe} from "@angular/common";
import {PropertyViewerComponent} from "../property-viewer/property-viewer.component";

@Component({
  selector: 'app-schema-viewer',
  standalone: true,
  imports: [
    JsonPipe,
    PropertyViewerComponent
  ],
  templateUrl: './schema-viewer.component.html',
  styleUrl: './schema-viewer.component.scss'
})
export class SchemaViewerComponent {

  @Input()
  schema: any
}
