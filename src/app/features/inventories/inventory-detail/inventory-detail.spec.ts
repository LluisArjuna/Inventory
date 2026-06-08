import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { InventoryDetail } from './inventory-detail';
import { AuthService } from '@core/services/auth.service';
import { InventoriesService } from '../services/inventories.service';
import { ItemsService } from '@features/items/services/items.service';
import { CategoriesStore } from '@shared/stores/categories.store';
import { GeocodeService } from '@shared/services/geocode.service';
import { signal } from '@angular/core';

describe('InventoryDetail', () => {
  let fixture: ComponentFixture<InventoryDetail>;
  let component: InventoryDetail;
  let inventoriesService: { getById: ReturnType<typeof vi.fn>; getAvailabilities: ReturnType<typeof vi.fn> };
  let itemsService: { getAll: ReturnType<typeof vi.fn> };
  let auth: { currentUser: ReturnType<typeof signal> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const mockInventory = { id: 'inv-1', name: 'Test', isPublic: true, userId: 'u1' };
  const mockAvailabilities = [{ startDate: '2026-01-01', endDate: '2026-01-07' }];
  const mockPage = { content: [], totalPages: 0, totalElements: 0, number: 0, size: 20 };

  beforeEach(async () => {
    inventoriesService = {
      getById: vi.fn(),
      getAvailabilities: vi.fn(),
    };
    itemsService = { getAll: vi.fn() };
    auth = { currentUser: signal(null) };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [InventoryDetail],
      providers: [
        { provide: InventoriesService, useValue: inventoriesService },
        { provide: ItemsService, useValue: itemsService },
        { provide: CategoriesStore, useValue: { load: vi.fn(), categories: vi.fn().mockReturnValue([]), categoryMap: vi.fn().mockReturnValue(new Map()) } },
        { provide: GeocodeService, useValue: { batchReverse: vi.fn().mockReturnValue(of(new Map())) } },
        { provide: AuthService, useValue: auth },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'inv-1' } } } },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryDetail);
    component = fixture.componentInstance;
  });

  it('loads inventory, availabilities, and items on init', () => {
    inventoriesService.getById.mockReturnValue(of(mockInventory));
    inventoriesService.getAvailabilities.mockReturnValue(of(mockAvailabilities));
    itemsService.getAll.mockReturnValue(of(mockPage));

    fixture.detectChanges();

    expect(component.inventory()?.name).toBe('Test');
    expect(component.availabilities()).toEqual(mockAvailabilities);
    expect(itemsService.getAll).toHaveBeenCalledWith(0, 20, { inventoryId: 'inv-1' });
    expect(component.loading()).toBe(false);
  });

  it('navigates home when id param is missing', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [InventoryDetail],
      providers: [
        { provide: InventoriesService, useValue: inventoriesService },
        { provide: ItemsService, useValue: itemsService },
        { provide: CategoriesStore, useValue: { load: vi.fn(), categories: vi.fn().mockReturnValue([]), categoryMap: vi.fn().mockReturnValue(new Map()) } },
        { provide: GeocodeService, useValue: { batchReverse: vi.fn().mockReturnValue(of(new Map())) } },
        { provide: AuthService, useValue: auth },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryDetail);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('shows failed message when user is authenticated', () => {
    auth.currentUser = signal({ id: 'u1', email: 'test@test.com' });
    inventoriesService.getById.mockReturnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();

    expect(component.error()).toBe('Failed to load inventory');
  });

  it('shows sign-in prompt when user is not authenticated', () => {
    auth.currentUser = signal(null);
    inventoriesService.getById.mockReturnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();

    expect(component.error()).toBe('Sign in to view this inventory');
  });
});
