import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { createCrud } from '@core/services/base-crud.service';
import type { Coordinate } from '@shared/models';

@Injectable({ providedIn: 'root' })
export class CoordinatesService {
  private readonly crud = createCrud<Coordinate, { coordX: number; coordY: number }>('/coordinates');

  create(coordX: number, coordY: number): Observable<Coordinate> {
    return this.crud.create({ coordX, coordY });
  }
}
