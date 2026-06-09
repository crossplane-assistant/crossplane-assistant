import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Claim } from './claim';
import { Ref, encodeRef } from '../common/model/ref';
import { ApiClient } from 'src/app/core/api.service';
import { Tree } from './graph/graph';

@Injectable({
  providedIn: 'root',
})
export class ClaimService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Provide the tree of given claim resource
   *
   * @return An `Observable` of `Tree`,
   */
  resourceTree(ref: Ref): Observable<Tree> {
    // Encode the object reference
    var serializedRef = encodeRef(ref);

    return this.apiClient.getJson<Tree>(
      `/crossplane/claims/${serializedRef}/tree`
    );
  }

  /**
   * List the claim for the custers
   *
   * @return An `Observable` of `Claim`,
   */
  listClaims(): Observable<Claim[]> {
    return this.apiClient.getJson<Claim[]>(`/crossplane/claims`);
  }

  /**
   * List the claim for the custers
   *
   * @return An `Observable` of `Claim`,
   */
  getClaim(ref: Ref): Observable<Claim[]> {

    const strRef = encodeRef(ref);
    return this.apiClient.getJson<Claim[]>(`/crossplane/claims/${strRef}`);
  }


  delete(ref: Ref): Observable<any> {

    const strRef = encodeRef(ref);
    return this.apiClient.delete(`/crossplane/claims/${strRef}`)
  }

  create(claim: any): Observable<Claim> {

    return this.apiClient.postJson(`/crossplane/claims`, claim)
  }
}
