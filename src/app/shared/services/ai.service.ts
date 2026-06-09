import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { API_ROUTES } from '@core/constants/api-routes';
import type { ItemSuggestion } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly api = inject(ApiService);

  suggestFromPhotos(files: File[]): Observable<ItemSuggestion> {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    return this.api.upload<ItemSuggestion>(API_ROUTES.AI.ITEM_SUGGESTION, formData);
  }
}
