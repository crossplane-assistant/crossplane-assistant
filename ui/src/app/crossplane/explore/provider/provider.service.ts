import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from 'src/app/core/api.service';
import {Provider} from "./provider";
import { encodeRef, Ref } from '../common/model/ref';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {

  constructor(private apiClient: ApiClient) {}

  /**
   * List the provider for the clusters
   *
   * @return An `Observable` of `Provider`,
   */
  listProviders(): Observable<Provider[]> {
    return this.apiClient.getJson<Provider[]>(`/crossplane/providers`);
  }

  /**
   * List the provider for the clusters
   *
   * @return An `Observable` of `Provider`,
   */
  getProvider(name: String): Observable<Provider[]> {
    return this.apiClient.getJson<Provider[]>(`/crossplane/providers/${name}`);
  }

  delete(name: string): Observable<any> {
    return this.apiClient.delete(`/crossplane/providers/${name}`)
  }

  create(claim: any): Observable<Function> {

    return this.apiClient.postJson(`/crossplane/providers`, claim)
  }
}
