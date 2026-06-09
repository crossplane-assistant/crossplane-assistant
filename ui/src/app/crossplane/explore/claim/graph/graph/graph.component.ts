import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Node } from '../graph';
import { NodeComponent } from '../node/node.component';

@Component({
  selector: 'graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  standalone: true,
  imports: [NodeComponent],
})
export class GraphComponent {
  @Input()
  root: Node | undefined;

  @Output()
  select: EventEmitter<Node> = new EventEmitter();

  onSelect(node: Node) {
    this.select.emit(node);
  }
}
