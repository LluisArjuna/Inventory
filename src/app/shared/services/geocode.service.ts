import { Injectable, inject } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '@core/services/api.service';

interface NominatimAddress {
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    country?: string;
    country_code?: string;
  };
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  boundingbox?: [string, string, string, string];
}

export interface GeocodeResult {
  locationName: string;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

@Injectable({ providedIn: 'root' })
export class GeocodeService {
  private readonly api = inject(ApiService);
  private readonly cache = new Map<string, GeocodeResult>();
  private lastCallTime = 0;

  searchCountry(country: string): Observable<BoundingBox | null> {
    if (!country?.trim()) return of(null);

    const key = `search:${country.trim().toLowerCase()}`;
    const cached = this.cache.get(key) as BoundingBox | undefined;
    if (cached) return of(cached);

    const delay = Math.max(0, 1000 - (Date.now() - this.lastCallTime));

    return timer(delay).pipe(
      switchMap(() =>
        this.api.get<NominatimSearchResult[]>('/geocode/search', { q: country }).pipe(
          tap(() => { this.lastCallTime = Date.now(); }),
          map(results => {
            if (results.length === 0) return null;
            const bb = results[0].boundingbox;
            if (!bb) return null;
            const box: BoundingBox = {
              minLat: parseFloat(bb[0]),
              maxLat: parseFloat(bb[1]),
              minLng: parseFloat(bb[2]),
              maxLng: parseFloat(bb[3])
            };
            this.cache.set(key, box as unknown as GeocodeResult);
            return box;
          })
        )
      )
    );
  }

  reverse(lat: number, lng: number): Observable<GeocodeResult> {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = this.cache.get(key);
    if (cached) return of(cached);

    const delay = Math.max(0, 1000 - (Date.now() - this.lastCallTime));

    return timer(delay).pipe(
      switchMap(() =>
        this.api.get<NominatimAddress>('/geocode/reverse', { lat, lon: lng }).pipe(
          tap(() => { this.lastCallTime = Date.now(); }),
          map(resp => {
            const addr = resp.address;
            const city = addr.city || addr.town || addr.village || addr.county || '';
            const country = addr.country || '';
            const code = addr.country_code?.toUpperCase() || '';
            const parts = [city, code].filter(Boolean);
            const locationName = parts.length > 0
              ? parts.join(', ')
              : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            const result: GeocodeResult = { locationName };
            this.cache.set(key, result);
            return result;
          })
        )
      )
    );
  }
}
