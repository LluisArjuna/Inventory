import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ItemDetail } from './item-detail';
import { ItemsService } from '../services/items.service';
import { CategoriesStore } from '@shared/stores/categories.store';
import { GeocodeService } from '@shared/services/geocode.service';
import { MapService } from '@shared/services/map.service';
import { ToastService } from '@shared/services/toast.service';

describe('ItemDetail', () => {
  let fixture: ComponentFixture<ItemDetail>;
  let component: ItemDetail;
  let itemsService: { getById: ReturnType<typeof vi.fn> };
  let categoriesStore: { categories: ReturnType<typeof vi.fn>; load: ReturnType<typeof vi.fn>; categoryMap: ReturnType<typeof vi.fn> };
  let geocode: { reverse: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const mockItem = {
    id: 'item-1',
    name: 'Test Item',
    description: 'A test',
    year: 2025,
    inventoryId: 'inv-1',
    categoryId: 'c1',
    coordX: 41.3874,
    coordY: 2.1686,
    photos: [{ id: 'p1', url: 'photo.jpg', itemId: 'item-1', position: 0 }],
  };

  beforeEach(async () => {
    itemsService = { getById: vi.fn() };
    categoriesStore = {
      categories: vi.fn().mockReturnValue([{ id: 'c1', name: 'Electronics' }]),
      load: vi.fn(),
      categoryMap: vi.fn().mockReturnValue(new Map()),
    };
    geocode = { reverse: vi.fn() };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ItemDetail],
      providers: [
        { provide: ItemsService, useValue: itemsService },
        { provide: CategoriesStore, useValue: categoriesStore },
        { provide: GeocodeService, useValue: geocode },
        { provide: MapService, useValue: { createMap: vi.fn(), addMarker: vi.fn() } },
        { provide: ToastService, useValue: { error: vi.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'item-1' } } } },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetail);
    component = fixture.componentInstance;
  });

  it('sets item signal on successful load', () => {
    itemsService.getById.mockReturnValue(of(mockItem));
    geocode.reverse.mockReturnValue(of({ locationName: 'Barcelona, ES' }));
    fixture.detectChanges();

    expect(component.item()).toEqual(mockItem);
    expect(component.categoryName()).toBe('Electronics');
    expect(component.selectedPhoto()).toBe('photo.jpg');
    expect(component.loading()).toBe(false);
  });

  it('navigates home when id param is missing', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ItemDetail],
      providers: [
        { provide: ItemsService, useValue: itemsService },
        { provide: CategoriesStore, useValue: categoriesStore },
        { provide: GeocodeService, useValue: geocode },
        { provide: MapService, useValue: { createMap: vi.fn(), addMarker: vi.fn() } },
        { provide: ToastService, useValue: { error: vi.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetail);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('navigates home on fetch error', () => {
    itemsService.getById.mockReturnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('calls geocode when item has coordinates', () => {
    itemsService.getById.mockReturnValue(of(mockItem));
    geocode.reverse.mockReturnValue(of({ locationName: 'Barcelona, ES' }));
    fixture.detectChanges();

    expect(geocode.reverse).toHaveBeenCalledWith(41.3874, 2.1686);
    expect(component.locationName()).toBe('Barcelona, ES');
  });
});
