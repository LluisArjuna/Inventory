import { inject } from '@angular/core';
import { ApiService } from './api.service';
import type { Observable } from 'rxjs';
import type { Page } from '@shared/models';

export function createCrud<T, C = Record<string, unknown>, U = Partial<T>>(basePath: string) {
  const api = inject(ApiService);

  return {
    getAll(page = 0, size = 20, filters?: Record<string, string | number | boolean | undefined>): Observable<Page<T>> {
      return api.get<Page<T>>(basePath, { page, size, ...filters });
    },

    getById(id: string): Observable<T> {
      return api.getById<T>(basePath, id);
    },

    create(data: C): Observable<T> {
      return api.create<T>(basePath, data as unknown as Record<string, unknown>);
    },

    update(id: string, data: U): Observable<T> {
      return api.update<T>(basePath, id, data as unknown as Record<string, unknown>);
    },

    delete(id: string): Observable<void> {
      return api.delete(basePath, id);
    },
  };
}
