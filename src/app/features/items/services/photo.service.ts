import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { API_ROUTES } from '@core/constants/api-routes';
import type { Photo } from '@shared/models';

type CreatePhoto = Omit<Photo, 'id'>;
type UpdatePhoto = Partial<Photo>;

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly api = inject(ApiService);

  upload(itemId: string, file: File, position: number, altText?: string): Observable<Photo> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('itemId', itemId);
    formData.append('position', String(position));
    formData.append('format', 'webp');
    if (altText) formData.append('altText', altText);
    return this.api.upload<Photo>(API_ROUTES.PHOTOS, formData);
  }

  addPhoto(itemId: string, data: CreatePhoto): Observable<Photo> {
    return this.api.create<Photo>(
      API_ROUTES.ITEMS.PHOTOS(itemId),
      data as unknown as Record<string, unknown>
    );
  }

  updatePhoto(itemId: string, photoId: string, data: UpdatePhoto): Observable<Photo> {
    return this.api.update<Photo>(
      API_ROUTES.ITEMS.PHOTOS(itemId),
      photoId,
      data as unknown as Record<string, unknown>
    );
  }

  deletePhoto(itemId: string, photoId: string): Observable<void> {
    return this.api.delete(API_ROUTES.ITEMS.PHOTOS(itemId), photoId);
  }
}
