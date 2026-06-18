import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import type { Observable } from 'rxjs';

type Params = Record<string, string | number | boolean | undefined>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  get<T>(path: string, params?: Params): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, {
      params: this.toParams(params)
    });
  }

  getById<T>(path: string, id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}/${id}`);
  }

  create<T>(path: string, body: Record<string, unknown>): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  update<T>(path: string, id: string, body: Record<string, unknown>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}/${id}`, body);
  }

  put<T>(path: string, body: Record<string, unknown>): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  delete(path: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${path}/${id}`);
  }

  upload<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, formData);
  }

  private toParams(params?: Params): HttpParams | undefined {
    if (!params) return undefined;
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }
}
