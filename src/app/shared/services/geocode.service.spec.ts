import { TestBed } from '@angular/core/testing';
import { GeocodeService } from './geocode.service';
import { ApiService } from '@core/services/api.service';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';

describe('GeocodeService', () => {
  let service: GeocodeService;
  let api: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    api = { get: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        GeocodeService,
        { provide: ApiService, useValue: api },
      ],
    });
    service = TestBed.inject(GeocodeService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('reverse', () => {
    const mockAddress = {
      address: { city: 'Barcelona', country_code: 'es' },
    };

    it('returns cached result on second call with same coords', async () => {
      api.get.mockReturnValue(of(mockAddress));
      const r1 = await firstValueFrom(service.reverse(41.3874, 2.1686));
      expect(r1.locationName).toBe('Barcelona, ES');
      expect(api.get).toHaveBeenCalledTimes(1);

      api.get.mockClear();
      const r2 = await firstValueFrom(service.reverse(41.3874, 2.1686));
      expect(r2.locationName).toBe('Barcelona, ES');
      expect(api.get).not.toHaveBeenCalled();
    });

    it('builds name from city and country code', async () => {
      api.get.mockReturnValue(of(mockAddress));
      const result = await firstValueFrom(service.reverse(41.3874, 2.1686));
      expect(result.locationName).toBe('Barcelona, ES');
    });

    it('falls back to town when city is missing', async () => {
      api.get.mockReturnValue(of({
        address: { town: 'Sitges', country_code: 'es' },
      }));
      const result = await firstValueFrom(service.reverse(41.23, 1.81));
      expect(result.locationName).toBe('Sitges, ES');
    });

    it('falls back to village when city and town are missing', async () => {
      api.get.mockReturnValue(of({
        address: { village: 'Calella', country_code: 'es' },
      }));
      const result = await firstValueFrom(service.reverse(41.61, 2.66));
      expect(result.locationName).toBe('Calella, ES');
    });

    it('fallback to county when no city/town/village', async () => {
      api.get.mockReturnValue(of({
        address: { county: 'Bages', country_code: 'es' },
      }));
      const result = await firstValueFrom(service.reverse(41.78, 1.82));
      expect(result.locationName).toBe('Bages, ES');
    });

    it('uses lat,lng when no address parts are present', async () => {
      api.get.mockReturnValue(of({
        address: {},
      }));
      const result = await firstValueFrom(service.reverse(41.00, 2.00));
      expect(result.locationName).toBe('41.0000, 2.0000');
    });

    it('propagates API errors', async () => {
      api.get.mockReturnValue(throwError(() => new Error('Network error')));
      await expect(firstValueFrom(service.reverse(41.38, 2.16)))
        .rejects.toThrow('Network error');
    });
  });

  describe('searchCountry', () => {
    const mockResults = [
      {
        lat: '41.3874',
        lon: '2.1686',
        boundingbox: ['41.0', '42.0', '1.0', '3.0'] as any,
      },
    ];

    it('returns null for empty input', () => {
      const result = service.searchCountry('');
      let emitted: any;
      result.subscribe(v => emitted = v);
      expect(emitted).toBeNull();
    });

    it('returns null for whitespace input', () => {
      const result = service.searchCountry('   ');
      let emitted: any;
      result.subscribe(v => emitted = v);
      expect(emitted).toBeNull();
    });

    it('returns cached result on repeated search', async () => {
      api.get.mockReturnValue(of(mockResults));
      const r1 = await firstValueFrom(service.searchCountry('Spain'));
      expect(r1).toEqual({ minLat: 41, maxLat: 42, minLng: 1, maxLng: 3 });
      expect(api.get).toHaveBeenCalledTimes(1);

      api.get.mockClear();
      const r2 = await firstValueFrom(service.searchCountry('Spain'));
      expect(r2).toEqual({ minLat: 41, maxLat: 42, minLng: 1, maxLng: 3 });
      expect(api.get).not.toHaveBeenCalled();
    });

    it('cache is case-insensitive', async () => {
      api.get.mockReturnValue(of(mockResults));
      await firstValueFrom(service.searchCountry('Spain'));
      api.get.mockClear();
      const r2 = await firstValueFrom(service.searchCountry('spain'));
      expect(r2).not.toBeNull();
      expect(api.get).not.toHaveBeenCalled();
    });

    it('returns null when API returns empty array', async () => {
      api.get.mockReturnValue(of([]));
      const result = await firstValueFrom(service.searchCountry('Atlantis'));
      expect(result).toBeNull();
    });

    it('returns null when result has no boundingbox', async () => {
      api.get.mockReturnValue(of([{ lat: '0', lon: '0' }]));
      const result = await firstValueFrom(service.searchCountry('Nowhere'));
      expect(result).toBeNull();
    });
  });

  describe('rate limiting', () => {
    it('enforces minimum 1-second delay between API calls', async () => {
      vi.useFakeTimers();
      const mockAddr = { address: { city: 'Barcelona', country_code: 'es' } };
      api.get.mockReturnValue(of(mockAddr));

      const p1 = firstValueFrom(service.reverse(41.38, 2.16));
      vi.advanceTimersByTime(1500);
      await p1;
      expect(api.get).toHaveBeenCalledTimes(1);

      api.get.mockClear();
      const p2 = firstValueFrom(service.reverse(40.41, -3.70));
      expect(api.get).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      await p2;
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('batchReverse', () => {
    const mockAddr = { address: { city: 'Barcelona', country_code: 'es' } };

    it('filters items without coordinates', async () => {
      api.get.mockReturnValue(of(mockAddr));
      const items = [
        { id: 'a', coordX: 41.38, coordY: 2.16 },
        { id: 'b', coordX: null, coordY: null },
        { id: 'c' },
      ];
      const map = await firstValueFrom(service.batchReverse(items));
      expect(map.size).toBe(1);
      expect(map.get('a')).toBe('Barcelona, ES');
    });

    it('returns empty map when no items have coordinates', async () => {
      const items = [
        { id: 'a', coordX: null, coordY: null },
        { id: 'b' },
      ];
      const map = await firstValueFrom(service.batchReverse(items));
      expect(map.size).toBe(0);
      expect(api.get).not.toHaveBeenCalled();
    });

    it('aggregates results into a Map by item id', async () => {
      api.get
        .mockReturnValueOnce(of({ address: { city: 'Barcelona', country_code: 'es' } }))
        .mockReturnValueOnce(of({ address: { city: 'Madrid', country_code: 'es' } }));

      const items = [
        { id: 'a', coordX: 41.38, coordY: 2.16 },
        { id: 'b', coordX: 40.41, coordY: -3.70 },
      ];
      const map = await firstValueFrom(service.batchReverse(items));
      expect(map.size).toBe(2);
      expect(map.get('a')).toBe('Barcelona, ES');
      expect(map.get('b')).toBe('Madrid, ES');
    });

    it('returns empty map for empty input', async () => {
      const map = await firstValueFrom(service.batchReverse([]));
      expect(map.size).toBe(0);
      expect(api.get).not.toHaveBeenCalled();
    });
  });
});
