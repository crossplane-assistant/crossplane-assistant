import { DatePipe, JsonPipe, NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Event } from '../../events/event';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [NgFor, JsonPipe, DatePipe],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss',
})
export class EventsListComponent {
  @Input()
  events: Event[] | undefined;
}
