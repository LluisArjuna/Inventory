import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import type { Item, ItemFilters, Page, Photo } from '@shared/models';

type CreateItem = Omit<Item, 'id'>;
type UpdateItem = Partial<Item>;
type CreatePhoto = Omit<Photo, 'id'>;
type UpdatePhoto = Partial<Photo>;

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/items';

  getAll(filters?: ItemFilters): Observable<Page<Item>> {
    return this.api.get<Page<Item>>(
      this.basePath,
      filters as Record<string, string | number | boolean | undefined>
    );
  }

  getById(id: string): Observable<Item> {
    return this.api.getById<Item>(this.basePath, id);
  }

  create(data: CreateItem): Observable<Item> {
    return this.api.create<Item>(
      this.basePath,
      data as unknown as Record<string, unknown>
    );
  }

  update(id: string, data: UpdateItem): Observable<Item> {
    return this.api.update<Item>(
      this.basePath,
      id,
      data as unknown as Record<string, unknown>
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete(this.basePath, id);
  }

  addPhoto(itemId: string, data: CreatePhoto): Observable<Photo> {
    return this.api.create<Photo>(
      `${this.basePath}/${itemId}/photos`,
      data as unknown as Record<string, unknown>
    );
  }

  updatePhoto(itemId: string, photoId: string, data: UpdatePhoto): Observable<Photo> {
    return this.api.update<Photo>(
      `${this.basePath}/${itemId}/photos`,
      photoId,
      data as unknown as Record<string, unknown>
    );
  }

  deletePhoto(itemId: string, photoId: string): Observable<void> {
    return this.api.delete(`${this.basePath}/${itemId}/photos`, photoId);
  }
}
