import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from 'src/app/core/api.service';
import {ManagedResource, ManagedResourceKind} from "./managed-resource";
import {encodeRef} from "../common/model/ref";

@Injectable({
  providedIn: 'root',
})
export class ManagedResourceService {

  resourcePath = '/crossplane/managedresources';

  constructor(private apiClient: ApiClient) {}

  /**
   * List the ManagedResource for the clusters
   *
   * @return An `Observable` of `ManagedResource`,
   */
  listKinds(): Observable<ManagedResourceKind[]> {
    return this.apiClient.getJson<ManagedResourceKind[]>(`${this.resourcePath}/kinds`);
  }

  /**
   * List the ManagedResource for the clusters
   *
   * @return An `Observable` of `ManagedResource`,
   */
  list(group: string, version :string, kind: string): Observable<ManagedResource[]> {
    let ref = encodeURIComponent(`${group}/${version}:${kind}`);
    return this.apiClient.getJson<ManagedResource[]>(`${this.resourcePath}/${ref}`);
  }

  /**
   * List the ManagedResource for the clusters
   *
   * @return An `Observable` of `ManagedResource`,
   */
  get(group: string, version :string, kind: string, name: String): Observable<ManagedResource[]> {
    let ref = encodeURIComponent(`${group}/${version}:${kind}`);
    return this.apiClient.getJson<ManagedResource[]>(`${this.resourcePath}/${ref}/${name}`);
  }

  delete(group: string, version :string, kind: string, name: String): Observable<any> {
    let ref = encodeURIComponent(`${group}/${version}:${kind}`);
    return this.apiClient.delete(`${this.resourcePath}/${ref}/${name}`)
  }

  create(mr: any): Observable<ManagedResource> {
    return this.apiClient.postJson(`${this.resourcePath}`, mr)
  }
}
