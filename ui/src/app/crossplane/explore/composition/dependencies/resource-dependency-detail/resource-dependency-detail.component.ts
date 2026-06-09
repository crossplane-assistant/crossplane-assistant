import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../resource-dependency-viewer/resource-graph-builder';
import { JsonPipe } from '@angular/common';
import { Edge } from '../graph';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';
import { stringify } from 'yaml';
import {NgSelectModule} from "@ng-select/ng-select";

@Component({
  selector: 'app-resource-dependency-detail',
  standalone: true,
    imports: [JsonPipe, MonacoEditorModule, FormsModule, NgSelectModule],
  templateUrl: './resource-dependency-detail.component.html',
  styleUrl: './resource-dependency-detail.component.scss',
})
export class ResourceDependencyDetailComponent implements OnInit {
  _item: Item | undefined;

  @Input()
  compsition: any;

  @Input()
  composition: any;

  srcPatch: any = '';
  dstPatch: any = '';

  link: Edge | undefined;

  @Input()
  set item(item: Item | undefined) {
    this._item = item;
    this.init(item?.links[0] as Edge);
  }

  get item(): Item | undefined {
    return this._item;
  }

  editorOptions = {
    theme: 'vs',
    language: 'yaml',
    defaultOptions: { scrollBeyondLastLine: false },
    fontSize: 12.5,
    automaticLayout: true,
    readOnly: true,
    minimap: { enabled: false },
  };

  ngOnInit(): void {
    if (this.item) {
      this.init(this.item.links[0]);
    }
  }

  onChange(event: any) {
    if (this.item) {
      this.init(this.item.links[event.value as number]);
    }
  }

  init(link: Edge) {
    if (this.composition && link) {
      var src = link.src;
      var dst = link.dst;
      this.link = link;

      this.srcPatch = stringify(
        this.composition.spec.resources[src.resourceRef.index].patches[
          src.patchIdx
        ],
        null,
        2
      );
      this.dstPatch = stringify(
        this.composition.spec.resources[dst.resourceRef.index].patches[
          dst.patchIdx
        ],
        null,
        2
      );
    }
  }
}
