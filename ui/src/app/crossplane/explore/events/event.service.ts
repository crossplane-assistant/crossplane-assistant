import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClient } from 'src/app/core/api.service';
import { Event } from './event';
import { Ref, encodeRef } from '../common/model/ref';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(private apiClient: ApiClient) {}

  listRefEvents(ref: Ref): Observable<Event[]> {
    const encodedRef = encodeRef(ref);

    return this.apiClient
      .getJson<Event[]>(`/events/${encodedRef}`)
      .pipe(map((eventList) => eventList.items));
  }
}
