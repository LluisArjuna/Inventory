import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EditItem } from './edit-item';
import { ItemsService } from '../services/items.service';
import { CategoriesStore } from '@shared/stores/categories.store';
import { CoordinatesService } from '../services/coordinates.service';
import { PhotoService } from '../services/photo.service';
import { GeocodeService } from '@shared/services/geocode.service';
import { MapService } from '@shared/services/map.service';
import { ToastService } from '@shared/services/toast.service';

describe('EditItem', () => {
  let fixture: ComponentFixture<EditItem>;
  let component: EditItem;
  let itemsService: { getById: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  let coordinatesService: { create: ReturnType<typeof vi.fn> };
  let photoService: { upload: ReturnType<typeof vi.fn> };
  let categoriesStore: { categories: ReturnType<typeof vi.fn>; load: ReturnType<typeof vi.fn>; categoryMap: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  const mockItem = {
    id: 'item-1',
    name: 'Test Item',
    description: 'A test item',
    year: 2025,
    inventoryId: 'inv-1',
    categoryId: 'c1',
    coordX: 41.3874,
    coordY: 2.1686,
    coordinateId: 'coord-1',
    photos: [],
  };

  beforeEach(async () => {
    itemsService = { getById: vi.fn(), update: vi.fn() };
    coordinatesService = { create: vi.fn() };
    photoService = { upload: vi.fn() };
    categoriesStore = {
      categories: vi.fn().mockReturnValue([{ id: 'c1', name: 'Electronics' }]),
      load: vi.fn(),
      categoryMap: vi.fn().mockReturnValue(new Map()),
    };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [EditItem],
      providers: [
        { provide: ItemsService, useValue: itemsService },
        { provide: CategoriesStore, useValue: categoriesStore },
        { provide: CoordinatesService, useValue: coordinatesService },
        { provide: PhotoService, useValue: photoService },
        { provide: GeocodeService, useValue: { reverse: vi.fn().mockReturnValue(of({ locationName: 'Test' })) } },
        { provide: MapService, useValue: { createMap: vi.fn(), addMarker: vi.fn(), removeMarker: vi.fn() } },
        { provide: ToastService, useValue: { error: vi.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'item-1' } } } },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditItem);
    component = fixture.componentInstance;
  });

  it('populates form signals on successful load', () => {
    itemsService.getById.mockReturnValue(of(mockItem));
    fixture.detectChanges();

    expect(component.name()).toBe('Test Item');
    expect(component.description()).toBe('A test item');
    expect(component.year()).toBe(2025);
    expect(component.selectedCategory()?.id).toBe('c1');
    expect(component.loading()).toBe(false);
  });

  it('navigates to my-inventories when id param is missing', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [EditItem],
      providers: [
        { provide: ItemsService, useValue: itemsService },
        { provide: CategoriesStore, useValue: categoriesStore },
        { provide: CoordinatesService, useValue: coordinatesService },
        { provide: PhotoService, useValue: photoService },
        { provide: GeocodeService, useValue: { reverse: vi.fn().mockReturnValue(of({ locationName: 'Test' })) } },
        { provide: MapService, useValue: { createMap: vi.fn(), addMarker: vi.fn(), removeMarker: vi.fn() } },
        { provide: ToastService, useValue: { error: vi.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditItem);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/my-inventories']);
  });

  it('canSave returns false when required fields are missing', () => {
    component.name.set('');
    component.year.set(2025);
    component.selectedCategory.set({ id: 'c1', name: 'E' });
    expect(component.canSave()).toBe(false);

    component.name.set('Valid');
    component.year.set(null);
    expect(component.canSave()).toBe(false);

    component.year.set(2025);
    component.selectedCategory.set(null);
    expect(component.canSave()).toBe(false);
  });

  it('canSave returns true when all required fields are set', () => {
    component.name.set('Valid');
    component.year.set(2025);
    component.selectedCategory.set({ id: 'c1', name: 'E' });
    component.saving.set(false);
    expect(component.canSave()).toBe(true);
  });

  it('saves and uploads photo when file is selected', () => {
    itemsService.getById.mockReturnValue(of(mockItem));
    itemsService.update.mockReturnValue(of({ ...mockItem }));
    photoService.upload.mockReturnValue(of({ id: 'p1', url: 'img.jpg', itemId: 'item-1', position: 0 }));

    fixture.detectChanges();

    const file = new File([''], 'photo.jpg');
    component.selectedFile.set(file);
    component.save();

    expect(itemsService.update).toHaveBeenCalledWith('item-1', expect.objectContaining({
      name: 'Test Item',
      year: 2025,
      coordinateId: 'coord-1',
    }));
    expect(photoService.upload).toHaveBeenCalledWith('item-1', file, 0);
  });
});
