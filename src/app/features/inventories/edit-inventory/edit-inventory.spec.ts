import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EditInventory } from './edit-inventory';
import { InventoriesService } from '../services/inventories.service';
import { ItemsService } from '@features/items/services/items.service';
import { CategoriesStore } from '@shared/stores/categories.store';
import { GeocodeService } from '@shared/services/geocode.service';

describe('EditInventory', () => {
  let fixture: ComponentFixture<EditInventory>;
  let component: EditInventory;
  let inventoriesService: { getById: ReturnType<typeof vi.fn>; getAvailabilities: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; setAvailabilities: ReturnType<typeof vi.fn> };
  let itemsService: { getAll: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const mockInventory = { id: 'inv-1', name: 'Test', description: 'Desc', isPublic: true, userId: 'u1' };
  const mockAvailabilities = [{ startDate: '2026-01-01', endDate: '2026-01-07' }];
  const mockPage = { content: [], totalPages: 0, totalElements: 0, number: 0, size: 20 };

  beforeEach(async () => {
    inventoriesService = {
      getById: vi.fn(),
      getAvailabilities: vi.fn(),
      update: vi.fn(),
      setAvailabilities: vi.fn(),
    };
    itemsService = { getAll: vi.fn(), delete: vi.fn() };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [EditInventory],
      providers: [
        { provide: InventoriesService, useValue: inventoriesService },
        { provide: ItemsService, useValue: itemsService },
        { provide: CategoriesStore, useValue: { load: vi.fn(), categories: vi.fn().mockReturnValue([]), categoryMap: vi.fn().mockReturnValue(new Map()) } },
        { provide: GeocodeService, useValue: { batchReverse: vi.fn().mockReturnValue(of(new Map())) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'inv-1' } } } },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditInventory);
    component = fixture.componentInstance;
  });

  it('loads inventory and populates form signals on init', () => {
    inventoriesService.getById.mockReturnValue(of(mockInventory));
    inventoriesService.getAvailabilities.mockReturnValue(of(mockAvailabilities));
    itemsService.getAll.mockReturnValue(of(mockPage));

    fixture.detectChanges();

    expect(component.inventory()).toEqual(mockInventory);
    expect(component.name()).toBe('Test');
    expect(component.description()).toBe('Desc');
    expect(component.isPublic()).toBe(true);
    expect(component.availabilities()).toEqual(mockAvailabilities);
    expect(component.loading()).toBe(false);
  });

  it('navigates to my-inventories when id param is missing', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [EditInventory],
      providers: [
        { provide: InventoriesService, useValue: inventoriesService },
        { provide: ItemsService, useValue: itemsService },
        { provide: CategoriesStore, useValue: { load: vi.fn(), categories: vi.fn().mockReturnValue([]), categoryMap: vi.fn().mockReturnValue(new Map()) } },
        { provide: GeocodeService, useValue: { batchReverse: vi.fn().mockReturnValue(of(new Map())) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditInventory);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/my-inventories']);
  });

  it('saves via update then setAvailabilities and navigates on success', () => {
    inventoriesService.getById.mockReturnValue(of(mockInventory));
    inventoriesService.getAvailabilities.mockReturnValue(of(mockAvailabilities));
    itemsService.getAll.mockReturnValue(of(mockPage));
    const updated = { ...mockInventory, name: 'Renamed' };
    inventoriesService.update.mockReturnValue(of(updated));
    inventoriesService.setAvailabilities.mockReturnValue(of([]));

    fixture.detectChanges();
    component.name.set('Renamed');
    component.save();

    expect(inventoriesService.update).toHaveBeenCalledWith('inv-1', {
      name: 'Renamed', description: 'Desc', isPublic: true,
    });
    expect(inventoriesService.setAvailabilities).toHaveBeenCalledWith('inv-1', mockAvailabilities);
    expect(router.navigate).toHaveBeenCalledWith(['/my-inventories']);
  });

  it('does not save when name is empty', () => {
    component.name.set('');
    component.save();

    expect(inventoriesService.update).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('deletes item and removes it from the list', () => {
    const items = [{ id: 'item-1', name: 'A', year: 2025, inventoryId: 'inv-1', categoryId: 'c1' }];
    component.items.set(items);
    itemsService.delete.mockReturnValue(of(undefined));

    component.deleteItem('item-1');
    expect(component.showDeleteConfirm()).toBe(true);
    expect(component.pendingDeleteId()).toBe('item-1');

    component.confirmDelete();
    expect(itemsService.delete).toHaveBeenCalledWith('item-1');
    expect(component.items()).toEqual([]);
  });

  it('reloads items when filters change', () => {
    inventoriesService.getById.mockReturnValue(of(mockInventory));
    inventoriesService.getAvailabilities.mockReturnValue(of(mockAvailabilities));
    itemsService.getAll.mockReturnValue(of(mockPage));

    fixture.detectChanges();
    itemsService.getAll.mockClear();

    component.onFilterChange({ name: 'test' });
    expect(component.filters()).toEqual({ name: 'test' });
    expect(itemsService.getAll).toHaveBeenCalledWith(0, 20, { inventoryId: 'inv-1', name: 'test' });
  });
});
