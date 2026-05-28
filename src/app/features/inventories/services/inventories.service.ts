import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { createCrud } from '@core/services/base-crud.service';
import type { Inventory, CreateInventoryRequest, Page } from '@shared/models';

type UpdateInventory = Partial<Inventory>;

@Injectable({ providedIn: 'root' })
export class InventoriesService {
  private readonly api = inject(ApiService);
  private readonly crud = createCrud<Inventory, CreateInventoryRequest, UpdateInventory>('/inventories');

  getAll(page = 0, size = 20, filters?: Record<string, string | number | boolean | undefined>): Observable<Page<Inventory>> {
    return this.crud.getAll(page, size, filters);
  }

  getPublic(page = 0, size = 20): Observable<Page<Inventory>> {
    return this.api.get<Page<Inventory>>('/inventories/public', { page, size });
  }

  getByUserId(userId: string, page = 0, size = 20): Observable<Page<Inventory>> {
    return this.api.get<Page<Inventory>>(`/inventories/user/${userId}`, { page, size });
  }

  getById(id: string): Observable<Inventory> {
    return this.crud.getById(id);
  }

  create(data: CreateInventoryRequest): Observable<Inventory> {
    return this.crud.create(data);
  }

  update(id: string, data: UpdateInventory): Observable<Inventory> {
    return this.crud.update(id, data);
  }

  delete(id: string): Observable<void> {
    return this.crud.delete(id);
  }

  toggleVisibility(id: string, isPublic: boolean): Observable<Inventory> {
    return this.api.update<Inventory>('/inventories', id, { isPublic } as unknown as Record<string, unknown>);
  }
}
