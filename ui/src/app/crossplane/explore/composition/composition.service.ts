
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Composition } from './composition';
import { ApiClient } from 'src/app/core/api.service';
import { ResourcesGraph } from './dependencies/graph';

@Injectable({
  providedIn: 'root',
})
export class CompositionService {

  private base = "/crossplane/compositions"

  constructor(private apiClient: ApiClient) {}

  listCompositions(): Observable<Composition[]> {
    return this.apiClient.getJson<Composition[]>(`${this.base}`);
  }

  get(name: string): Observable<Composition> {
    return this.apiClient.getJson<Composition>(
      `/crossplane/compositions/${name}`
    );
  }

  getDependencies(name: string): Observable<ResourcesGraph> {
    return this.apiClient.getJson<Composition>(
      `/crossplane/compositions/${name}/dependencies`
    );
  }

  delete(name: string): Observable<any> {
    return this.apiClient.delete(`/crossplane/compositions/${name}`)
  }

  create(composition: any): Observable<Composition> {
    return this.apiClient.postJson(`/crossplane/compositions`, composition)
  }

}
