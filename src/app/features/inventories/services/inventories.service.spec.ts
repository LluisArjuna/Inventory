import { TestBed } from '@angular/core/testing';
import { InventoriesService } from './inventories.service';
import { ApiService } from '@core/services/api.service';
import { of } from 'rxjs';

describe('InventoriesService', () => {
  let service: InventoriesService;
  let api: { [K in keyof ApiService]: ReturnType<typeof vi.fn> };

  const mockPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 20,
  };

  beforeEach(() => {
    api = {
      get: vi.fn().mockReturnValue(of(mockPage)),
      getById: vi.fn().mockReturnValue(of({})),
      create: vi.fn().mockReturnValue(of({})),
      update: vi.fn().mockReturnValue(of({})),
      put: vi.fn().mockReturnValue(of([])),
      delete: vi.fn().mockReturnValue(of(undefined)),
      upload: vi.fn().mockReturnValue(of({})),
    };
    TestBed.configureTestingModule({
      providers: [
        InventoriesService,
        { provide: ApiService, useValue: api },
      ],
    });
    service = TestBed.inject(InventoriesService);
  });

  describe('public inventories', () => {
    it('getPublic calls GET on PUBLIC route with params', () => {
      service.getPublic(0, 10, { name: 'test' }).subscribe();
      expect(api.get).toHaveBeenCalledWith('/inventories/public', {
        page: 0, size: 10, name: 'test',
      });
    });
  });

  describe('user inventories', () => {
    it('getByUserId calls GET on BY_USER route with page and size', () => {
      service.getByUserId('user-1', 0, 10).subscribe();
      expect(api.get).toHaveBeenCalledWith('/inventories/user/user-1', {
        page: 0, size: 10,
      });
    });
  });

  describe('visibility', () => {
    it('toggleVisibility sends PUT with isPublic payload', () => {
      service.toggleVisibility('inv-1', true).subscribe();
      expect(api.update).toHaveBeenCalledWith('/inventories', 'inv-1', { isPublic: true });
    });
  });

  describe('availabilities', () => {
    it('getAvailabilities calls GET on AVAILABILITIES route', () => {
      service.getAvailabilities('inv-1').subscribe();
      expect(api.get).toHaveBeenCalledWith('/inventories/inv-1/availabilities');
    });

    it('setAvailabilities calls PUT on AVAILABILITIES route with payload', () => {
      const ranges = [{ startDate: '2026-01-01', endDate: '2026-01-07' }];
      service.setAvailabilities('inv-1', ranges).subscribe();
      expect(api.put).toHaveBeenCalledWith('/inventories/inv-1/availabilities', {
        availabilities: ranges,
      });
    });
  });

  describe('CRUD delegation', () => {
    it('getAll delegates to api.get via crud', () => {
      service.getAll(1, 30, { isPublic: true }).subscribe();
      expect(api.get).toHaveBeenCalledWith('/inventories', {
        page: 1, size: 30, isPublic: true,
      });
    });

    it('getById delegates', () => {
      service.getById('inv-1').subscribe();
      expect(api.getById).toHaveBeenCalledWith('/inventories', 'inv-1');
    });

    it('create delegates', () => {
      const data = { name: 'New', isPublic: false, firebaseUid: 'uid' };
      service.create(data).subscribe();
      expect(api.create).toHaveBeenCalledWith('/inventories', data);
    });

    it('update delegates', () => {
      const data = { name: 'Renamed' };
      service.update('inv-1', data).subscribe();
      expect(api.update).toHaveBeenCalledWith('/inventories', 'inv-1', data);
    });

    it('delete delegates', () => {
      service.delete('inv-1').subscribe();
      expect(api.delete).toHaveBeenCalledWith('/inventories', 'inv-1');
    });
  });
});
