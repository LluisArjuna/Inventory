import { Injectable } from '@angular/core';
import { createCrud } from '@core/services/base-crud.service';
import { API_ROUTES } from '@core/constants/api-routes';
import type { Category } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly crud = createCrud<Category>(API_ROUTES.CATEGORIES);

  getAll(page = 0, size = 100) {
    return this.crud.getAll(page, size);
  }
}
