import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import type { Inventory, InventoryFilters, Page } from '@shared/models';

type CreateInventory = Omit<Inventory, 'id'>;
type UpdateInventory = Partial<Inventory>;

@Injectable({ providedIn: 'root' })
export class InventoriesService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/inventories';

  getAll(filters?: InventoryFilters): Observable<Page<Inventory>> {
    return this.api.get<Page<Inventory>>(
      this.basePath,
      filters as Record<string, string | number | boolean | undefined>
    );
  }

  getByUserId(userId: string, page = 0, size = 20): Observable<Page<Inventory>> {
    return this.api.get<Page<Inventory>>(`${this.basePath}/user/${userId}`, { page, size });
  }

  getById(id: string): Observable<Inventory> {
    return this.api.getById<Inventory>(this.basePath, id);
  }

  create(data: CreateInventory): Observable<Inventory> {
    return this.api.create<Inventory>(
      this.basePath,
      data as unknown as Record<string, unknown>
    );
  }

  update(id: string, data: UpdateInventory): Observable<Inventory> {
    return this.api.update<Inventory>(
      this.basePath,
      id,
      data as unknown as Record<string, unknown>
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete(this.basePath, id);
  }

  toggleVisibility(id: string, isPublic: boolean): Observable<Inventory> {
    return this.api.update<Inventory>(
      this.basePath,
      id,
      { isPublic } as unknown as Record<string, unknown>
    );
  }
}
