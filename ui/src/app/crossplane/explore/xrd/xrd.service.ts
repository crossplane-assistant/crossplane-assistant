import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { XRD } from './xrd';
import {ApiClient} from "../../../core/api.service";

@Injectable({
  providedIn: 'root',
})
export class XRDService {

  private base = "/crossplane/xrds"

  constructor(private apiClient: ApiClient) {}

  list(): Observable<XRD[]> {
    return this.apiClient.getJson<XRD[]>(`${this.base}`);
  }

  get(name: string): Observable<XRD> {
    return this.apiClient.getJson<XRD>(
        `${this.base}/${name}`
    );
  }

  delete(name: string): Observable<any> {
    return this.apiClient.delete(`${this.base}/${name}`)
  }

  create(xrd: any): Observable<XRD> {
    return this.apiClient.postJson(`${this.base}`, xrd)
  }
}
