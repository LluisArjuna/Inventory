import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import type { Coordinate } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class CoordinatesService {
  private readonly api = inject(ApiService);

  create(coordX: number, coordY: number): Observable<Coordinate> {
    return this.api.create<Coordinate>(
      '/coordinates',
      { coordX, coordY } as unknown as Record<string, unknown>
    );
  }
}
