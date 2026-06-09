import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { catchError, finalize, map } from 'rxjs/operators';
import { Toast, ToasterService } from './toaster/toaster.service';

export const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  Accept: 'application/json; charset=utf-8',
};

const buildHeadersFnc = (...headers: { [name: string]: string }[]) =>
  new HttpHeaders(Object.assign({}, ...headers));

@Injectable()
export class ApiClient {
  isRequesting = false;
  callCount = 0;
  baseUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    private toasterService: ToasterService
  ) {}

  getURL(uri: string): string {
    return `${this.baseUrl}${uri}`;
  }

  getJson<T>(uri: string): Observable<any> {
    let mergedHeaders = buildHeadersFnc(JSON_HEADERS);

    this.onRequestStarted();
    return this.http
      .get(this.getURL(uri), {
        headers: mergedHeaders,
        observe: 'response',
      })
      .pipe(
        map((data) => data.body),
        catchError(this.handleError.bind(this)),
        finalize(() => this.onRequestStopped())
      );
  }

  postJson<T>(uri: string, data: any, observe: any = 'body'): Observable<any> {
    let mergedHeaders = buildHeadersFnc(JSON_HEADERS);

    this.onRequestStarted();
    return this.http
      .post(this.getURL(uri), data, {
        headers: mergedHeaders,
        observe,
      })
      .pipe(
      //  catchError(this.handleError.bind(this)),
        finalize(() => this.onRequestStopped())
      );
  }

  patchJson<T>(uri: string, data: any = ''): Observable<any> {

    let mergedHeaders = buildHeadersFnc(JSON_HEADERS);

    this.onRequestStarted();
    return this.http.patch(this.getURL(uri), data, {
      headers: mergedHeaders,
    }).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.onRequestStopped())
    );
  }

  putJson<T>(uri: string, data: any = ''): Observable<any> {
    this.onRequestStarted();
    return this.http.put(this.getURL(uri), data).pipe(
      catchError(this.handleError.bind(this)),
      finalize(() => this.onRequestStopped())
    );
  }

  delete(uri: string): Observable<any> {

    let mergedHeaders = buildHeadersFnc(JSON_HEADERS);

    this.onRequestStarted();
    return this.http
      .delete(this.getURL(uri), {
        headers: mergedHeaders,
        //withCredentials: true,
      })
      .pipe(
        //catchError(this.handleError.bind(this)),
        finalize(() => this.onRequestStopped())
      );
  }

  // Error handling
  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    this.toasterService.alert(new Toast(error.message, 'error'));
    return throwError(() => {
      return errorMessage;
    });
  }

  private onRequestStarted() {
    this.callCount++;
    this.isRequesting = this.callCount > 0;
  }

  private onRequestStopped() {
    this.callCount--;
    this.isRequesting = this.callCount > 0;
  }
}
