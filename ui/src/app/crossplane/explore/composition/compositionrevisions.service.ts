import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Composition } from './composition';
import { ApiClient } from 'src/app/core/api.service';
import { CompositionRevision } from './compositionrevision';

@Injectable({
  providedIn: 'root',
})
export class CompositionRevisionService {
  constructor(private apiClient: ApiClient) {}

  getCompositionRevision(name: string): Observable<CompositionRevision[]> {
    return this.apiClient.getJson<Composition[]>(
      `/crossplane/compositionrevisions/${name}`
    );
  }
}
