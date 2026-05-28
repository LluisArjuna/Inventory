import { Injectable } from '@angular/core';
import { createCrud } from '@core/services/base-crud.service';
import type { Category } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly crud = createCrud<Category>('/categories');

  getAll(page = 0, size = 100) {
    return this.crud.getAll(page, size);
  }
}
