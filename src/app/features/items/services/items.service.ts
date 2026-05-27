import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { createCrud } from '@core/services/base-crud.service';
import type { Item, Page } from '@shared/models';

type CreateItem = Omit<Item, 'id'>;
type UpdateItem = Partial<Item>;

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private readonly crud = createCrud<Item, CreateItem, UpdateItem>('/items');

  getAll(page = 0, size = 20, filters?: Record<string, string | number | boolean | undefined>): Observable<Page<Item>> {
    return this.crud.getAll(page, size, filters);
  }

  getById(id: string): Observable<Item> {
    return this.crud.getById(id);
  }

  create(data: CreateItem): Observable<Item> {
    return this.crud.create(data);
  }

  update(id: string, data: UpdateItem): Observable<Item> {
    return this.crud.update(id, data);
  }

  delete(id: string): Observable<void> {
    return this.crud.delete(id);
  }
}
