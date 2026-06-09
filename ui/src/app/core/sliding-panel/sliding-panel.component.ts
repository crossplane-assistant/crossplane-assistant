import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-sliding-panel',
  standalone: true,
  templateUrl: './sliding-panel.component.html',
  styleUrls: ['./sliding-panel.component.scss'],
})
export class SlidingPanelComponent {

  @Input()
  set visible(visible : boolean){
    this._visible = visible
  }

  get visible(): boolean{
    return this._visible
  }

  _visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  constructor() {}

  showDrawer(event: any) {
    event.stopPropagation();
  }

  closeDrawer() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {

    if (this.visible) {
      this.closeDrawer();
    }
  }
}
