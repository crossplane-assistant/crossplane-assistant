import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from 'src/app/core/api.service';
import { encodeRef, Ref } from '../common/model/ref';

@Injectable({
  providedIn: 'root',
})
export class FunctionService {

  constructor(private apiClient: ApiClient) {}

  /**
   * List the function for the clusters
   *
   * @return An `Observable` of `Function`,
   */
  listFunctions(): Observable<Function[]> {
    return this.apiClient.getJson<Function[]>(`/crossplane/functions`);
  }

  /**
   * List the function for the clusters
   *
   * @return An `Observable` of `Function`,
   */
  getFunction(name: String): Observable<Function[]> {
    return this.apiClient.getJson<Function[]>(`/crossplane/functions/${name}`);
  }

  delete(name: string): Observable<any> {
    return this.apiClient.delete(`/crossplane/functions/${name}`)
  }

  create(fnc: any): Observable<Function> {

    return this.apiClient.postJson(`/crossplane/functions`, fnc)
  }
}
