import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-resource-panel',
  standalone: true,
  imports: [],
  templateUrl: './resource-panel.component.html',
  styleUrl: './resource-panel.component.scss',
})
export class ResourcePanelComponent {
  @Input()
  resouceType: string = 'generic';

  @Input()
  resource: any;

  open: boolean = false;

  onClick() {
    this.open = !this.open;
  }
}
