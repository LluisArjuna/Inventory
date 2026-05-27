import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import type { Category, Page } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly api = inject(ApiService);

  getAll(page = 0, size = 100): Observable<Page<Category>> {
    return this.api.get<Page<Category>>('/categories', { page, size });
  }
}
