import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { InventoryStats } from './inventory-stats';
import { InventoriesService } from '../services/inventories.service';
import { ItemsService } from '@features/items/services/items.service';
import { CategoriesStore } from '@shared/stores/categories.store';
import type { Item } from '@shared/models';

describe('InventoryStats', () => {
  let fixture: ComponentFixture<InventoryStats>;
  let component: InventoryStats;
  let inventoriesService: { getById: ReturnType<typeof vi.fn> };
  let itemsService: { getAll: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const mockInventory = { id: 'inv-1', name: 'Test', isPublic: true, userId: 'u1' };
  const mockItems = [
    { id: 'i1', name: 'A', year: 2025, inventoryId: 'inv-1', categoryId: 'c1', coordX: 1, coordY: 2, photos: [{ id: 'p1', itemId: 'i1', url: 'a.jpg', position: 0 }] },
    { id: 'i2', name: 'B', year: 2025, inventoryId: 'inv-1', categoryId: 'c2', photos: [] },
    { id: 'i3', name: 'C', year: 2024, inventoryId: 'inv-1', categoryId: 'c1' },
  ] satisfies Item[];

  beforeEach(async () => {
    inventoriesService = { getById: vi.fn() };
    itemsService = { getAll: vi.fn() };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [InventoryStats],
      providers: [
        { provide: InventoriesService, useValue: inventoriesService },
        { provide: ItemsService, useValue: itemsService },
        { provide: CategoriesStore, useValue: { load: vi.fn(), categories: vi.fn().mockReturnValue([]), categoryMap: vi.fn().mockReturnValue(new Map([['c1', 'Electronics'], ['c2', 'Books']])) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'inv-1' } } } },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryStats);
    component = fixture.componentInstance;
  });

  it('loads inventory and items on init', () => {
    inventoriesService.getById.mockReturnValue(of(mockInventory));
    itemsService.getAll.mockReturnValue(of({ content: mockItems, totalPages: 1, totalElements: 3, number: 0, size: 200 }));

    fixture.detectChanges();

    expect(component.inventory()).toEqual(mockInventory);
    expect(component.items()).toHaveLength(3);
    expect(component.loading()).toBe(false);
  });

  it('computes summary correctly', () => {
    component.items.set(mockItems);
    const s = component.summary();
    expect(s.total).toBe(3);
    expect(s.withPhotos).toBe(1);
    expect(s.withCoords).toBe(1);
    expect(s.categories).toBe(2);
  });

  it('navigates home when id param is missing', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [InventoryStats],
      providers: [
        { provide: InventoriesService, useValue: inventoriesService },
        { provide: ItemsService, useValue: itemsService },
        { provide: CategoriesStore, useValue: { load: vi.fn(), categories: vi.fn().mockReturnValue([]), categoryMap: vi.fn().mockReturnValue(new Map()) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryStats);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
